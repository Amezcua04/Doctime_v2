<?php

namespace App\Console\Commands;

use App\Mail\PatientRetentionMail;
use App\Models\ClinicSetting;
use App\Models\Patient;
use App\Services\ReminderService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

#[Signature('patients:notify-inactive')]
#[Description('Notifica a los pacientes que no han asistido en 3 meses o más.')]
class NotifyInactivePatients extends Command
{
    public function handle()
    {
        $this->info('Iniciando búsqueda de pacientes inactivos...');

        $threeMonthsAgo = now()->subMonths(3);
        $settings = ClinicSetting::first();

        $inactivePatients = Patient::whereHas('appointments')
            ->whereDoesntHave('appointments', function ($query) use ($threeMonthsAgo) {
                $query->whereDate('start_time', '>=', $threeMonthsAgo);
            })
            ->get();

        if ($inactivePatients->isEmpty()) {
            $this->info('No se encontraron pacientes inactivos hoy.');
            return;
        }

        $this->info("Se encontraron {$inactivePatients->count()} pacientes. Iniciando envíos...");

        $reminderService = new ReminderService();
        $clinicName = $settings->name ?? 'Sunrise';

        $stats = [
            'total_processed' => $inactivePatients->count(),
            'success_whatsapp' => 0,
            'success_email' => 0,
            'failed_all' => 0
        ];

        foreach ($inactivePatients as $patient) {
            $firstName = explode(' ', trim($patient->name))[0];
            $message = "¡Hola {$firstName}! 👋\n\nTe saludamos de {$clinicName}. Notamos que hace tiempo no nos visitas. Cuidar de tu salud es muy importante para nosotros.\n\n¿Te gustaría agendar una cita de revisión este mes? Responde a este mensaje para ayudarte con los horarios disponibles. 🦷✨";

            $whatsappEnviado = false;

            if ($settings && $settings->enable_whatsapp_reminders && !empty($patient->phone)) {
                try {
                    $whatsappEnviado = $reminderService->sendWhatsAppText($patient->phone, $message, $settings);

                    if ($whatsappEnviado) {
                        $this->line("Notificación enviada a: {$patient->name} (vía WhatsApp)");
                        $stats['success_whatsapp']++;

                        activity('reminders')
                            ->performedOn($patient)
                            ->event('whatsapp_retention_success')
                            ->withProperties(['channel' => 'whatsapp', 'target' => $patient->phone])
                            ->log("Campaña de retención enviada por WhatsApp.");
                    } else {
                        $stats['failed_all']++;
                    }
                } catch (\Exception $e) {
                    Log::error("Error WhatsApp retención (Paciente {$patient->id}): " . $e->getMessage());
                    $stats['failed_all']++;

                    activity('reminders')
                        ->performedOn($patient)
                        ->event('whatsapp_retention_failed')
                        ->withProperties(['channel' => 'whatsapp', 'target' => $patient->phone, 'error' => $e->getMessage()])
                        ->log("Fallo de red al enviar WhatsApp de retención.");
                }
            }

            if (!$whatsappEnviado && $settings && $settings->enable_email_reminders && !empty($patient->email)) {
                try {
                    Mail::to($patient->email)->send(new PatientRetentionMail($patient, $settings));

                    $this->line("Notificación enviada a: {$patient->name} (vía Email)");
                    $stats['success_email']++;

                    activity('reminders')
                        ->performedOn($patient)
                        ->event('email_retention_success')
                        ->withProperties(['channel' => 'email', 'target' => $patient->email])
                        ->log("Campaña de retención enviada por Correo.");
                } catch (\Exception $e) {
                    Log::error("Error Email retención (Paciente {$patient->id}): " . $e->getMessage());
                    $stats['failed_all']++;

                    activity('reminders')
                        ->performedOn($patient)
                        ->event('email_retention_failed')
                        ->withProperties(['channel' => 'email', 'target' => $patient->email, 'error' => $e->getMessage()])
                        ->log("Error de servidor SMTP al enviar correo de retención.");
                }
            } elseif (!$whatsappEnviado) {
                $stats['failed_all']++;
            }

            sleep(1);
        }

        activity('system_jobs')
            ->event('cron_patient_retention')
            ->withProperties([
                'params' => [
                    'months_inactive_threshold' => 3
                ],
                'metrics' => $stats
            ])
            ->log("El Cron Job de retención finalizó. Notificados: " . ($stats['success_whatsapp'] + $stats['success_email']) . ", Errores: {$stats['failed_all']}");

        $this->info("Proceso terminado. Se notificó exitosamente.");
    }
}

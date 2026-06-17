<?php

namespace App\Console\Commands;

use App\Models\Appointment;
use App\Models\ClinicSetting;
use App\Services\ReminderService;
use Carbon\Carbon;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

#[Signature('appointments:send-reminders')]
#[Description('Verifica y envía recordatorios de citas por email y WhatsApp')]
class SendReminders extends Command
{

    public function handle(ReminderService $reminderService)
    {
        $settings = ClinicSetting::first();

        if (!$settings || (!$settings->enable_email_reminders && !$settings->enable_whatsapp_reminders)) {
            $this->warn("Los recordatorios están desactivados en la configuración de la clínica.");
            return;
        }

        $horasAnticipacion = $settings->reminder_hours_before ?? 24;
        $fechaObjetivo = Carbon::now()->addHours($horasAnticipacion);

        $this->info("Buscando citas programadas para: " . $fechaObjetivo->format('d/m/Y H:i'));

        $appointments = Appointment::whereIn('status', ['scheduled'])
            ->whereBetween('start_time', [
                $fechaObjetivo->copy()->startOfMinute(),
                $fechaObjetivo->copy()->endOfMinute()
            ])
            ->get();

        if ($appointments->isEmpty()) {
            $this->info("No hay citas pendientes de recordatorio para esta ventana de tiempo.");
            return;
        }

        $stats = [
            'total_processed' => $appointments->count(),
            'success_whatsapp' => 0,
            'success_email' => 0,
            'failed_all' => 0
        ];

        foreach ($appointments as $appointment) {
            try {
                $patientName = $appointment->patient->name ?? 'Paciente desconocido';
                $this->info("Procesando: {$patientName} (Cita: {$appointment->start_time->format('H:i')})");

                $resultados = $reminderService->send($appointment);

                if ($resultados['whatsapp']) {
                    $this->line("   -> ✅ WhatsApp enviado exitosamente (Email omitido).");
                    $stats['success_whatsapp']++;
                } elseif ($resultados['email']) {
                    $this->line("   -> ⚠️ WhatsApp no disponible/falló. ✅ Email enviado como respaldo.");
                    $stats['success_email']++;
                } else {
                    $this->line("   -> ❌ Fallo total. No se pudo contactar al paciente.");
                    $stats['failed_all']++;
                }

                sleep(1);
            } catch (\Exception $e) {
                Log::error("Fallo general en recordatorio de cita {$appointment->id}: " . $e->getMessage());
                $this->error("Error con la cita {$appointment->id}: " . $e->getMessage());
                $stats['failed_all']++;
            }
        }

        activity('system_jobs')
            ->event('cron_send_reminders')
            ->withProperties([
                'params' => [
                    'target_time' => $fechaObjetivo->toDateTimeString(),
                    'hours_before' => $horasAnticipacion
                ],
                'metrics' => $stats
            ])
            ->log("El Cron Job de recordatorios diarios finalizó. Procesados: {$stats['total_processed']}, Errores: {$stats['failed_all']}");

        $this->info("✅ Proceso terminado. Se procesaron {$stats['total_processed']} recordatorios.");
    }
}

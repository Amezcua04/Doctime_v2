<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Activitylog\Models\Activity;

class RemindersAuditSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $diasSimulados = 7;
        $nombres = ['Carlos', 'Eduardo', 'María', 'José', 'Ana', 'Luis', 'Sofía', 'Fernando'];

        for ($i = $diasSimulados; $i >= 0; $i--) {
            $fecha = Carbon::now()->subDays($i);

            // ==========================================
            // 1. SIMULAR CRON JOBS (system_jobs)
            // ==========================================

            // Cron Job Diario: Recordatorios
            $totalProcesados = rand(10, 25);
            $fallos = rand(0, 3);
            $exitosMail = rand(1, 5);
            $exitosWa = $totalProcesados - $fallos - $exitosMail;

            Activity::create([
                'log_name' => 'system_jobs',
                'description' => "El Cron Job de recordatorios diarios finalizó. Procesados: {$totalProcesados}, Errores: {$fallos}",
                'event' => 'cron_send_reminders',
                'properties' => [
                    'params' => [
                        'target_time' => $fecha->copy()->addDay()->toDateTimeString(),
                        'hours_before' => 24
                    ],
                    'metrics' => [
                        'total_processed' => $totalProcesados,
                        'success_whatsapp' => $exitosWa,
                        'success_email' => $exitosMail,
                        'failed_all' => $fallos
                    ]
                ],
                'created_at' => $fecha->copy()->setTime(8, 0, 0),
                'updated_at' => $fecha->copy()->setTime(8, 0, 0),
            ]);

            // Cron Job Semanal: Retención (Solo domingos simulados)
            if ($fecha->isSunday()) {
                Activity::create([
                    'log_name' => 'system_jobs',
                    'description' => "El Cron Job de retención finalizó. Notificados: 15, Errores: 1",
                    'event' => 'cron_patient_retention',
                    'properties' => [
                        'params' => ['months_inactive_threshold' => 3],
                        'metrics' => [
                            'total_processed' => 16,
                            'success_whatsapp' => 12,
                            'success_email' => 3,
                            'failed_all' => 1
                        ]
                    ],
                    'created_at' => $fecha->copy()->setTime(9, 0, 0),
                    'updated_at' => $fecha->copy()->setTime(9, 0, 0),
                ]);
            }

            // ==========================================
            // 2. SIMULAR ENVÍOS INDIVIDUALES (reminders)
            // ==========================================

            // Generar algunos registros exitosos de WhatsApp
            for ($j = 0; $j < rand(3, 6); $j++) {
                $paciente = $nombres[array_rand($nombres)];
                $telefono = '5233' . rand(10000000, 99999999); // Lada GDL simulada

                Activity::create([
                    'log_name' => 'reminders',
                    'description' => "Plantilla de recordatorio entregada a {$paciente}",
                    'event' => 'whatsapp_success',
                    'subject_type' => 'App\Models\Appointment', // Sujeto polimórfico
                    'subject_id' => rand(1, 50),
                    'properties' => [
                        'channel' => 'whatsapp',
                        'target' => $telefono,
                    ],
                    'created_at' => $fecha->copy()->setTime(8, rand(1, 15), rand(0, 59)),
                    'updated_at' => $fecha->copy()->setTime(8, rand(1, 15), rand(0, 59)),
                ]);
            }

            // Generar al menos 1 o 2 fallos de WhatsApp para probar el Modal JSON
            for ($k = 0; $k < rand(1, 2); $k++) {
                $paciente = $nombres[array_rand($nombres)];

                Activity::create([
                    'log_name' => 'reminders',
                    'description' => "Error de Meta al enviar plantilla a {$paciente}",
                    'event' => 'whatsapp_failed',
                    'subject_type' => 'App\Models\Appointment',
                    'subject_id' => rand(1, 50),
                    'properties' => [
                        'channel' => 'whatsapp',
                        'target' => '523300000000',
                        'error_message' => [
                            'error' => [
                                'message' => 'Authentication Error',
                                'code' => 190,
                                'type' => 'OAuthException',
                                'error_subcode' => 463,
                                'fbtrace_id' => 'A' . rand(10000, 99999) . 'cv8l4DEK'
                            ],
                            'suggestion' => 'El token de acceso de Meta expiró o es inválido.'
                        ]
                    ],
                    'created_at' => $fecha->copy()->setTime(8, rand(16, 20), rand(0, 59)),
                    'updated_at' => $fecha->copy()->setTime(8, rand(16, 20), rand(0, 59)),
                ]);
            }

            // Generar envíos de rescate por Email
            for ($l = 0; $l < rand(1, 3); $l++) {
                $paciente = $nombres[array_rand($nombres)];

                Activity::create([
                    'log_name' => 'reminders',
                    'description' => "Correo de rescate enviado exitosamente a {$paciente}",
                    'event' => 'email_success',
                    'subject_type' => 'App\Models\Appointment',
                    'subject_id' => rand(1, 50),
                    'properties' => [
                        'channel' => 'email',
                        'target' => strtolower($paciente) . rand(10, 99) . '@gmail.com',
                    ],
                    'created_at' => $fecha->copy()->setTime(8, rand(21, 30), rand(0, 59)),
                    'updated_at' => $fecha->copy()->setTime(8, rand(21, 30), rand(0, 59)),
                ]);
            }
        }
    }
}

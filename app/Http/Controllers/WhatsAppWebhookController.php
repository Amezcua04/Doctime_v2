<?php

namespace App\Http\Controllers;

use App\Events\AppointmentUpdated;
use App\Models\Appointment;
use App\Models\ClinicSetting;
use App\Models\Patient;
use App\Services\ReminderService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WhatsAppWebhookController extends Controller
{
    /**
     * Verificación del Webhook
     */
    public function verify(Request $request)
    {
        $verifyToken = env('WHATSAPP_VERIFY_TOKEN');

        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode && $token) {
            if ($mode === 'subscribe' && $token === $verifyToken) {
                return response($challenge, 200);
            }
            return response('Forbidden', 403);
        }
        return response('Bad Request', 400);
    }

    /**
     * Recibir y procesar los mensajes de los pacientes
     */
    public function handle(Request $request, ReminderService $reminderService)
    {
        try {
            $entry = $request->input('entry.0');
            $changes = $entry['changes'][0]['value'] ?? null;

            if (isset($changes['statuses'])) {
                return response('STATUS_RECEIVED', 200);
            }

            if (isset($changes['smb_message_echoes'])) {
                Log::info('Mensaje enviado desde la app móvil (Echo) ignorado para evitar auto-respuesta.');
                return response('ECHO_RECEIVED', 200);
            }

            if (isset($changes['messages'][0])) {
                $message = $changes['messages'][0];

                $myBusinessNumber = env('WHATSAPP_BUSINESS_NUMBER');
                if ($myBusinessNumber && str_contains($message['from'], $myBusinessNumber)) {
                    return response('OWN_MESSAGE_IGNORED', 200);
                }

                if (isset($message['type']) && $message['type'] === 'text') {
                    $rawPhone = $message['from'];
                    $textBody = strtolower(trim($message['text']['body']));

                    $localPhone = substr($rawPhone, -10);

                    $this->processPatientReply($localPhone, $rawPhone, $textBody, $reminderService);
                }
            }
            return response('EVENT_RECEIVED', 200);
        } catch (\Exception $e) {
            Log::error('Error en Webhook: ' . $e->getMessage());
            return response('ERROR', 200);
        }
    }

    /**
     * Lógica de negocio (confirmar o cancelar)
     */
    private function processPatientReply($localPhone, $originalPhone, $textBody, ReminderService $reminderService)
    {
        $patient = Patient::where('phone', 'like', "%{$localPhone}%")->first();

        if (!$patient) {
            Log::warning("Webhook Fallo: No se encontró paciente con el teléfono {$localPhone}");
            return;
        }

        $appointment = Appointment::with(['patient', 'services', 'payments'])
        ->where('patient_id', $patient->id)
            ->whereIn('status', ['scheduled', 'confirmed', 'cancelled'])
            ->where('start_time', '>', now())
            ->orderBy('start_time', 'asc')
            ->first();

        if (!$appointment) {
            Log::warning("Webhook Fallo: No se encontró cita programada a futuro para el paciente {$patient->name}");
            return;
        }

        $settings = ClinicSetting::first();
        $fecha = Carbon::parse($appointment->start_time)->locale('es')->isoFormat('dddd D \d\e MMMM');
        $hora = Carbon::parse($appointment->start_time)->format('h:i a');

        $confirmWords = ['si', 'sí', 'confirmo', 'confirmar', 'ok', 'claro', 'por supuesto', '1'];
        $cancelWords = ['no', 'cancelar', 'cancelo', 'imposible', '2'];

        if (Str::contains($textBody, $confirmWords)) {
            if ($appointment->status !== 'confirmed') {
                $appointment->update(['status' => 'confirmed']);
                AppointmentUpdated::dispatch(
                    'updated',
                    $appointment,
                    null,
                    '✅ Cita confirmada vía WhatsApp'
                );
            }

            if ($settings && $settings->enable_whatsapp_reminders) {
                $mensaje = "¡Gracias {$patient->name}! ✅\n\nTu asistencia para el día *{$fecha}* a las *{$hora}* ha sido confirmada con éxito. ¡Te esperamos en la clínica! 🦷";
                $reminderService->sendWhatsAppText($appointment, $mensaje, $settings);
            }
        } elseif (Str::contains($textBody, $cancelWords)) {
            if ($appointment->status !== 'cancelled') {
                $appointment->update(['status' => 'cancelled']);
                AppointmentUpdated::dispatch(
                    'updated',
                    $appointment,
                    null,
                    "❌ Cita cancelada vía WhatsApp: {$patient->name}"
                );
            }

            if ($settings && $settings->enable_whatsapp_reminders) {
                $mensaje = "Entendido, {$patient->name}. Hemos cancelado tu cita del *{$fecha}*.\n\nSi deseas reagendar, por favor responde a este mensaje para que nuestro equipo te asista con los horarios disponibles. 🔄";
                $reminderService->sendWhatsAppText($appointment, $mensaje, $settings);
            }
        } else {
            Log::warning("El texto de {$patient->name} no contiene palabras clave de confirmación ni cancelación.");

            // Opcional: Si escriben algo que el bot no entiende, les mandas este mensaje:
            /*
            if ($settings && $settings->enable_whatsapp_reminders) {
                $mensaje = "Hola {$patient->name}, soy el asistente virtual de {$settings->name}. No logré entender tu respuesta. 🤖\n\nPor favor responde con un *SÍ* para confirmar tu cita, o con un *NO* para cancelarla.";
                $reminderService->sendWhatsAppText($appointment, $mensaje, $settings);
            }
            */
        }
    }
}

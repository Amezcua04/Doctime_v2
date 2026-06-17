<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\ClinicSetting;
use App\Mail\AppointmentReminderMail;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ReminderService
{
  /**
   * Intenta enviar por WhatsApp primero. Si falla, envía Email como respaldo.
   */
  public function send(Appointment $appointment): array
  {
    $results = [
      'whatsapp' => false,
      'email' => false,
      'fallback_used' => false
    ];

    $patient = $appointment->patient;
    $settings = ClinicSetting::first();

    $whatsappEnviado = false;

    if ($settings && $settings->enable_whatsapp_reminders && !empty($patient->phone)) {
      try {
        $whatsappEnviado = $this->sendWhatsApp($appointment, $settings);
        $results['whatsapp'] = $whatsappEnviado;
      } catch (\Exception $e) {
        activity('reminders')
          ->performedOn($appointment)
          ->event('whatsapp_failed')
          ->withProperties(['channel' => 'whatsapp', 'target' => $patient->phone, 'error' => $e->getMessage()])
          ->log("Excepción de servidor al enviar WhatsApp a {$patient->name}");

        $results['whatsapp'] = false;
      }
    }

    if (!$whatsappEnviado && $settings && $settings->enable_email_reminders && !empty($patient->email)) {
      try {
        Mail::to($patient->email)->send(new AppointmentReminderMail($appointment, $settings));

        activity('reminders')
          ->performedOn($appointment)
          ->event('email_success')
          ->withProperties(['channel' => 'email', 'target' => $patient->email])
          ->log("Correo de respaldo enviado exitosamente a {$patient->name}");

        $results['email'] = true;
        $results['fallback_used'] = true;
      } catch (\Exception $e) {
        activity('reminders')
          ->performedOn($appointment)
          ->event('email_failed')
          ->withProperties(['channel' => 'email', 'target' => $patient->email, 'error' => $e->getMessage()])
          ->log("Error al enviar correo de rescate a {$patient->name}");

        $results['email'] = false;
      }
    }

    return $results;
  }

  private function sendWhatsApp(Appointment $appointment, ClinicSetting $settings): bool
  {
    $phoneNumber = $this->formatPhoneNumber($appointment->patient->phone);
    if (!$phoneNumber) return false;

    $clinicName = $settings->name ?? 'Doctime';
    $patientName = explode(' ', trim($appointment->patient->name))[0];
    $date = ucfirst($appointment->start_time->locale('es')->translatedFormat('l, d \d\e F'));
    $time = $appointment->start_time->format('h:i a');
    $imageUrl = asset('images/politicas.jpeg');

    $response = Http::withoutVerifying()
      ->withToken($settings->whatsapp_api_token)
      ->post("https://graph.facebook.com/v25.0/{$settings->whatsapp_phone_id}/messages", [
        'messaging_product' => 'whatsapp',
        'to' => $phoneNumber,
        'type' => 'template',
        'template' => [
          'name' => 'recordatorio',
          'language' => ['code' => 'es_MX'],
          'components' => [
            [
              'type' => 'header',
              'parameters' => [
                [
                  'type' => 'image',
                  'image' => [
                    'link' => $imageUrl
                  ]
                ]
              ]
            ],
            [
              'type' => 'body',
              'parameters' => [
                ['type' => 'text', 'text' => $clinicName],
                ['type' => 'text', 'text' => $patientName],
                ['type' => 'text', 'text' => $date],
                ['type' => 'text', 'text' => $time]
              ]
            ],
          ]
        ]
      ]);

    if (!$response->successful()) {
      activity('reminders')
        ->performedOn($appointment)
        ->event('whatsapp_failed')
        ->withProperties(['channel' => 'whatsapp', 'target' => $phoneNumber, 'error' => $response->body()])
        ->log("Error de Meta al enviar plantilla a {$patientName}");
      return false;
    }

    activity('reminders')
      ->performedOn($appointment)
      ->event('whatsapp_success')
      ->withProperties(['channel' => 'whatsapp', 'target' => $phoneNumber])
      ->log("Plantilla de recordatorio entregada a {$patientName}");

    return true;
  }

  private function formatPhoneNumber(?string $phone): ?string
  {
    if (!$phone) return null;

    $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
    if (strlen($cleanPhone) === 10) {
      return '52' . $cleanPhone;
    }
    return $cleanPhone;
  }

  public function sendWhatsAppText(Appointment $appointment, string $message, $settings, ?string $replyToPhone = null): bool
  {
    $phoneNumber = $replyToPhone ? $replyToPhone : $this->formatPhoneNumber($appointment->patient->phone);

    if (!$phoneNumber) {
      return false;
    }

    $payload = [
      'messaging_product' => 'whatsapp',
      'recipient_type' => 'individual',
      'to' => $phoneNumber,
      'type' => 'text',
      'text' => [
        'preview_url' => false,
        'body' => $message
      ]
    ];

    try {
      $response = Http::withoutVerifying()
        ->withToken($settings->whatsapp_api_token)
        ->post("https://graph.facebook.com/v25.0/{$settings->whatsapp_phone_id}/messages", $payload);

      if (!$response->successful()) {
        activity('reminders')
          ->performedOn($appointment)
          ->event('whatsapp_text_failed')
          ->withProperties(['channel' => 'whatsapp', 'target' => $phoneNumber, 'error' => $response->json()])
          ->log("Error de Meta al responder con texto libre.");
        return false;
      }

      activity('reminders')
        ->performedOn($appointment)
        ->event('whatsapp_text_success')
        ->withProperties(['channel' => 'whatsapp', 'target' => $phoneNumber])
        ->log("El bot respondió con éxito por WhatsApp.");

      return true;
    } catch (\Exception $e) {
      Log::error("Excepción del servidor al intentar enviar texto por WhatsApp: " . $e->getMessage());
      return false;
    }
  }
}

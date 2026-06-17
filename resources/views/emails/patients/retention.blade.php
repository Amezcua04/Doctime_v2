<x-mail::message>
# ¡Hola, {{ explode(' ', trim($patient->name))[0] }}! 👋

Te saludamos del consultorio **{{ $settings->name ?? 'Doctime' }}**.

Notamos que han pasado algunos meses desde tu última visita. Cuidar de tu salud de forma preventiva es clave para mantenerte sano y evitar complicaciones futuras.

<x-mail::panel>
**Te invitamos a agendar una cita de revisión.** Es un proceso rápido y fundamental para tu bienestar.
</x-mail::panel>

Para agendar tu cita, haz clic en el siguiente botón o comunícate con nosotros.

@php
    $rawPhone = $settings->phone ?? '';
    $clinicPhone = preg_replace('/[^0-9]/', '', $rawPhone);
    
    if (strlen($clinicPhone) === 10) {
        $clinicPhone = '+52' . $clinicPhone;
    }

    $prefilledMessage = urlencode("¡Hola! Recibí su correo y me gustaría agendar mi cita de revisión preventiva. 🦷");
    
    $whatsappUrl = "https://wa.me/{$clinicPhone}?text={$prefilledMessage}";
@endphp

<x-mail::button :url="$whatsappUrl" color="success">
Agendar por WhatsApp
</x-mail::button>

¡Esperamos verte pronto! 🦷✨

Atentamente,<br>
**El equipo de {{ $settings->name ?? 'Doctime' }}**
</x-mail::message>
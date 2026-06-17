<x-mail::message>
# ¡Hola, {{ explode(' ', trim($appointment->patient->name))[0] }}! 👋

Te saludamos del consultorio **{{ $settings->name ?? 'Doctime' }}** 🦷.

Queremos recordarte que tienes una cita programada con nosotros. Aquí tienes los detalles:

<div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
<p style="margin-bottom: 8px; color: #334155; font-size: 16px;">
<span style="display: inline-block; width: 24px;">📅</span> <strong>Día:</strong> {{ ucfirst($appointment->start_time->translatedFormat('l, d \d\e F')) }}
</p>
<p style="margin-bottom: 8px; color: #334155; font-size: 16px;">
<span style="display: inline-block; width: 24px;">⏰</span> <strong>Hora:</strong> {{ $appointment->start_time->format('h:i a') }}
</p>
<p style="margin-bottom: 0; color: #334155; font-size: 16px;">
<span style="display: inline-block; width: 24px;">👨‍⚕️</span> <strong>Médico:</strong> Dr(a). {{ $appointment->doctor->name }}
</p>
</div>

<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 6px;">
<p style="margin: 0; color: #991b1b; font-size: 14px;">
<strong>📌 Importante:</strong> Si no recibimos confirmación dentro de las próximas 5 horas, tu cita será cancelada automáticamente para dar oportunidad a otros pacientes.
</p>
</div>

Por favor, **confirma tu asistencia** haciendo clic en el siguiente botón.

<x-mail::button :url="config('app.url') . '/appointment/confirm/' . $appointment->uuid" color="success">
Confirmar mi asistencia
</x-mail::button>

¡Gracias por tu atención!<br>
Nos encantará verte y seguir cuidando tu sonrisa 🦷🪥

Atentamente,<br>
**El equipo de {{ $settings->name ?? 'Doctime' }}**
</x-mail::message>
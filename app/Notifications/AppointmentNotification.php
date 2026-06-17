<?php

namespace App\Notifications;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AppointmentNotification extends Notification
{
    use Queueable;

    public $appointment;
    public $action;
    public $causer;

    /**
     * Create a new notification instance.
     */
    public function __construct(Appointment $appointment, $action, $causer)
    {
        $this->appointment = $appointment;
        $this->action = $action;
        $this->causer = $causer;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'appointment_id' => $this->appointment->id,
            'title'          => $this->generarTitulo(),
            'message'        => $this->generarMensaje(),
            'action'         => $this->action,
            'causer_name'    => $this->causer->name,
            'icon'           => $this->obtenerIcono(),
            'created_at'     => now()->toISOString(),
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'id'   => $this->id,
            'type' => static::class,
            'data' => $this->toArray($notifiable),
        ]);
    }

    private function generarTitulo()
    {
        return match ($this->action) {
            'created' => 'Nueva cita agendada',
            'updated' => 'Cita modificada',
            'deleted' => 'Cita cancelada',
            default   => 'Notificación de cita'
        };
    }

    private function generarMensaje()
    {
        return "Paciente: {$this->appointment->patient->name} - Hora: " . $this->appointment->start_time->format('H:i');
    }

    private function obtenerIcono()
    {
        return match ($this->action) {
            'deleted' => 'trash',
            'updated' => 'pencil',
            default   => 'calendar'
        };
    }
}

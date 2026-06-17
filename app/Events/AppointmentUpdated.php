<?php

namespace App\Events;

use App\Models\Appointment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppointmentUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $action;
    public $appointment;
    public $causedByUserId;
    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct(string $action, Appointment $appointment, int $causedByUserId, string $message = null)
    {
        $this->action = $action;
        $this->appointment = $appointment;
        $this->causedByUserId = $causedByUserId;
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('appointments'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'appointment.updated';
    }

    /**
     * Datos que enviaremos al frontend
     */
    public function broadcastWith(): array
    {
        return [
            'action' => $this->action,
            'causedByUserId' => $this->causedByUserId,
            'message' => $this->message,
            'appointment' => [
                'id' => $this->appointment->id,
                'title' => $this->appointment->patient->name ?? 'Cita',
                'start' => $this->appointment->start_time->format('Y-m-d H:i:s'),
                'end' => $this->appointment->end_time->format('Y-m-d H:i:s'),
                'status' => $this->appointment->status,
                'patient_id' => $this->appointment->patient_id,
                'doctor_id' => $this->appointment->doctor_id,
                'notes' => $this->appointment->notes,

                'total' => $this->appointment->total,
                'paid_amount' => $this->appointment->paid_amount,
                'balance' => $this->appointment->balance,
                'services' => $this->appointment->services,
                'payments' => $this->appointment->payments,
            ]
        ];
    }
}

<?php

namespace App\Mail;

use App\Models\ClinicSetting;
use App\Models\Patient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PatientRetentionMail extends Mailable
{
    use Queueable, SerializesModels;

    public $patient;
    public $settings;

    /**
     * Create a new message instance.
     */
    public function __construct(Patient $patient, ClinicSetting $settings)
    {
        $this->patient = $patient;
        $this->settings = $settings;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $clinicName = $this->settings->name ?? 'Doctime';

        return new Envelope(
            subject: "Es tiempo de tu revisión dental en {$clinicName} 🦷",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.patients.retention',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

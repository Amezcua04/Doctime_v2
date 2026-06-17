<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\ClinicSetting;
use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CheckoutController extends Controller
{
    /**
     * Genera un recibo/estado de cuenta en PDF para la cita completa.
     */
    public function downloadReceipt(Appointment $appointment)
    {
        $appointment->load(['patient', 'doctor', 'services', 'payments.method', 'payments.recorder']);
        $settings = ClinicSetting::first() ?? new ClinicSetting([
            'name' => config('app.name', 'DocTime'),
            'address' => 'N/A',
            'phone' => 'N/A'
        ]);

        $pdf = Pdf::loadView('pdf.receipt', [
            'appointment' => $appointment,
            'clinic' => [
                'name' => $settings->name,
                'address' => $settings->address,
                'phone' => $settings->phone
            ]
        ]);

        $pdf->setPaper([0, 0, 226, 650], 'portrait');

        return $pdf->stream("recibo-cita-{$appointment->id}.pdf");
    }
}

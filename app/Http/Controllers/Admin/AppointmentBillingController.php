<?php

namespace App\Http\Controllers\Admin;

use App\Events\AppointmentUpdated;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Payment;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AppointmentBillingController extends Controller
{
    /**
     * Agrega un servicio a la cuenta de la cita
     */
    public function addService(Request $request, Appointment $appointment)
    {
        $data = $request->validate([
            'service_id' => 'required|exists:services,id',
            'quantity' => 'required|integer|min:1',
            'price' => 'required|numeric|min:0'
        ], [
            'service_id.required' => 'Debes seleccionar un servicio.',
            'price.min' => 'El precio no puede ser negativo.'
        ]);

        $appointment->services()->attach($data['service_id'], [
            'price' => $data['price'],
            'quantity' => $data['quantity']
        ]);

        $appointment->refresh()->load(['services', 'payments.method', 'patient']);
        AppointmentUpdated::dispatch(
            'updated',
            $appointment,
            Auth::id(),
            null
        );

        return back()->with('success', 'Servicio agregado a la cuenta exitosamente.');
    }

    /**
     * Elimina un servicio de la cuenta
     */
    public function removeService(Appointment $appointment, Service $service)
    {
        $appointment->services()->detach($service->id);

        $appointment->refresh()->load(['services', 'payments.method', 'patient']);
        AppointmentUpdated::dispatch(
            'updated',
            $appointment,
            Auth::id(),
            null
        );

        return back()->with('success', 'Servicio removido de la cuenta.');
    }

    /**
     * Registra un nuevo pago a la cita
     */
    public function addPayment(Request $request, Appointment $appointment)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:1',
            'payment_method_id' => [
                'required',
                Rule::exists('payment_methods', 'id')->where(function ($query) {
                    return $query->where('is_active', true);
                }),
            ],
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ], [
            'amount.min' => 'El monto del pago debe ser mayor a cero.',
            'payment_method_id.required' => 'Debes seleccionar un método de pago.',
            'payment_method_id.exists' => 'El método de pago seleccionado no es válido o está inactivo.',
        ]);

        if ($data['amount'] > $appointment->balance && $appointment->balance > 0) {
            return back()->withErrors(['amount' => 'El monto supera el saldo pendiente de la cuenta.']);
        }

        Payment::create([
            'appointment_id' => $appointment->id,
            'recorded_by' => Auth::id(),
            'amount' => $data['amount'],
            'payment_method_id' => $data['payment_method_id'],
            'reference' => $data['reference'],
            'notes' => $data['notes']
        ]);

        $appointment->refresh()->load(['services', 'payments.method', 'patient']);
        AppointmentUpdated::dispatch(
            'updated',
            $appointment,
            Auth::id(),
            null
        );

        return back()->with('success', 'Pago registrado correctamente.');
    }

    /**
     * Elimina un pago (En caso de error del cajero/asistente)
     */
    public function destroyPayment(Appointment $appointment, Payment $payment)
    {
        if ($payment->appointment_id === $appointment->id) {
            $payment->delete();

            $appointment->refresh()->load(['services', 'payments.method', 'patient']);
            AppointmentUpdated::dispatch(
                'updated',
                $appointment,
                Auth::id(),
                null
            );

            return back()->with('success', 'Pago eliminado del registro.');
        }

        return back()->with('error', 'Operación no permitida.');
    }
}

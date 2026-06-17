<?php

namespace App\Http\Controllers\Admin;

use App\Events\AppointmentUpdated;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\DoctorAbsence;
use App\Models\DoctorSchedule;
use App\Models\Patient;
use App\Models\PaymentMethod;
use App\Models\Service;
use App\Models\User;
use App\Notifications\AppointmentNotification;
use App\Services\ReminderService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $doctorsList = collect();

        if ($user->hasRole('admin')) {
            $doctorsList = User::role('doctor')->orderBy('name')->select('id', 'name', 'color')->get();
        } elseif ($user->hasRole('doctor')) {
            $doctorsList = User::where('id', $user->id)->select('id', 'name', 'color')->get();
        } elseif ($user->hasRole('assistant')) {
            $doctorsList = $user->doctors()
                ->orderBy('name')
                ->select('users.id', 'users.name', 'users.color')
                ->get();
        }

        $query = Appointment::with(['patient', 'doctor', 'services', 'payments.method']);

        if ($user->hasRole(['admin', 'super_admin'])) {
            
        } elseif ($user->hasRole('doctor')) {
            $query->where('doctor_id', $user->id);
        } elseif ($user->hasRole('assistant')) {
            $assignedDoctorIds = $user->doctors()->pluck('users.id');
            $query->whereIn('doctor_id', $assignedDoctorIds);
        }

        $appointments = $query->whereDate('start_time', '>=', now()->subMonths(1))
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'title' => $appointment->patient->name ?? 'Paciente desconocido',
                    'start' => $appointment->start_time->format('Y-m-d H:i:s'),
                    'end' => $appointment->end_time->format('Y-m-d H:i:s'),
                    'status' => $appointment->status,
                    'patient_id' => $appointment->patient_id,
                    'doctor_id' => $appointment->doctor_id,
                    'notes' => $appointment->notes,

                    'patient' => $appointment->patient ? [
                        'id' => $appointment->patient->id,
                        'name' => $appointment->patient->name,
                    ] : null,

                    'doctor' => $appointment->doctor ? [
                        'id' => $appointment->doctor->id,
                        'name' => $appointment->doctor->name,
                        'color' => $appointment->doctor->color ?? '#3b82f6',
                    ] : null,

                    'services' => $appointment->services,
                    'payments' => $appointment->payments,
                    'total' => $appointment->total,
                    'paid_amount' => $appointment->paid_amount,
                    'balance' => $appointment->balance,
                    'payment_status' => $appointment->payment_status,
                ];
            });

        $patients = Patient::orderBy('name')->select('id', 'name')->get();
        $availableServices = Service::where('is_active', true)->orderBy('name')->get();
        $activePaymentMethods = PaymentMethod::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/appointments/index', [
            'events' => $appointments,
            'patients' => $patients,
            'doctors' => $doctorsList,
            'services' => $availableServices,
            'paymentMethods' => $activePaymentMethods,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'notes' => 'nullable|string|max:1000',
        ], [
            'patient_id.required' => 'Debes seleccionar un paciente.',
            'doctor_id.required' => 'Debes asignar un médico.',
            'end_time.after' => 'La hora de fin debe ser posterior a la de inicio.'
        ]);

        $start = Carbon::parse($data['date'] . ' ' . $data['start_time']);
        $end = Carbon::parse($data['date'] . ' ' . $data['end_time']);

        $availabilityError = $this->checkAvailability($data['doctor_id'], $start, $end);

        if ($availabilityError) {
            return back()->withErrors(['schedule' => $availabilityError]);
        }

        $appointment = Appointment::create([
            'doctor_id' => $data['doctor_id'],
            'patient_id' => $data['patient_id'],
            'created_by' => Auth::id(),
            'start_time' => $start,
            'end_time' => $end,
            'status' => 'scheduled',
            'notes' => $data['notes'],
        ]);

        $patientName = $appointment->patient->name;
        AppointmentUpdated::dispatch(
            'created',
            $appointment,
            Auth::id(),
            "📅 Nueva cita agendada para {$patientName}"
        );

        $this->notifyChanges($appointment, 'created');

        return back()->with('success', 'Cita agendada correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Appointment $appointment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Appointment $appointment)
    {
        $data = $request->validate([
            'patient_id' => 'required|exists:patients,id',
            'doctor_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'notes' => 'nullable|string|max:1000',
            'status' => 'required|in:scheduled,confirmed,arrived,in_progress,cancelled,completed,no_show',
        ], [
            'end_time.after' => 'La hora de fin debe ser posterior a la de inicio.'
        ]);

        $start = Carbon::parse($data['date'] . ' ' . $data['start_time']);
        $end = Carbon::parse($data['date'] . ' ' . $data['end_time']);

        $availabilityError = $this->checkAvailability($data['doctor_id'], $start, $end, $appointment->id);

        if ($availabilityError) {
            return back()->withErrors(['schedule' => $availabilityError]);
        }

        $appointment->update([
            'doctor_id' => $data['doctor_id'],
            'patient_id' => $data['patient_id'],
            'start_time' => $start,
            'end_time' => $end,
            'status' => $data['status'],
            'notes' => $data['notes'],
        ]);

        $patientName = $appointment->patient->name;
        AppointmentUpdated::dispatch(
            'updated',
            $appointment,
            Auth::id(),
            "✏️ Cita actualizada de {$patientName}"
        );

        $this->notifyChanges($appointment, 'updated');

        return back()->with('success', 'Cita actualizada correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        $clonedAppointment = clone $appointment;

        $patientName = $clonedAppointment->patient->name;
        $appointment->delete();
        AppointmentUpdated::dispatch(
            'deleted',
            $clonedAppointment,
            Auth::id(),
            "🗑️ Cita cancelada de {$patientName}"
        );

        $this->notifyChanges($clonedAppointment, 'deleted');

        return back()->with('success', 'Cita eliminada.');
    }

    /**
     * Actualiza únicamente el estatus de una cita (Quick Confirm).
     */
    public function updateStatus(Request $request, Appointment $appointment)
    {
        $request->validate([
            'status' => 'required|string|in:scheduled,confirmed,arrived,in_progress,cancelled,completed,no_show'
        ]);

        $appointment->update([
            'status' => $request->status
        ]);

        $patientName = $appointment->patient->name;
        AppointmentUpdated::dispatch(
            'updated',
            $appointment,
            Auth::id(),
            "✏️ Se confirmó la cita del paciente: {$patientName}"
        );

        return redirect()->back()->with('success', 'Cita actualizada correctamente.');
    }

    /**
     * Helper privado para validar reglas de negocio
     */
    private function checkAvailability($doctorId, Carbon $start, Carbon $end, $ignoreAppointmentId = null)
    {
        // A. HORARIO LABORAL
        $dayOfWeek = $start->dayOfWeek;
        $schedules = DoctorSchedule::where('user_id', $doctorId)->where('day_of_week', $dayOfWeek)->get();

        if ($schedules->isEmpty()) {
            return "El médico no trabaja los " . $start->locale('es')->dayName . ".";
        }

        $fitsInSlot = false;
        foreach ($schedules as $slot) {
            $cleanStart = Carbon::parse($slot->start_time)->format('H:i:s');
            $cleanEnd = Carbon::parse($slot->end_time)->format('H:i:s');

            $slotStart = Carbon::parse($start->format('Y-m-d') . ' ' . $cleanStart);
            $slotEnd = Carbon::parse($start->format('Y-m-d') . ' ' . $cleanEnd);

            if ($start->greaterThanOrEqualTo($slotStart) && $end->lessThanOrEqualTo($slotEnd)) {
                $fitsInSlot = true;
                break;
            }
        }

        if (!$fitsInSlot) {
            return "Hora fuera del turno laboral del médico.";
        }

        // B. AUSENCIAS
        $isAbsent = DoctorAbsence::where('user_id', $doctorId)
            ->where(function ($query) use ($start) {
                $query->whereDate('start_date', '<=', $start)
                    ->whereDate('end_date', '>=', $start);
            })->exists();

        if ($isAbsent) {
            return "El médico tiene una ausencia registrada en esta fecha.";
        }

        // C. SOLAPAMIENTOS
        // $overlap = Appointment::where('doctor_id', $doctorId)
        //     ->where('status', '!=', 'cancelled')
        //     ->where(function ($query) use ($start, $end) {
        //         $query->where('start_time', '<', $end)
        //             ->where('end_time', '>', $start);
        //     });

        // if ($ignoreAppointmentId) {
        //     $overlap->where('id', '!=', $ignoreAppointmentId);
        // }

        // if ($overlap->exists()) {
        //     return "El horario choca con otra cita existente.";
        // }

        return null;
    }

    /**
     * Helper para enviar notificaciones a los usuarios correctos
     */
    private function notifyChanges(Appointment $appointment, string $action)
    {
        $causer = Auth::user();

        $doctor = $appointment->doctor;
        if ($doctor->id !== $causer->id) {
            $doctor->notify(new AppointmentNotification($appointment, $action, $causer));
        }

        $assistants = $doctor->assistants;
        foreach ($assistants as $assistant) {
            if ($assistant->id !== $causer->id) {
                $assistant->notify(new AppointmentNotification($appointment, $action, $causer));
            }
        }
    }

    public function sendManualReminder(Appointment $appointment, ReminderService $reminderService)
    {
        $results = $reminderService->send($appointment);
        if (!$results['email'] && !$results['whatsapp']) {
            return back()->with('error', 'No se pudo enviar el recordatorio. Verifica la configuración o los datos del paciente.');
        }

        return back()->with('success', 'Recordatorio enviado exitosamente al paciente.');
    }
}

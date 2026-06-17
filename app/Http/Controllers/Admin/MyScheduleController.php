<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateScheduleRequest;
use App\Models\DoctorAbsence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class MyScheduleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Request $request)
    {
        $user = $request->user();
        $schedules = $user->schedules()->orderBy('day_of_week')->orderBy('start_time')->get();
        $groupedSchedules = $schedules->groupBy('day_of_week');


        $absences = $user->absences()
            ->where('end_date', '>=', now()->subDays(7))
            ->orderBy('start_date')
            ->get();

        return Inertia::render('admin/my-schedule/edit', [
            'schedules' => $groupedSchedules,
            'absences' => $absences,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Guarda el horario semanal base
     */
    public function updateSchedule(UpdateScheduleRequest $request)
    {
        $user = $request->user();

        DB::transaction(function () use ($user, $request) {
            $user->schedules()->delete();

            foreach ($request->schedule as $dayConfig) {
                if (!$dayConfig['enabled']) continue;

                foreach ($dayConfig['slots'] as $slot) {
                    $user->schedules()->create([
                        'day_of_week' => $dayConfig['day_of_week'],
                        'start_time' => $slot['start_time'],
                        'end_time' => $slot['end_time'],
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Tu horario semanal ha sido actualizado.');
    }

    /**
     * Registra una nueva ausencia (vacaciones, festivo, etc.)
     */
    public function storeAbsence(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'reason' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $overlap = $user->absences()
            ->where(function ($query) use ($request) {
                $query->whereBetween('start_date', [$request->start_date, $request->end_date])
                    ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                    ->orWhere(function ($q) use ($request) {
                        $q->where('start_date', '<=', $request->start_date)
                            ->where('end_date', '>=', $request->end_date);
                    });
            })
            ->exists();

        if ($overlap) {
            return redirect()->back()->with('error', 'No es posible registrar: Las fechas seleccionadas se cruzan con una ausencia existente.');
        }

        $user->absences()->create($request->all());

        return redirect()->back()->with('success', 'Ausencia registrada correctamente.');
    }

    public function destroyAbsence(DoctorAbsence $absence)
    {
        if ($absence->user_id !== auth()->id()) {
            abort(403);
        }

        $absence->delete();

        return redirect()->back()->with('success', 'Ausencia eliminada.');
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class OperationalReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $now = Carbon::now();

        $startDate = $request->input('start_date', $now->copy()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', $now->copy()->endOfMonth()->format('Y-m-d'));
        $doctorId = $request->input('doctor_id', 'all');

        $query = Appointment::with(['patient', 'doctor'])
            ->whereBetween('start_time', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);

        if ($user->hasRole('doctor')) {
            $query->where('doctor_id', $user->id);
        } elseif ($user->hasRole(['assistant', 'receptionist'])) {
            $assignedDoctorIds = $user->doctors()->pluck('users.id')->toArray();
            if ($doctorId !== 'all' && in_array($doctorId, $assignedDoctorIds)) {
                $query->where('doctor_id', $doctorId);
            } else {
                $query->whereIn('doctor_id', $assignedDoctorIds);
            }
        } else {
            if ($doctorId !== 'all') {
                $query->where('doctor_id', $doctorId);
            }
        }

        $appointmentsForStats = (clone $query)->get();
        $statusCounts = $appointmentsForStats->groupBy('status')->map->count();
        $totalAppointments = $appointmentsForStats->count() ?: 1;

        $attendanceData = [
            ['name' => 'Confirmadas / completadas', 'value' => ($statusCounts->get('completed', 0) + $statusCounts->get('confirmed', 0))],
            ['name' => 'Canceladas', 'value' => $statusCounts->get('cancelled', 0)],
            ['name' => 'Programadas', 'value' => $statusCounts->get('scheduled', 0)]
        ];

        $peakHoursData = $appointmentsForStats->groupBy(function ($app) {
            return Carbon::parse($app->start_time)->format('H:00');
        })->map(function ($group, $hour) {
            return ['hora' => $hour, 'citas' => count($group)];
        })->values()->sortBy('hora')->values();

        $appointmentIds = $appointmentsForStats->pluck('id')->toArray();

        $citasGestionadasPorBot = 0;

        if (!empty($appointmentIds)) {
            $citasGestionadasPorBot = Activity::where('subject_type', Appointment::class)
                ->whereIn('subject_id', $appointmentIds)
                ->where('event', 'updated')
                ->whereNull('causer_id')
                ->distinct('subject_id')
                ->count('subject_id');
        }

        $minutosAhorradosPorCita = 3;
        $horasHombreAhorradas = round(($citasGestionadasPorBot * $minutosAhorradosPorCita) / 60, 1);

        $kpis = [
            'total_citas' => $appointmentsForStats->count(),
            'tasa_cancelacion' => round(($statusCounts->get('cancelled', 0) / $totalAppointments) * 100, 1),
            'horas_ahorradas_bot' => $horasHombreAhorradas,
        ];

        $doctors = [];
        if ($user->hasRole(['super_admin', 'admin'])) {
            $doctors = User::role('doctor')->select('id', 'name')->orderBy('name')->get();
        } elseif ($user->hasRole(['assistant', 'receptionist'])) {
            $doctors = $user->doctors()->select('users.id', 'users.name')->orderBy('name')->get();
        }

        $paginatedAppointments = $query->orderBy('start_time', 'desc')
            ->paginate(10)
            ->withQueryString()
            ->through(fn($app) => [
                'id' => $app->id,
                'fecha' => $app->start_time->format('d/m/Y'),
                'hora' => $app->start_time->format('H:i') . ' - ' . $app->end_time->format('H:i'),
                'paciente' => $app->patient->name ?? 'N/A',
                'medico' => $app->doctor->name ?? 'N/A',
                'estatus' => $app->status,
            ]);

        return Inertia::render('admin/reports/operational', [
            'appointments' => $paginatedAppointments,
            'filters' => compact('startDate', 'endDate', 'doctorId'),
            'kpis' => $kpis,
            'attendanceData' => $attendanceData,
            'peakHoursData' => $peakHoursData,
            'doctors' => $doctors,
        ]);
    }

    public function export(Request $request)
    {
        $user = $request->user();

        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $doctorId = $request->input('doctor_id', 'all');

        $query = Appointment::with(['patient', 'doctor', 'services'])
            ->whereBetween('start_time', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);

        if ($user->hasRole('doctor')) {
            $query->where('doctor_id', $user->id);
        } elseif ($user->hasRole(['assistant', 'receptionist'])) {
            $assignedDoctorIds = $user->doctors()->pluck('users.id')->toArray();
            if ($doctorId !== 'all' && in_array($doctorId, $assignedDoctorIds)) {
                $query->where('doctor_id', $doctorId);
            } else {
                $query->whereIn('doctor_id', $assignedDoctorIds);
            }
        } else {
            if ($doctorId !== 'all') {
                $query->where('doctor_id', $doctorId);
            }
        }

        $appointments = $query->orderBy('start_time', 'asc')->get();
        $fileName = 'Reporte_operativo_' . date('Y-m-d_H-i') . '.csv';

        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        return response()->stream(function () use ($appointments) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF");

            fputcsv($file, ['Fecha', 'Hora Inicio', 'Hora Fin', 'Paciente', 'Medico', 'Servicios', 'Estatus']);

            foreach ($appointments as $app) {
                $serviciosStr = $app->services->isNotEmpty()
                    ? $app->services->pluck('name')->implode(', ')
                    : 'N/A';

                $statusTraduccion = match ($app->status) {
                    'scheduled' => 'Agendada',
                    'confirmed' => 'Confirmada',
                    'completed' => 'Completada',
                    'cancelled' => 'Cancelada',
                    default => $app->status
                };

                fputcsv($file, [
                    $app->start_time->format('d/m/Y'),
                    $app->start_time->format('H:i'),
                    $app->end_time->format('H:i'),
                    $app->patient->name ?? 'N/A',
                    $app->doctor->name ?? 'N/A',
                    $serviciosStr,
                    $statusTraduccion
                ]);
            }
            fclose($file);
        }, 200, $headers);
    }

    public function exportPdf(Request $request)
    {
        $user = $request->user();
        $now = Carbon::now();

        $startDate = $request->input('start_date', $now->copy()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', $now->copy()->endOfMonth()->format('Y-m-d'));
        $doctorId = $request->input('doctor_id', 'all');

        $query = Appointment::with(['patient', 'doctor', 'services'])
            ->whereBetween('start_time', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);

        if ($user->hasRole('doctor')) {
            $query->where('doctor_id', $user->id);
        } elseif ($user->hasRole(['assistant', 'receptionist'])) {
            $assignedDoctorIds = $user->doctors()->pluck('users.id')->toArray();
            if ($doctorId !== 'all' && in_array($doctorId, $assignedDoctorIds)) {
                $query->where('doctor_id', $doctorId);
            } else {
                $query->whereIn('doctor_id', $assignedDoctorIds);
            }
        } else {
            if ($doctorId !== 'all') {
                $query->where('doctor_id', $doctorId);
            }
        }

        $appointments = $query->orderBy('start_time', 'asc')->get();

        $statusCounts = $appointments->groupBy('status')->map->count();
        $total = $appointments->count() ?: 1;

        $asistencias = $statusCounts->get('completed', 0) + $statusCounts->get('confirmed', 0);
        $canceladas = $statusCounts->get('cancelled', 0);
        $pendientes = $statusCounts->get('scheduled', 0);

        // --- 1. CONFIGURACIÓN GRÁFICA DE DONA ---
        $pieChartConfig = urlencode(json_encode([
            'type' => 'doughnut',
            'data' => [
                'labels' => ['Confirmadas / completadas', 'Canceladas', 'Programadas'],
                'datasets' => [[
                    'data' => [$asistencias, $canceladas, $pendientes],
                    'backgroundColor' => ['rgb(16, 185, 129)', 'rgb(239, 68, 68)', 'rgb(59, 130, 246)'], // Colores del Dashboard
                    'borderWidth' => 2,
                    'borderColor' => '#ffffff'
                ]]
            ],
            'options' => [
                'plugins' => [
                    'datalabels' => ['display' => false],
                    'legend' => ['position' => 'right', 'labels' => ['boxWidth' => 12]]
                ]
            ]
        ]));

        // --- 2. CONFIGURACIÓN GRÁFICA DE ÁREA (HORAS PICO) ---
        $peakHoursData = $appointments->groupBy(function ($app) {
            return Carbon::parse($app->start_time)->format('H:00');
        })->map(function ($group, $hour) {
            return ['hora' => $hour, 'citas' => count($group)];
        })->sortBy('hora');

        $labelsArea = $peakHoursData->pluck('hora')->toArray();
        $dataArea = $peakHoursData->pluck('citas')->toArray();

        $areaChartConfig = urlencode(json_encode([
            'type' => 'line',
            'data' => [
                'labels' => empty($labelsArea) ? ['09:00', '13:00', '17:00'] : $labelsArea,
                'datasets' => [[
                    'label' => 'Volumen de citas',
                    'data' => empty($dataArea) ? [0, 0, 0] : $dataArea,
                    'backgroundColor' => 'rgba(59, 130, 246, 0.15)', // Sombreado azul claro
                    'borderColor' => 'rgb(59, 130, 246)',
                    'borderWidth' => 2,
                    'fill' => true,
                    'pointRadius' => 0
                ]]
            ],
            'options' => [
                'scales' => [
                    'yAxes' => [['ticks' => ['beginAtZero' => true, 'stepSize' => 1]]],
                    'xAxes' => [['gridLines' => ['display' => false]]]
                ],
                'legend' => ['display' => false]
            ]
        ]));

        $pieChartUrl = "https://quickchart.io/chart?c={$pieChartConfig}&w=350&h=200&f=png";
        $areaChartUrl = "https://quickchart.io/chart?c={$areaChartConfig}&w=400&h=200&f=png";

        // --- 3. DESCARGA Y CONVERSIÓN A BASE 64 ---
        $pieChartBase64 = '';
        $areaChartBase64 = '';
        try {
            $pieData = @file_get_contents($pieChartUrl);
            if ($pieData) $pieChartBase64 = 'data:image/png;base64,' . base64_encode($pieData);

            $areaData = @file_get_contents($areaChartUrl);
            if ($areaData) $areaChartBase64 = 'data:image/png;base64,' . base64_encode($areaData);
        } catch (\Exception $e) {
            Log::error("Error al generar gráficas PDF: " . $e->getMessage());
        }

        // Horas ahorradas bot (simulación o tu lógica real)
        $citasBot = (clone $query)->whereHas('activities', function ($q) {
            $q->whereNull('causer_id')->where('event', 'updated');
        })->count();
        $horasAhorradas = round(($citasBot * 3) / 60, 1);

        $kpis = [
            'total' => $total,
            'tasa_cancelacion' => round(($canceladas / $total) * 100, 1) . '%',
            'horas_bot' => $horasAhorradas
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.operational', [
            'appointments' => $appointments,
            'kpis' => $kpis,
            'pieChartBase64' => $pieChartBase64,
            'areaChartBase64' => $areaChartBase64,
        ])->setPaper('a4', 'landscape'); // Lo ponemos en horizontal (Landscape) para replicar el Dashboard ancho

        return $pdf->download('Reporte_Operativo_' . date('Y-m-d') . '.pdf');
    }
}

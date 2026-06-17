<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Payment;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $selectedMonth = $request->input('month', Carbon::now()->format('Y-m'));
        $targetDate = Carbon::createFromFormat('Y-m', $selectedMonth);

        $startOfMonth = $targetDate->copy()->startOfMonth();
        $endOfMonth = $targetDate->copy()->endOfMonth();
        $today = Carbon::today();

        return Inertia::render('dashboard', [
            'stats' => fn() => $this->getStats($user, $today, $startOfMonth, $endOfMonth),
            'chartData' => fn() => $this->getChartData($user, $startOfMonth, $endOfMonth, $targetDate, $today),
            'statusDistribution' => fn() => $this->getStatusDistribution($user, $startOfMonth, $endOfMonth),
            'nextAppointments' => fn() => $this->getNextAppointments($user),
            'topServices' => fn() => $this->getTopServices($user, $startOfMonth, $endOfMonth),
            'confirmationList' => fn() => $this->getConfirmationList($user),
            'waitingRoom' => fn() => $this->getWaitingRoom($user),
            'inConsultation' => fn() => $this->getInConsultation($user),
            'financialStats' => fn() => $this->getFinancialStats($user, $startOfMonth, $endOfMonth),
            'userRoles' => $user->getRoleNames(),
            'filters' => ['month' => $selectedMonth],
        ]);
    }

    private function getBaseQuery($user)
    {
        $query = Appointment::query();
        if ($user->hasRole('doctor')) {
            $query->where('doctor_id', $user->id);
        }
        return $query;
    }

    private function getStats($user, $today, $startOfMonth, $endOfMonth)
    {
        $query = $this->getBaseQuery($user);

        return [
            'today_appointments' => (clone $query)->whereDate('start_time', $today)->count(),
            'upcoming_appointments' => (clone $query)->where('start_time', '>', now())->whereIn('status', ['scheduled', 'confirmed'])->count(),
            'total_patients' => Patient::count(),
            'cancelled_month' => (clone $query)->whereBetween('start_time', [$startOfMonth, $endOfMonth])
                ->where('status', 'cancelled')->count(),
        ];
    }

    private function getChartData($user, $startOfMonth, $endOfMonth, $targetDate, $today)
    {
        $appointmentsByDate = $this->getBaseQuery($user)
            ->select(DB::raw('DATE(start_time) as date'), DB::raw('count(*) as count'))
            ->whereBetween('start_time', [$startOfMonth, $endOfMonth])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $chartData = [];
        $daysInMonth = $targetDate->daysInMonth;
        $limitDay = ($startOfMonth->isCurrentMonth()) ? $today->day : $daysInMonth;

        for ($i = 1; $i <= $limitDay; $i++) {
            $dateStr = $startOfMonth->copy()->addDays($i - 1)->format('Y-m-d');

            $record = $appointmentsByDate->first(function ($item) use ($dateStr) {
                return Carbon::parse($item->date)->format('Y-m-d') === $dateStr;
            });

            $chartData[] = [
                'date' => str_pad($i, 2, '0', STR_PAD_LEFT) . '/' . $startOfMonth->format('m'),
                'citas' => $record ? $record->count : 0
            ];
        }

        return $chartData;
    }

    private function getStatusDistribution($user, $startOfMonth, $endOfMonth)
    {
        return $this->getBaseQuery($user)
            ->select('status', DB::raw('count(*) as count'))
            ->whereBetween('start_time', [$startOfMonth, $endOfMonth])
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                $labels = [
                    'scheduled' => 'Programada',
                    'confirmed' => 'Confirmada',
                    'arrived'   => 'En espera',
                    'in_progress' => 'En consulta',
                    'completed' => 'Completada',
                    'cancelled' => 'Cancelada',
                    'no_show' => 'No Asistió'
                ];
                return [
                    'status' => $item->status,
                    'name' => $labels[$item->status] ?? $item->status,
                    'value' => $item->count
                ];
            });
    }

    private function getNextAppointments($user)
    {
        return $this->getBaseQuery($user)
            ->with(['patient', 'doctor'])
            ->where('start_time', '>', now())
            ->whereIn('status', ['scheduled', 'confirmed'])
            ->orderBy('start_time')
            ->take(5)
            ->get()
            ->map(function ($appt) {
                $start = Carbon::parse($appt->start_time);
                return [
                    'id' => $appt->id,
                    'patient_name' => $appt->patient->name,
                    'doctor_name' => $appt->doctor->name,
                    'time' => $start->format('H:i'),
                    'date' => $start->isToday() ? 'Hoy' : $start->format('d/m'),
                    'status' => $appt->status,
                ];
            });
    }

    private function getTopServices($user, $startOfMonth, $endOfMonth)
    {
        if (!$user->hasRole('admin|super_admin')) return [];

        return DB::table('appointment_service')
            ->join('services', 'appointment_service.service_id', '=', 'services.id')
            ->join('appointments', 'appointment_service.appointment_id', '=', 'appointments.id')
            ->whereBetween('appointments.start_time', [$startOfMonth, $endOfMonth])
            ->select('services.name', DB::raw('count(*) as total'))
            ->groupBy('services.name')
            ->orderByDesc('total')
            ->limit(5)
            ->get();
    }

    private function getConfirmationList($user)
    {
        if (!$user->hasRole('assistant|admin|super_admin')) return [];

        return Appointment::with('patient')
            ->whereDate('start_time', Carbon::tomorrow())
            ->where('status', 'scheduled')
            ->orderBy('start_time')
            ->get()
            ->map(fn($appt) => [
                'id' => $appt->id,
                'patient' => $appt->patient->name,
                'phone' => $appt->patient->phone,
                'time' => $appt->start_time->format('H:i'),
            ]);
    }

    private function getWaitingRoom($user)
    {
        if (!$user->hasRole('doctor|admin|super_admin')) return [];

        $query = Appointment::with('patient')
            ->whereDate('start_time', Carbon::today())
            ->where('status', 'arrived');

        if ($user->hasRole('doctor')) {
            $query->where('doctor_id', $user->id);
        }

        return $query->orderBy('start_time')
            ->get()
            ->map(fn($appt) => [
                'id' => $appt->id,
                'patient' => $appt->patient->name,
                'time' => $appt->start_time->format('H:i'),
                'wait_time' => $appt->updated_at->diffForHumans(null, true) . ' en espera',
            ]);
    }

    private function getInConsultation($user)
    {
        if (!$user->hasRole('doctor|admin|super_admin|assistant')) return [];

        $query = Appointment::with(['patient', 'doctor'])
            ->whereDate('start_time', Carbon::today())
            ->where('status', 'in_progress');

        if ($user->hasRole('doctor')) {
            $query->where('doctor_id', $user->id);
        }

        return $query->orderBy('start_time')
            ->get()
            ->map(fn($appt) => [
                'id' => $appt->id,
                'patient' => $appt->patient->name,
                'doctor' => $appt->doctor->name,
                'time' => $appt->start_time->format('H:i'),
                'duration' => $appt->updated_at->diffForHumans(null, true) . ' adentro',
            ]);
    }

    private function getFinancialStats($user, $startOfMonth, $endOfMonth)
    {
        if (!$user->hasRole('super_admin|admin')) return null;

        $monthlyPayments = Payment::whereBetween('created_at', [$startOfMonth, $endOfMonth]);
        $totalIngresosMes = $monthlyPayments->sum('amount');
        $cantidadPagos = $monthlyPayments->count();

        $ticketPromedio = $cantidadPagos > 0 ? $totalIngresosMes / $cantidadPagos : 0;

        $lastMonthStart = $startOfMonth->copy()->subMonth();
        $lastMonthEnd = $endOfMonth->copy()->subMonth();
        $totalIngresosPasado = Payment::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->sum('amount');

        $crecimiento = 0;
        if ($totalIngresosPasado > 0) {
            $crecimiento = (($totalIngresosMes - $totalIngresosPasado) / $totalIngresosPasado) * 100;
        }

        return [
            'ingresos_mes' => (float)$totalIngresosMes,
            'ticket_promedio' => (float)$ticketPromedio,
            'crecimiento_porcentaje' => round($crecimiento, 1),
        ];
    }
}

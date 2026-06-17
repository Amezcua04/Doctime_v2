<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Pagination\LengthAwarePaginator;

class FinancialReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $now = Carbon::now();
        $startDate = $request->input('start_date', $now->copy()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', $now->copy()->endOfMonth()->format('Y-m-d'));
        $doctorId = $request->input('doctor_id', 'all');
        $methodId = $request->input('method_id', 'all');

        $query = Payment::with(['appointment.patient', 'appointment.doctor', 'appointment.services', 'recorder', 'method'])
            ->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);

        if ($user->hasRole('doctor')) {
            $query->whereHas('appointment', fn($q) => $q->where('doctor_id', $user->id));
        } elseif ($user->hasRole(['assistant', 'receptionist'])) {
            $assignedDoctorIds = $user->doctors()->pluck('users.id')->toArray();
            if ($doctorId !== 'all' && in_array($doctorId, $assignedDoctorIds)) {
                $query->whereHas('appointment', fn($q) => $q->where('doctor_id', $doctorId));
            } else {
                $query->whereHas('appointment', fn($q) => $q->whereIn('doctor_id', $assignedDoctorIds));
            }
        } else {
            if ($doctorId !== 'all') {
                $query->whereHas('appointment', fn($q) => $q->where('doctor_id', $doctorId));
            }
        }

        if ($methodId !== 'all') {
            $query->where('payment_method_id', $methodId);
        }

        $payments = $query->latest()->get();
        $groupedTableData = [];
        $groupedPayments = $payments->groupBy('appointment_id');

        foreach ($groupedPayments as $appointmentId => $appointmentPayments) {
            $firstPayment = $appointmentPayments->first();
            $appointment = $firstPayment->appointment;
            $services = $appointment && $appointment->services
                ? $appointment->services->pluck('name')->toArray()
                : [];

            $consolidatedPayments = [];
            foreach ($appointmentPayments as $p) {
                $methodName = $p->method ? $p->method->name : 'Desconocido';

                if (!isset($consolidatedPayments[$methodName])) {
                    $consolidatedPayments[$methodName] = [
                        'method' => $methodName,
                        'amount' => 0,
                        'references' => [],
                        'recorder' => $p->recorder->name ?? 'Sistema'
                    ];
                }

                $consolidatedPayments[$methodName]['amount'] += $p->amount;

                if ($p->reference) {
                    $consolidatedPayments[$methodName]['references'][] = $p->reference;
                }
            }
            $paymentsArray = array_values($consolidatedPayments);
            $maxRows = max(count($services), count($paymentsArray));
            $maxRows = $maxRows > 0 ? $maxRows : 1;

            $rows = [];
            for ($i = 0; $i < $maxRows; $i++) {
                $pData = $paymentsArray[$i] ?? null;
                $rows[] = [
                    'key' => $appointmentId . '-' . $i,
                    'service' => $services[$i] ?? '',
                    'method' => $pData ? $pData['method'] : '',
                    'amount' => $pData ? (float) $pData['amount'] : null,
                    'reference' => $pData && !empty($pData['references']) ? implode(' | ', array_unique($pData['references'])) : ($pData ? 'N/A' : ''),
                    'recorded_by' => $pData ? $pData['recorder'] : '',
                ];
            }

            $groupedTableData[] = [
                'appointment_id' => $appointmentId,
                'date' => $firstPayment->created_at->format('d/m/Y H:i'),
                'patient' => $appointment->patient->name ?? 'N/A',
                'doctor' => $appointment->doctor->name ?? 'N/A',
                'rows' => $rows
            ];
        }

        $page = $request->input('page', 1);
        $perPage = 10;
        $groupedCollection = collect($groupedTableData);

        $paginatedTableData = new LengthAwarePaginator(
            $groupedCollection->forPage($page, $perPage)->values(),
            $groupedCollection->count(),
            $perPage,
            $page,
            ['path' => $request->url(), 'query' => $request->query()]
        );

        $totalsByMethod = [];
        foreach ($payments as $payment) {
            $methodName = $payment->method ? $payment->method->name : 'Desconocido';
            $totalsByMethod[$methodName] = ($totalsByMethod[$methodName] ?? 0) + $payment->amount;
        }

        $paymentMethodsDistribution = collect($totalsByMethod)->map(fn($val, $key) => [
            'name' => $key,
            'value' => (float) $val
        ])->values();

        $startOfSixMonths = $now->copy()->subMonths(5)->startOfMonth();
        $revenueOverTime = Payment::select(
            DB::raw('SUM(amount) as total_ingresos'),
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as mes")
        )
            ->where('created_at', '>=', $startOfSixMonths)
            ->groupBy('mes')
            ->orderBy('mes', 'asc')
            ->get()
            ->map(fn($item) => [
                'name' => Carbon::parse($item->mes . '-01')->locale('es')->isoFormat('MMMM YYYY'),
                'ingresos' => (float) $item->total_ingresos
            ]);

        $appointmentsQuery = Appointment::with(['patient', 'services', 'payments'])
            ->whereIn('status', ['scheduled', 'confirmed', 'completed'])
            ->whereBetween('start_time', [Carbon::parse($startDate)->startOfDay(), Carbon::parse($endDate)->endOfDay()]);

        if ($doctorId !== 'all') {
            $appointmentsQuery->where('doctor_id', $doctorId);
        }

        $appointments = $appointmentsQuery->get();

        $accountsReceivable = $appointments->filter(fn($app) => $app->balance > 0);

        $kpis = [
            'ingreso_total' => $payments->sum('amount'),
            'cuentas_por_cobrar' => $accountsReceivable->sum('balance'),
            'ticket_promedio' => $appointments->avg('total') ?? 0,
        ];

        $doctors = [];
        if ($user->hasRole(['super_admin', 'admin'])) {
            $doctors = User::role('doctor')->select('id', 'name')->orderBy('name')->get();
        } elseif ($user->hasRole(['assistant', 'receptionist'])) {
            $doctors = $user->doctors()->select('users.id', 'users.name')->orderBy('name')->get();
        }

        $paymentMethods = PaymentMethod::orderBy('name')->get(['id', 'name']);

        return Inertia::render('admin/reports/financial', [
            'payments' => $paginatedTableData,
            'filters' => compact('startDate', 'endDate', 'doctorId', 'methodId'),
            'summary' => ['total' => $kpis['ingreso_total'], 'by_method' => $totalsByMethod],
            'kpis' => $kpis,
            'revenueData' => $revenueOverTime,
            'paymentMethodsData' => $paymentMethodsDistribution,
            'doctors' => $doctors,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function export(Request $request)
    {
        $user = $request->user();

        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->format('Y-m-d'));
        $doctorId = $request->input('doctor_id', 'all');
        $methodId = $request->input('method_id', 'all');

        $query = Payment::with(['appointment.patient', 'appointment.doctor', 'appointment.services', 'recorder', 'method'])
            ->whereBetween('created_at', [
                Carbon::parse($startDate)->startOfDay(),
                Carbon::parse($endDate)->endOfDay()
            ]);

        if ($user->hasRole('doctor')) {
            $query->whereHas('appointment', fn($q) => $q->where('doctor_id', $user->id));
        } elseif ($user->hasRole(['assistant', 'receptionist'])) {
            $assignedDoctorIds = $user->doctors()->pluck('users.id')->toArray();
            if ($doctorId !== 'all' && in_array($doctorId, $assignedDoctorIds)) {
                $query->whereHas('appointment', fn($q) => $q->where('doctor_id', $doctorId));
            } else {
                $query->whereHas('appointment', fn($q) => $q->whereIn('doctor_id', $assignedDoctorIds));
            }
        } else {
            if ($doctorId !== 'all') {
                $query->whereHas('appointment', fn($q) => $q->where('doctor_id', $doctorId));
            }
        }

        if ($methodId !== 'all') {
            $query->where('payment_method_id', $methodId);
        }

        $payments = $query->latest()->get();
        $fileName = 'Reporte_financiero_' . date('Y-m-d_H-i') . '.csv';

        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        return response()->stream(function () use ($payments) {
            $file = fopen('php://output', 'w');
            fputs($file, "\xEF\xBB\xBF");

            fputcsv($file, ['Fecha de cobro', 'Paciente', 'Medico', 'Servicio(s)', 'Metodo de pago', 'Monto cobrado', 'Referencia', 'Cobrado por']);

            $groupedPayments = $payments->groupBy('appointment_id');

            foreach ($groupedPayments as $appointmentId => $appointmentPayments) {

                $firstPayment = $appointmentPayments->first();
                $appointment = $firstPayment->appointment;
                $services = $appointment && $appointment->services
                    ? $appointment->services->pluck('name')->toArray()
                    : [];

                $consolidatedPayments = [];
                foreach ($appointmentPayments as $p) {
                    $methodName = $p->method ? $p->method->name : 'Desconocido';

                    if (!isset($consolidatedPayments[$methodName])) {
                        $consolidatedPayments[$methodName] = [
                            'method' => $methodName,
                            'amount' => 0,
                            'references' => [],
                            'recorder' => $p->recorder->name ?? 'Sistema'
                        ];
                    }

                    $consolidatedPayments[$methodName]['amount'] += $p->amount;

                    if ($p->reference) {
                        $consolidatedPayments[$methodName]['references'][] = $p->reference;
                    }
                }

                $paymentsArray = array_values($consolidatedPayments);
                $maxRows = max(count($services), count($paymentsArray));
                $maxRows = $maxRows > 0 ? $maxRows : 1;

                for ($i = 0; $i < $maxRows; $i++) {

                    $isFirstRow = ($i === 0);

                    $fecha = $isFirstRow ? $firstPayment->created_at->format('d/m/Y H:i') : '';
                    $paciente = $isFirstRow ? ($appointment->patient->name ?? 'N/A') : '';
                    $medico = $isFirstRow ? ($appointment->doctor->name ?? 'N/A') : '';

                    $servicio = $services[$i] ?? '';

                    $paymentData = $paymentsArray[$i] ?? null;

                    if ($paymentData) {
                        $metodo = $paymentData['method'];
                        $monto = $paymentData['amount'];
                        $referencia = !empty($paymentData['references'])
                            ? implode(' | ', array_unique($paymentData['references']))
                            : 'N/A';

                        $cobradoPor = $paymentData['recorder'];
                    } else {
                        $metodo = '';
                        $monto = '';
                        $referencia = '';
                        $cobradoPor = '';
                    }

                    fputcsv($file, [
                        $fecha,
                        $paciente,
                        $medico,
                        $servicio,
                        $metodo,
                        $monto,
                        $referencia,
                        $cobradoPor
                    ]);
                }
            }
            fclose($file);
        }, 200, $headers);
    }
}

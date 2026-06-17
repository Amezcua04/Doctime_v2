<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Patient;
use App\Models\Service;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class AuditLogController extends Controller
{
    /**
     * Diccionario para traducir los nombres de los modelos a texto amigable para la ui.
     */
    protected array $auditableTypes = [
        'App\Models\Appointment' => 'Citas',
        'App\Models\Patient'     => 'Pacientes',
        'App\Models\User'        => 'Usuarios',
        'App\Models\Payment'     => 'Pagos',
        'App\Models\Service'     => 'Servicios',
        'App\Models\ClinicSetting' => 'Configuración',
    ];

    public function index(Request $request)
    {
        $query = Activity::with(['causer', 'subject'])->latest();

        $query->when($request->filled('type') && $request->type !== 'all', function ($q) use ($request) {
            $q->where('subject_type', $request->type);
        });

        $query->when($request->filled('event') && $request->event !== 'all', function ($q) use ($request) {
            $q->where('event', $request->event);
        });

        $query->when($request->filled('user_id') && $request->user_id !== 'all', function ($q) use ($request) {
            $q->where('causer_id', $request->user_id);
        });

        $query->when($request->filled('date_from'), function ($q) use ($request) {
            $q->whereDate('created_at', '>=', $request->date_from);
        });

        $query->when($request->filled('date_to'), function ($q) use ($request) {
            $q->whereDate('created_at', '<=', $request->date_to);
        });

        $query->when($request->filled('search'), function ($q) use ($request) {
            $search = $request->search;
            $q->where(function ($subQ) use ($search) {
                $subQ->where('description', 'like', "%{$search}%")
                    ->orWhereHas('causer', function ($causerQ) use ($search) {
                        $causerQ->where('name', 'like', "%{$search}%");
                    });
            });
        });

        $activities = $query->paginate(7)->withQueryString()
            ->through(function ($activity) {

                $rawProperties = $activity->getRawOriginal('attribute_changes') ?? $activity->getRawOriginal('properties');
                $decodedProperties = null;

                if ($rawProperties) {
                    $decodedProperties = is_string($rawProperties) ? json_decode($rawProperties, true) : $rawProperties;
                } elseif (is_iterable($activity->properties)) {
                    $decodedProperties = collect($activity->properties)->toArray();
                }

                return [
                    'id'                 => $activity->id,
                    'description'        => $activity->description,
                    'event'              => $activity->event,
                    'causer'             => $activity->causer ? [
                        'id'   => $activity->causer->id,
                        'name' => $activity->causer->name,
                    ] : null,
                    'subject_type_raw'   => $activity->subject_type,
                    'subject_type_human' => $this->auditableTypes[$activity->subject_type] ?? class_basename($activity->subject_type),
                    'subject_id'         => $activity->subject_id,
                    'subject_name'       => $this->getSubjectName($activity),
                    'properties'         => $this->formatProperties($decodedProperties),
                    'created_at'         => $activity->created_at->format('d/m/Y H:i'),
                    'created_at_human'   => $activity->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('admin/audit/index', [
            'logs'    => $activities,
            'filters' => $request->only(['search', 'type', 'event', 'user_id', 'date_from', 'date_to']),
            'options' => [
                'types'  => collect($this->auditableTypes)->map(fn($name, $class) => ['id' => $class, 'name' => $name])->values(),
                'events' => [
                    ['id' => 'all', 'name' => 'Todos los eventos'],
                    ['id' => 'created', 'name' => 'Creaciones'],
                    ['id' => 'updated', 'name' => 'Actualizaciones'],
                    ['id' => 'deleted', 'name' => 'Eliminaciones'],
                ],
                'users'  => User::select('id', 'name')->orderBy('name')->get(),
            ]
        ]);
    }

    /**
     * Helper para extraer un nombre legible del modelo afectado.
     * Evita que la UI muestre solo "ID: 5" si el modelo tiene un nombre.
     */
    private function getSubjectName($activity)
    {
        if (!$activity->subject) {
            $props = $activity->properties;

            if (isset($props['old'])) {
                $oldName = $props['old']['name'] ?? $props['old']['title'] ?? null;

                if ($activity->subject_type === 'App\Models\Appointment' && isset($props['old']['start_time'])) {
                    $fecha = Carbon::parse($props['old']['start_time'])->format('d/m/Y H:i');
                    return "Cita eliminada ({$fecha})";
                }

                if ($oldName) {
                    return "Eliminado: {$oldName}";
                }
            }
            return "Eliminado (ID: {$activity->subject_id})";
        }

        if ($activity->subject_type === 'App\Models\Appointment' && method_exists($activity->subject, 'patient')) {
            return $activity->subject->patient ? 'Cita de ' . $activity->subject->patient->name : "Cita #{$activity->subject_id}";
        }

        return $activity->subject->name
            ?? $activity->subject->title
            ?? "ID: {$activity->subject_id}";
    }

    /**
     * Recorre las propiedades (old y attributes) para resolver las relaciones.
     */
    private function formatProperties($properties)
    {
        if (!$properties) return null;

        $formatted = [];
        foreach (['old', 'attributes'] as $state) {
            if (isset($properties[$state]) && is_array($properties[$state])) {
                foreach ($properties[$state] as $key => $value) {
                    $formatted[$state][$key] = $this->resolveRelationValue($key, $value);
                }
            }
        }
        return $formatted;
    }

    /**
     * Convierte los IDs de las bases de datos en nombres legibles.
     */
    private function resolveRelationValue($key, $value)
    {
        if ($value === null || $value === '') return $value;

        switch ($key) {
            case 'doctor_id':
            case 'created_by':
            case 'user_id':
                $user = User::find($value);
                return $user ? $user->name : "ID: {$value} (Eliminado)";

            case 'patient_id':
                $patient = Patient::find($value);
                return $patient ? $patient->name : "ID: {$value} (Eliminado)";

            case 'appointment_id':
                $appointment = Appointment::with('patient')->find($value);
                return $appointment ? ($appointment->patient->name ?? "Cita #{$value}") : "Cita #{$value} (Eliminada)";

            case 'service_id':
                $service = Service::find($value);
                return $service ? $service->name : "ID: {$value} (Eliminado)";

            default:
                return $value;
        }
    }
}

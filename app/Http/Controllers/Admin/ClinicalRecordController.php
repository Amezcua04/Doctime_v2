<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\CatalogItem;
use App\Models\ContractTemplate;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ClinicalRecordController extends Controller
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
    public function show(Request $request, Patient $patient)
    {
        $patient->load([
            'medicalRecord.attachments',
            'contracts' => function ($query) {
                $query->latest();
            },
            'orthodonticNotes' => function ($query) {
                $query->orderBy('date', 'desc');
            },
            'odontogram.items.catalogItem'
        ]);

        if (!$patient->medicalRecord) {
            $patient->medicalRecord()->create([]);
            $patient->load('medicalRecord');
        }

        if (!$patient->odontogram) {
            $patient->odontogram()->create([
                'doctor_id' => Auth::id()
            ]);
            $patient->load('odontogram.items.catalogItem');
        }

        $search = $request->input('search');
        $sortField = $request->input('sortField', 'created_at');
        $sortDirection = $request->input('sortDirection', 'desc');

        $allowedSorts = ['folio', 'created_at', 'valid_until', 'total', 'status'];
        if (!in_array($sortField, $allowedSorts)) {
            $sortField = 'created_at';
        }

        $budgets = Budget::where('patient_id', $patient->id)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('folio', 'like', "%{$search}%")
                        ->orWhere('total', 'like', "%{$search}%")
                        ->orWhere('status', 'like', "%{$search}%");
                });
            })
            ->orderBy($sortField, $sortDirection)
            ->paginate(3)
            ->withQueryString();

        $patient->odontogram_items = $patient->odontogram ? $patient->odontogram->items : [];
        $templates = ContractTemplate::where('is_active', true)->get(['id', 'title', 'type', 'content']);
        $catalogItems = CatalogItem::with('category')->get();

        return Inertia::render('admin/patients/medical-record/index', [
            'patient' => $patient,
            'templates' => $templates,
            'catalogItems' => $catalogItems,
            'budgets' => $budgets,
            'odontogramId' => $patient->odontogram->id,
            'initialItems' => $patient->odontogram_items,
            'filters' => $request->only(['search', 'sortField', 'sortDirection']),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'blood_type'               => ['nullable', 'string', 'max:10'],
            'allergies'                => ['nullable', 'string', 'max:2000'],
            'pathological_history'     => ['nullable', 'string', 'max:2000'],
            'non_pathological_history' => ['nullable', 'string', 'max:2000'],
            'family_history'           => ['nullable', 'string', 'max:2000'],
        ], [
            'max' => 'El texto ingresado es demasiado largo. El límite es de 2000 caracteres.'
        ]);

        $patient->medicalRecord()->updateOrCreate(
            ['patient_id' => $patient->id],
            $validated
        );

        return redirect()->back()->with('success', 'Expediente clínico actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

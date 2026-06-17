<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CatalogItem;
use App\Models\ContractTemplate;
use App\Models\Patient;
use Illuminate\Http\Request;
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
    public function show(Patient $patient)
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
                'doctor_id' => auth()->id()
            ]);
            $patient->load('odontogram.items.catalogItem');
        }

        $patient->odontogram_items = $patient->odontogram ? $patient->odontogram->items : [];
        $templates = ContractTemplate::where('is_active', true)->get(['id', 'title', 'type', 'content']);
        $catalogItems = CatalogItem::with('category')->get();

        return Inertia::render('admin/patients/medical-record/index', [
            'patient' => $patient,
            'templates' => $templates,
            'catalogItems' => $catalogItems,
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

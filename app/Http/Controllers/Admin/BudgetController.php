<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Odontogram;
use App\Models\Patient;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BudgetController extends Controller
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
    public function create(Patient $patient)
    {
        // Obtener el último odontograma del paciente cargando únicamente los ítems planificados
        $odontogram = Odontogram::where('patient_id', $patient->id)
            ->latest()
            ->with(['items' => function ($query) {
                $query->where('status', 'planned')->with('catalogItem');
            }])
            ->first();

        // Mapear los ítems para estructurar el estado inicial del formulario de React
        $suggestedItems = $odontogram
            ? $odontogram->items->map(function ($item) {
                return [
                    'odontogram_item_id' => $item->id,
                    'catalog_item_id' => $item->catalogItem->id,
                    'name' => $item->catalogItem->name,
                    'tooth_number' => $item->tooth_number,
                    'surface' => $item->surface,
                    'unit_price' => (float) $item->catalogItem->default_cost, // Precio sugerido del catálogo
                    'quantity' => 1,
                    'discount' => 0.00,
                    'is_included' => true, // El médico puede desmarcarlo en la UI si no lo quiere cotizar aún
                ];
            })
            : [];

        return Inertia::render('Budgets/Create', [
            'patient' => $patient->only(['id', 'name', 'email']),
            'odontogram_id' => $odontogram?->id,
            'suggested_items' => $suggestedItems,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'odontogram_id' => ['nullable', 'exists:odontograms,id'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:today'],
            'global_discount' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'internal_notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.catalog_item_id' => ['required', 'exists:catalog_items,id'],
            'items.*.odontogram_item_id' => ['nullable', 'exists:odontogram_items,id'],
            'items.*.name' => ['required', 'string'],
            'items.*.tooth_number' => ['nullable', 'integer'],
            'items.*.surface' => ['nullable', 'string'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.discount' => ['required', 'numeric', 'min:0'],
        ]);

        // Envolver el flujo en una transacción de base de datos para evitar registros huérfanos
        $budget = DB::transaction(function () use ($validated) {
            $calculatedSubtotal = 0;
            $totalItemsDiscount = 0;
            $detailsData = [];

            // 1. Recalcular cada partida en el servidor
            foreach ($validated['items'] as $item) {
                $itemSubtotal = $item['unit_price'] * $item['quantity'];
                $itemTotal = $itemSubtotal - $item['discount'];

                $calculatedSubtotal += $itemSubtotal;
                $totalItemsDiscount += $item['discount'];

                // Construcción dinámica del concepto descriptivo inmutable (Snapshot)
                $concept = $item['name'];

                // Usamos isset() o ?? para evitar errores de llaves no definidas en arreglos anidados
                $toothNumber = $item['tooth_number'] ?? null;
                $surface = $item['surface'] ?? null;

                if (!empty($toothNumber)) {
                    $concept .= " - Diente {$toothNumber}";
                    if (!empty($surface) && $surface !== 'general') {
                        $concept .= " ({$surface})";
                    }
                }

                $detailsData[] = [
                    'catalog_item_id' => $item['catalog_item_id'],
                    // Aplicamos el null coalescing operator aquí también
                    'odontogram_item_id' => $item['odontogram_item_id'] ?? null,
                    'concept' => $concept,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'discount' => $item['discount'],
                    'total' => max(0, $itemTotal),
                ];
            }

            // 2. Determinar los totales generales finales
            $globalDiscount = $validated['global_discount'] ?? 0;
            $finalTotal = max(0, $calculatedSubtotal - ($totalItemsDiscount + $globalDiscount));

            // 3. Persistir la cabecera del Presupuesto
            $budget = Budget::create([
                'patient_id' => $validated['patient_id'],
                'odontogram_id' => $validated['odontogram_id'] ?? null,
                'doctor_id' => Auth::id(),
                'status' => 'draft',
                'valid_until' => $validated['valid_until'] ?? null,
                'subtotal' => $calculatedSubtotal,
                'discount' => $globalDiscount,
                'total' => $finalTotal,
                'notes' => $validated['notes'] ?? null,
                'internal_notes' => $validated['internal_notes'] ?? null,
            ]);

            // 4. Inserción masiva indexada de los detalles correspondientes
            $budget->details()->createMany($detailsData);
            $folio = 'COT-' . date('Y') . '-' . str_pad($budget->id, 5, '0', STR_PAD_LEFT);
            $budget->update(['folio' => $folio]);

            return $budget;
        });

        return redirect()->back()
            ->with('success', 'El presupuesto ha sido guardado.')
            ->with('new_budget_id', $budget->id);
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
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Patient $patient, Budget $budget)
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'required', 'string', 'in:draft,accepted,sent,rejected'],
        ]);

        if ($budget->patient_id !== $patient->id) {
            abort(403, 'Acción no autorizada.');
        }

        $budget->update($validated);

        return redirect()->back()->with('success', 'Presupuesto actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient, Budget $budget)
    {
        if ($budget->patient_id === $patient->id) {
            $budget->delete();
        }

        return redirect()->back()->with('success', 'Presupuesto eliminado.');
    }

    public function export(Patient $patient, string $budgetId)
    {
        $budget = Budget::with(['patient', 'doctor', 'details'])
            ->where('patient_id', $patient->id)
            ->findOrFail($budgetId);

        $clinic = DB::table('clinic_settings')->first();

        $pdf = Pdf::loadView('pdf.budget', compact('budget', 'clinic'))
            ->setPaper('letter', 'portrait');

        return $pdf->stream("Presupuesto-{$budget->patient->name}-{$budget->folio}.pdf");
    }

    /**
     * Send the budget via Email.
     */
    public function sendEmail(Patient $patient, Budget $budget)
    {
        if ($budget->patient_id !== $patient->id) {
            abort(403);
        }

        // Aquí disparas tu Mailable o Notificación de Laravel
        // Ejemplo: Mail::to($patient->email)->send(new BudgetNotification($budget));

        // Cambiamos el estado a 'enviado' automáticamente si estaba en borrador
        if ($budget->status === 'draft') {
            $budget->update(['status' => 'sent']);
        }

        return redirect()->back()->with('success', 'El presupuesto ha sido enviado por correo electrónico.');
    }

    /**
     * Send the budget via WhatsApp.
     */
    public function sendWhatsApp(Patient $patient, Budget $budget)
    {
        if ($budget->patient_id !== $patient->id) {
            abort(403);
        }

        // Aquí conectas tu servicio de WhatsApp (ej. Twilio, Meta API, etc.)
        // Puedes generar una plantilla que incluya el folio y el enlace al PDF:
        // $url = url("/admin/patients/{$patient->id}/budgets/{$budget->id}/export");

        if ($budget->status === 'draft') {
            $budget->update(['status' => 'sent']);
        }

        return redirect()->back()->with('success', 'El presupuesto ha sido enviado por WhatsApp.');
    }
}

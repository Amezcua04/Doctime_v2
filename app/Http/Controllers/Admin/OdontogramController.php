<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CatalogItem;
use App\Models\OdontogramItem;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OdontogramController extends Controller
{
    /**
     * Agrega un nuevo ítem (lesión, preexistencia o tratamiento)
     */
    public function storeItem(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'catalog_item_id' => ['required', 'exists:catalog_items,id'],
            'zones' => ['required', 'array'],
            'zones.*.tooth_number' => ['required', 'integer', 'min:11', 'max:85'],
            'zones.*.surface' => ['required', 'string', 'in:vestibular,lingual,mesial,distal,oclusal,general'],
        ]);

        $catalogItem = CatalogItem::findOrFail($validated['catalog_item_id']);

        $odontogram = $patient->odontogram()->firstOrCreate([
            'doctor_id' => Auth::id()
        ]);

        foreach ($validated['zones'] as $zone) {
            $odontogram->items()->updateOrCreate(
                [
                    'tooth_number' => $zone['tooth_number'],
                    'surface' => $zone['surface'],
                    'catalog_item_id' => $catalogItem->id,
                ],
                [
                    'status' => $catalogItem->type === 'treatment' ? 'planned' : 'preexistent',
                    'cost' => $catalogItem->default_cost ?? 0,
                ]
            );
        }

        return back()->with('success', 'Registros aplicados al odontograma.');
    }

    /**
     * Elimina un ítem específico usando la herramienta de borrador.
     */
    public function destroyItem(Patient $patient, OdontogramItem $item)
    {
        if ($patient->odontogram && $item->odontogram_id === $patient->odontogram->id) {
            $item->delete();
        }

        return back()->with('success', 'Registro eliminado.');
    }

    public function destroyBatch(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:odontogram_items,id'],
        ]);

        if ($patient->odontogram) {
            $patient->odontogram->items()->whereIn('id', $validated['ids'])->delete();
        }

        return back()->with('success', 'Registros eliminados correctamente.');
    }
}

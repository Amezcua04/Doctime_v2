<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CatalogItem;
use App\Models\TreatmentCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ClinicalCatalogController extends Controller
{
    /**
     * Obtiene todo el catálogo estructurado para los paneles de React
     */
    public function index(Request $request)
    {
        $query = CatalogItem::with('category');

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->type && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        $sort = $request->input('sort', 'name');
        $direction = $request->input('direction', 'asc');

        $allowedSorts = ['name', 'type', 'default_cost'];
        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction === 'desc' ? 'desc' : 'asc');
        }

        $items = $query->paginate(8)->withQueryString();

        return Inertia::render('admin/catalogs/index', [
            'items' => $items,
            'categories' => TreatmentCategory::all(),
            'filters' => [
                'search' => $request->input('search', ''),
                'type' => $request->input('type', 'all'),
                'sort' => $request->input('sort', ''),
                'direction' => $request->input('direction', ''),
            ],
        ]);
    }

    /**
     * Almacena un nuevo ítem (Lesión, Preexistencia o Tratamiento)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:lesion,preexistence,treatment',
            'name' => 'required|string|max:255',
            'requires_surface' => 'boolean',
            'image' => 'nullable|image|mimes:png,svg|max:2048',
            'treatment_category_id' => 'required_if:type,treatment|nullable|exists:treatment_categories,id',
            'default_cost' => 'required_if:type,treatment|nullable|numeric|min:0',
        ]);

        $data = collect($validated)->except('image')->toArray();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('odontogram_icons', 'public');
        }

        CatalogItem::create($data);

        return back()->with('success', 'Ítem agregado al catálogo.');
    }

    public function update(Request $request, CatalogItem $catalog)
    {
        $validated = $request->validate([
            'type' => 'required|in:lesion,preexistence,treatment',
            'name' => 'required|string|max:255',
            'requires_surface' => 'boolean',
            'image' => 'nullable|image|mimes:png,svg|max:2048',
            'treatment_category_id' => 'required_if:type,treatment|nullable|exists:treatment_categories,id',
            'default_cost' => 'required_if:type,treatment|nullable|numeric|min:0',
        ]);

        $data = collect($validated)->except('image')->toArray();

        if ($request->hasFile('image')) {
            if ($catalog->image_path) {
                Storage::disk('public')->delete($catalog->image_path);
            }
            $data['image_path'] = $request->file('image')->store('odontogram_icons', 'public');
        }

        $catalog->update($data);

        return back()->with('success', 'Ítem actualizado correctamente.');
    }

    public function destroy(CatalogItem $catalog)
    {
        if ($catalog->image_path) {
            Storage::disk('public')->delete($catalog->image_path);
        }

        $catalog->delete();

        return back()->with('success', 'Ítem eliminado del catálogo.');
    }
}

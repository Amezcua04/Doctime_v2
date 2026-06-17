<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TreatmentCategory;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:treatment_categories,name',
        ]);

        TreatmentCategory::create($validated);

        return back()->with('success', 'Categoría creada correctamente.');
    }

    public function update(Request $request, $id)
    {
        $category = TreatmentCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:treatment_categories,name,' . $category->id,
        ]);

        $category->update($validated);

        return back()->with('success', 'Categoría actualizada.');
    }

    public function destroy($id)
    {
        $category = TreatmentCategory::findOrFail($id);
        if ($category->items()->count() > 0) {
            return back()->withErrors(['error' => 'No puedes eliminar una categoría que tiene tratamientos asociados.']);
        }

        $category->delete();

        return back()->with('success', 'Categoría eliminada.');
    }
}

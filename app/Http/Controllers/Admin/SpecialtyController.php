<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Specialty;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpecialtyController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Specialty::query();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $sort = $request->input('sort', 'name');
        $direction = $request->input('direction', 'asc');

        $allowedSorts = ['name', 'is_active'];
        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction === 'desc' ? 'desc' : 'asc');
        }

        $specialties = $query->paginate(8)->withQueryString();

        return Inertia::render('admin/specialties/index', [
            'specialties' => $specialties,
            'filters' => $request->only(['search', 'sort', 'direction']),
        ]);
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
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:specialties,name',
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        if (!isset($validated['color'])) {
            $validated['color'] = '#3b82f6';
        }

        Specialty::create($validated);

        return back()->with('success', 'Especialidad creada correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Specialty $specialty)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Specialty $specialty)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Specialty $specialty)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:specialties,name,' . $specialty->id,
            'color' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        $specialty->update($validated);

        return back()->with('success', 'Especialidad actualizada correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Specialty $specialty)
    {
        $specialty->delete();

        return back()->with('success', 'Especialidad eliminada.');
    }
}

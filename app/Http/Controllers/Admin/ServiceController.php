<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Service::query();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $sort = $request->input('sort', 'name');
        $direction = $request->input('direction', 'asc');

        $allowedSorts = ['name', 'price', 'duration_min', 'is_active'];
        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction === 'desc' ? 'desc' : 'asc');
        }

        $services = $query->paginate(7)->withQueryString();

        return Inertia::render('admin/services/index', [
            'services' => $services,
            'filters' => [
                'search' => $request->input('search', ''),
                'sort' => $request->input('sort', ''),
                'direction' => $request->input('direction', ''),
            ],
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
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_min' => 'required|integer|min:5',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
        ]);

        Service::create($validated);

        return back()->with('success', 'Servicio creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Service $service)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Service $service)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration_min' => 'required|integer|min:5',
            'is_active' => 'boolean',
            'is_public' => 'boolean',
        ]);

        $service->update($validated);

        return back()->with('success', 'Servicio actualizado.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $service)
    {
        $service->delete();

        return back()->with('success', 'Servicio eliminado.');
    }
}

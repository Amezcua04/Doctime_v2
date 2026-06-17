<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PaymentMethod::query();

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $sort = $request->input('sort', 'name');
        $direction = $request->input('direction', 'asc');

        $allowedSorts = ['name', 'is_active'];
        if (in_array($sort, $allowedSorts)) {
            $query->orderBy($sort, $direction === 'desc' ? 'desc' : 'asc');
        }

        $methods = $query->paginate(8)->withQueryString();

        return Inertia::render('admin/payment-methods/index', [
            'methods' => $methods,
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
            'name' => 'required|string|max:255|unique:payment_methods,name',
            'is_active' => 'boolean'
        ], [
            'name.required' => 'El nombre del método es obligatorio.',
            'name.unique' => 'Ya existe un método de pago con este nombre.',
        ]);

        PaymentMethod::create([
            'name' => $validated['name'],
            'is_active' => $request->boolean('is_active', true)
        ]);

        return back()->with('success', 'Método de pago creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(PaymentMethod $paymentMethod)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(PaymentMethod $paymentMethod)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PaymentMethod $paymentMethod)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:payment_methods,name,' . $paymentMethod->id,
            'is_active' => 'boolean'
        ]);

        $paymentMethod->update([
            'name' => $validated['name'],
            'is_active' => $request->boolean('is_active')
        ]);

        return back()->with('success', 'Método de pago actualizado.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PaymentMethod $paymentMethod)
    {
        if ($paymentMethod->payments()->count() > 0) {
            return back()->withErrors(['error' => 'No puedes eliminar un método que ya tiene cobros registrados.']);
        }

        $paymentMethod->delete();

        return back()->with('success', 'Método de pago eliminado permanentemente.');
    }
}

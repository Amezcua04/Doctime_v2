<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AssignAssistantRequest;
use App\Models\User;
use Illuminate\Http\Request;

class DoctorAssistantController extends Controller
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
    public function store(AssignAssistantRequest $request)
    {
        $doctor = User::findOrFail($request->doctor_id);

        $doctor->assistants()->syncWithoutDetaching([$request->assistant_id]);

        return redirect()->back()->with('success', 'Asistente asignado correctamente.');
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
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $doctor, User $assistant)
    {
        $doctor->assistants()->detach($assistant->id);

        return redirect()->back()->with('success', 'Asignación eliminada.');
    }
}

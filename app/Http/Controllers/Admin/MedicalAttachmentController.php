<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MedicalAttachment;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MedicalAttachmentController extends Controller
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
    public function store(Request $request, Patient $patient)
    {
        $request->validate([
            'title'    => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'notes'    => ['nullable', 'string', 'max:1000'],
            'file'     => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp,doc,docx', 'max:10240'],
        ], [
            'file.mimes' => 'El archivo debe ser formato PDF, Imagen o Word.',
            'file.max'   => 'El archivo no debe pesar más de 10MB.',
        ]);

        $medicalRecord = $patient->medicalRecord()->firstOrCreate([]);

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('medical_attachments', 'public');

            $medicalRecord->attachments()->create([
                'title'     => $request->title,
                'category'  => $request->category,
                'file_path' => $filePath,
                'notes'     => $request->notes,
            ]);
        }

        return redirect()->back()->with('success', 'Archivo adjunto guardado exitosamente.');
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
    public function destroy(Patient $patient, MedicalAttachment $attachment)
    {
        if ($attachment->medical_record_id !== $patient->medicalRecord?->id) {
            abort(403, 'No tienes permiso para eliminar este archivo.');
        }

        if (Storage::disk('public')->exists($attachment->file_path)) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        $attachment->delete();

        return redirect()->back()->with('success', 'Archivo adjunto eliminado permanentemente.');
    }

    public function viewFile(Patient $patient, MedicalAttachment $attachment)
    {
        if ($attachment->medical_record_id !== $patient->medicalRecord?->id) {
            abort(403, 'No tienes permiso para ver este archivo.');
        }

        if (!Storage::disk('public')->exists($attachment->file_path)) {
            abort(404, 'Archivo no encontrado.');
        }

        $path = Storage::disk('public')->path($attachment->file_path);
        $mimeType = Storage::disk('public')->mimeType($attachment->file_path);

        // Extraemos la extensión del archivo guardado (ej. 'jpg', 'pdf')
        $extension = pathinfo($attachment->file_path, PATHINFO_EXTENSION);
        // Creamos el nombre completo
        $filename = $attachment->title . '.' . $extension;

        return response()->file($path, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $filename . '"'
        ]);
    }

    public function downloadFile(Patient $patient, MedicalAttachment $attachment)
    {
        if ($attachment->medical_record_id !== $patient->medicalRecord?->id) {
            abort(403, 'No tienes permiso para descargar este archivo.');
        }

        if (!Storage::disk('public')->exists($attachment->file_path)) {
            abort(404, 'Archivo no encontrado.');
        }

        $path = Storage::disk('public')->path($attachment->file_path);

        // Extraemos la extensión del archivo guardado
        $extension = pathinfo($attachment->file_path, PATHINFO_EXTENSION);
        // Creamos el nombre completo
        $downloadName = $attachment->title . '.' . $extension;

        // Pasamos el nombre con su extensión para la descarga
        return response()->download($path, $downloadName);
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ClinicSetting;
use App\Models\ContractTemplate;
use App\Models\Patient;
use App\Models\PatientContract;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PatientContractController extends Controller
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
            'title' => ['required', 'string', 'max:255'],
            'file'  => ['required', 'file', 'mimes:pdf,doc,docx', 'max:5120'],
        ], [
            'file.mimes' => 'El contrato debe ser un archivo PDF o Word.',
            'file.max'   => 'El archivo no debe superar los 5MB.',
        ]);

        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('patient_contracts', 'public');

            $patient->contracts()->create([
                'title'     => $request->title,
                'file_path' => $filePath,
                'status'    => 'pending',
            ]);
        }

        return redirect()->back()->with('success', 'Documento agregado exitosamente al expediente.');
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
    public function destroy(Patient $patient, PatientContract $contract)
    {
        if ($contract->patient_id !== $patient->id) {
            abort(403, 'Acción no permitida.');
        }

        if (Storage::disk('public')->exists($contract->file_path)) {
            Storage::disk('public')->delete($contract->file_path);
        }

        $contract->delete();

        return redirect()->back()->with('success', 'Documento eliminado del sistema.');
    }

    public function viewFile(Patient $patient, $contractId)
    {
        $contract = $patient->contracts()->findOrFail($contractId);

        if (!Storage::disk('public')->exists($contract->file_path)) {
            abort(404, 'Archivo no encontrado.');
        }

        $path = Storage::disk('public')->path($contract->file_path);
        $mimeType = Storage::disk('public')->mimeType($contract->file_path);
        $extension = pathinfo($contract->file_path, PATHINFO_EXTENSION);
        $filename = $contract->title . '.' . $extension;

        return response()->file($path, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $filename . '"'
        ]);
    }

    public function downloadFile(Patient $patient, $contractId)
    {
        $contract = $patient->contracts()->findOrFail($contractId);

        if (!Storage::disk('public')->exists($contract->file_path)) {
            abort(404, 'Archivo no encontrado.');
        }

        $path = Storage::disk('public')->path($contract->file_path);

        $extension = pathinfo($contract->file_path, PATHINFO_EXTENSION);
        $downloadName = $contract->title . '.' . $extension;

        return response()->download($path, $downloadName);
    }

    public function generate(Request $request, Patient $patient)
    {
        $settings = ClinicSetting::first();
        $request->validate([
            'template_id' => ['required', 'exists:contract_templates,id'],
            'variables'   => ['nullable', 'array'],
        ]);

        $template = ContractTemplate::findOrFail($request->template_id);
        $html = $template->content;

        if ($request->filled('variables')) {
            foreach ($request->variables as $key => $value) {
                $html = str_replace('{{ ' . $key . ' }}', $value, $html);
            }
        }

        $logoPath = null;
        if ($settings && $settings->logo_path && Storage::disk('public')->exists($settings->logo_path)) {
            $logoPath = Storage::disk('public')->path($settings->logo_path);
        } else {
            $logoPath = public_path('apple-touch-icon.png');
        }

        $logoBase64 = '';
        if (file_exists($logoPath)) {
            $mime = mime_content_type($logoPath);
            $logoBase64 = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($logoPath));
        }

        $now = now()->timezone('America/Mazatlan');
        $html = str_replace('{{ clinica_logo }}', $logoBase64, $html);
        $html = str_replace('{{ clinica_nombre }}', $settings->name ?? 'SUNRISE', $html);
        $html = str_replace('{{ patient_name }}', $patient->name, $html);
        $html = str_replace('{{ dia_actual }}', $now->format('d'), $html);
        $html = str_replace('{{ mes_actual }}', $now->translatedFormat('F'), $html);
        $html = str_replace('{{ anio_actual }}', $now->format('Y'), $html);

        $html = str_replace('{{ signature_image }}', '<div style="height: 100px;"></div>', $html);

        $finalHtml = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
            <style>
                body { font-family: "DejaVu Sans", sans-serif; }
            </style>
        </head>
        <body>' . $html . '</body>
        </html>';

        $pdf = Pdf::loadHTML($finalHtml);
        $fileName = 'medical_attachments/contrato_' . $patient->id . '_' . time() . '.pdf';
        Storage::disk('public')->put($fileName, $pdf->output());

        $patient->contracts()->create([
            'title'                => $template->title,
            'file_path'            => $fileName,
            'status'               => 'pending',
            'contract_template_id' => $template->id,
            'is_generated'         => true,
            'metadata'             => $request->variables,
        ]);

        return redirect()->back()->with('success', 'Documento generado exitosamente.');
    }

    /**
     * Marca un contrato como firmado.
     */
    public function markAsSigned(Request $request, Patient $patient, $contractId)
    {
        $settings = ClinicSetting::first();
        $contract = $patient->contracts()->findOrFail($contractId);

        if ($contract->is_generated && $request->filled('signature')) {
            $template = ContractTemplate::findOrFail($contract->contract_template_id);
            $html = $template->content;

            if (!empty($contract->metadata)) {
                foreach ($contract->metadata as $key => $value) {
                    $html = str_replace('{{ ' . $key . ' }}', $value, $html);
                }
            }

            $logoPath = null;
            if ($settings && $settings->logo_path && Storage::disk('public')->exists($settings->logo_path)) {
                $logoPath = Storage::disk('public')->path($settings->logo_path);
            } else {
                $logoPath = public_path('apple-touch-icon.png');
            }

            $logoBase64 = '';
            if (file_exists($logoPath)) {
                $mime = mime_content_type($logoPath);
                $logoBase64 = 'data:' . $mime . ';base64,' . base64_encode(file_get_contents($logoPath));
            }

            $now = now()->timezone('America/Mazatlan');
            $html = str_replace('{{ clinica_logo }}', $logoBase64, $html);
            $html = str_replace('{{ clinica_nombre }}', $settings->name ?? 'SUNRISE', $html);
            $html = str_replace('{{ patient_name }}', $patient->name, $html);
            $html = str_replace('{{ dia_actual }}', $now->format('d'), $html);
            $html = str_replace('{{ mes_actual }}', $now->translatedFormat('F'), $html);
            $html = str_replace('{{ anio_actual }}', $now->format('Y'), $html);

            $imgTag = '<img src="' . $request->signature . '" height="100" />';
            $html = str_replace('{{ signature_image }}', $imgTag, $html);

            $finalHtml = '
            <!DOCTYPE html>
            <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
                <style>
                    body { font-family: "DejaVu Sans", sans-serif; }
                </style>
            </head>
            <body>' . $html . '</body>
            </html>';

            $pdf = Pdf::loadHTML($finalHtml);
            $oldPath = $contract->file_path;
            $newFileName = 'medical_attachments/contrato_firmado_' . $patient->id . '_' . time() . '.pdf';

            Storage::disk('public')->put($newFileName, $pdf->output());
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }

            $contract->update([
                'file_path' => $newFileName,
                'status' => 'signed',
                'signed_at' => now(),
            ]);
        } else {
            $contract->update([
                'status' => 'signed',
                'signed_at' => now(),
            ]);
        }

        return redirect()->back()->with('success', 'Documento firmado exitosamente.');
    }
}

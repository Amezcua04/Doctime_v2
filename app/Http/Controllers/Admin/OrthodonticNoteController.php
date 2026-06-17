<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OrthodonticNote;
use App\Models\Patient;
use Illuminate\Http\Request;

class OrthodonticNoteController extends Controller
{
    public function sync(Request $request, Patient $patient)
    {
        $request->validate([
            'notes' => ['array'],
            'notes.*.date' => ['required', 'date'],
            'notes.*.upper_arch' => ['nullable', 'string', 'max:255'],
            'notes.*.lower_arch' => ['nullable', 'string', 'max:255'],
            'notes.*.others' => ['nullable', 'string', 'max:255'],
            'notes.*.planned_operation' => ['nullable', 'string', 'max:255'],
        ]);

        foreach ($request->notes as $noteData) {
            if (isset($noteData['id'])) {
                $patient->orthodonticNotes()->where('id', $noteData['id'])->update([
                    'date' => $noteData['date'],
                    'upper_arch' => $noteData['upper_arch'],
                    'lower_arch' => $noteData['lower_arch'],
                    'others' => $noteData['others'],
                    'planned_operation' => $noteData['planned_operation'],
                ]);
            } else {
                $patient->orthodonticNotes()->create([
                    'date' => $noteData['date'],
                    'upper_arch' => $noteData['upper_arch'],
                    'lower_arch' => $noteData['lower_arch'],
                    'others' => $noteData['others'],
                    'planned_operation' => $noteData['planned_operation'],
                ]);
            }
        }

        return redirect()->back()->with('success', 'Bitácora actualizada correctamente.');
    }

    public function destroy(Patient $patient, OrthodonticNote $note)
    {
        if ($note->patient_id === $patient->id) {
            $note->delete();
        }

        return redirect()->back()->with('success', 'Nota eliminada del expediente.');
    }
}

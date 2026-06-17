<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AssignAssistantRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasAnyRole(['super_admin', 'admin']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'doctor_id' => ['required', 'exists:users,id'],
            'assistant_id' => ['required', 'exists:users,id'],
        ];
    }

    public function after(): array
    {
        return [
            function ($validator) {
                $doctor = User::find($this->doctor_id);
                $assistant = User::find($this->assistant_id);

                if (!$doctor || !$doctor->hasRole('doctor')) {
                    $validator->errors()->add('doctor_id', 'El usuario seleccionado no es un médico.');
                }

                if (!$assistant || !$assistant->hasRole('assistant')) {
                    $validator->errors()->add('assistant_id', 'El usuario seleccionado no es un asistente.');
                }
            }
        ];
    }
}

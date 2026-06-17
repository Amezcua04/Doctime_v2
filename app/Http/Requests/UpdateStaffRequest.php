<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateStaffRequest extends FormRequest
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
        $userId = $this->route('user')->id;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => ['required', 'string', 'in:admin,doctor,assistant'],

            // Validaciones condicionales para médicos
            'specialty' => ['required_if:role,doctor', 'nullable', 'string', 'max:100'],
            'license' => ['required_if:role,doctor', 'nullable', 'string', 'max:50'],
            'bio' => ['nullable', 'string', 'max:500'],

            // Validaciones para asistentes
            'assigned_doctor_ids' => ['nullable', 'array'],
            'assigned_doctor_ids.*' => [
                'exists:users,id',
                'distinct',
            ],
        ];
    }
}

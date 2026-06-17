<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole('doctor');
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'schedule' => 'present|array',
            'schedule.*.day_of_week' => 'required|integer|between:0,6',
            'schedule.*.enabled' => 'boolean',
            'schedule.*.slots' => ['array', function ($attribute, $value, $fail) {
                $slots = collect($value);
                $sorted = $slots->sortBy('start_time')->values();

                for ($i = 0; $i < $sorted->count() - 1; $i++) {
                    $current = $sorted[$i];
                    $next = $sorted[$i + 1];

                    if ($current['end_time'] > $next['start_time']) {
                        $fail("Los turnos no pueden solaparse (El turno de {$current['end_time']} choca con el de {$next['start_time']}).");
                    }
                }
            }],
            'schedule.*.slots.*.start_time' => 'required|date_format:H:i',
            'schedule.*.slots.*.end_time' => 'required|date_format:H:i|after:schedule.*.slots.*.start_time',
        ];
    }

    public function messages(): array
    {
        return [
            'schedule.*.slots.*.end_time.after' => 'La hora de fin debe ser posterior a la de inicio.',
        ];
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Patient extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'birth_date',
        'gender',
        'address',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function medicalRecord(): HasOne
    {
        return $this->hasOne(MedicalRecord::class);
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(PatientContract::class);
    }

    public function orthodonticNotes(): HasMany
    {
        return $this->hasMany(OrthodonticNote::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class)->orderBy('start_time', 'desc');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->setDescriptionForEvent(function (string $eventName) {
                $traducciones = [
                    'created'  => 'creado',
                    'updated'  => 'actualizado',
                    'deleted'  => 'eliminado',
                    'restored' => 'restaurado',
                ];

                $accion = $traducciones[$eventName] ?? $eventName;

                return "El paciente fue {$accion}";
            });
    }

    public function odontogram(): HasOne
    {
        return $this->hasOne(Odontogram::class);
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(Budget::class);
    }
}

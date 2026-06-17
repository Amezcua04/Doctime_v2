<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Activity;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Appointment extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'uuid',
        'doctor_id',
        'patient_id',
        'created_by',
        'start_time',
        'end_time',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'notes' => 'encrypted',
            'start_time' => 'datetime',
            'end_time' => 'datetime',
        ];
    }

    protected static function booted()
    {
        static::creating(function ($appointment) {
            $appointment->uuid = (string) Str::uuid();
        });
    }

    protected function serializeDate(\DateTimeInterface $date)
    {
        return $date->format('Y-m-d\TH:i:s');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class)
            ->withPivot('price', 'quantity')
            ->withTimestamps();
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function getTotalAttribute()
    {
        return $this->services->sum(function ($service) {
            return $service->pivot->price * $service->pivot->quantity;
        });
    }

    public function getPaidAmountAttribute()
    {
        return $this->payments->sum('amount');
    }

    public function getBalanceAttribute()
    {
        return $this->total - $this->paid_amount;
    }

    public function getPaymentStatusAttribute()
    {
        if ($this->paid_amount <= 0) return 'pending';
        if ($this->balance > 0) return 'partial';
        return 'paid';
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['*'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(function (string $eventName) {
                $traducciones = [
                    'created'  => 'creada',
                    'updated'  => 'actualizada',
                    'deleted'  => 'eliminada',
                    'restored' => 'restaurada',
                ];

                $accion = $traducciones[$eventName] ?? $eventName;

                return "La cita fue {$accion}";
            });
    }

    public function activities(): MorphMany
    {
        return $this->morphMany(Activity::class, 'subject');
    }
}

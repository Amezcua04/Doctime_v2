<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Payment extends Model
{
    use LogsActivity;

    protected $fillable = [
        'appointment_id',
        'recorded_by',
        'payment_method_id',
        'amount',
        'reference',
        'notes'
    ];

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function method(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class, 'payment_method_id');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['*'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(function (string $eventName) {
                $traducciones = [
                    'created'  => 'creado',
                    'updated'  => 'actualizado',
                    'deleted'  => 'eliminado',
                    'restored' => 'restaurado',
                ];

                $accion = $traducciones[$eventName] ?? $eventName;

                return "El pago fue {$accion}";
            });
    }
}

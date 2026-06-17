<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Service extends Model
{
    use SoftDeletes, LogsActivity;

    protected $fillable = [
        'name',
        'description',
        'price',
        'duration_min',
        'is_active',
        'is_public'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_public' => 'boolean',
        'price' => 'decimal:2'
    ];

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

                return "El servicio fue {$accion}";
            });
    }
}

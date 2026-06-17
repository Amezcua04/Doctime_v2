<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class ClinicSetting extends Model
{
    use LogsActivity;

    protected $fillable = [
        'name',
        'slogan',
        'phone',
        'address',
        'hero_title',
        'hero_description',
        'logo_path',
        'favicon_path',
        'enable_email_reminders',
        'enable_whatsapp_reminders',
        'reminder_hours_before',
        'whatsapp_phone_id',
        'whatsapp_api_token',
    ];

    protected $casts = [
        'enable_email_reminders' => 'boolean',
        'enable_whatsapp_reminders' => 'boolean',
        'reminder_hours_before' => 'integer',
        'whatsapp_api_token' => 'encrypted',
    ];

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
                
                return "La configuración fue {$accion}";
            });
    }
}

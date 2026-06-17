<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'color'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable, HasRoles, SoftDeletes, LogsActivity;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function medicalProfile(): HasOne
    {
        return $this->hasOne(MedicalProfile::class);
    }

    public function assistants(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'doctor_assistant', 'doctor_id', 'assistant_id')
            ->withTimestamps()
            ->whereNull('doctor_assistant.deleted_at');
    }

    public function doctors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'doctor_assistant', 'assistant_id', 'doctor_id')
            ->withTimestamps()
            ->whereNull('doctor_assistant.deleted_at');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(DoctorSchedule::class);
    }

    public function absences(): HasMany
    {
        return $this->hasMany(DoctorAbsence::class);
    }

    public function isWorkingToday()
    {
        $today = now()->dayOfWeek;
        return $this->schedules()->where('day_of_week', $today)->exists();
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'doctor_id');
    }

    public function unreadMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'receiver_id')->whereNull('read_at');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['*'])
            ->logOnlyDirty()
            ->logExcept(['password', 'remember_token'])
            ->setDescriptionForEvent(function (string $eventName) {
                $traducciones = [
                    'created'  => 'creado',
                    'updated'  => 'actualizado',
                    'deleted'  => 'eliminado',
                    'restored' => 'restaurado',
                ];

                $accion = $traducciones[$eventName] ?? $eventName;

                return "El usuario fue {$accion}";
            });
    }
}

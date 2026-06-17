<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MedicalProfile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'photo_path',
        'license',
        'bio',
        'is_public'
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function specialties()
    {
        return $this->belongsToMany(Specialty::class)
            ->withTimestamps();
    }
}

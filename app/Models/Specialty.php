<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Specialty extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'color', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function medicalProfiles()
    {
        return $this->belongsToMany(MedicalProfile::class)
            ->withTimestamps();
    }
}

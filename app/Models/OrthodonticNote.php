<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrthodonticNote extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'date',
        'upper_arch',
        'lower_arch',
        'others',
        'planned_operation',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}

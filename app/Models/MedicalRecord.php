<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalRecord extends Model
{
    protected $fillable = [
        'patient_id',
        'blood_type',
        'allergies',
        'pathological_history',
        'non_pathological_history',
        'family_history'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function attachments()
    {
        return $this->hasMany(MedicalAttachment::class);
    }
}

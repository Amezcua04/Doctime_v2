<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientContract extends Model
{
    protected $fillable = [
        'patient_id',
        'title',
        'file_path',
        'metadata',
        'signed_at',
        'status',
        'contract_template_id',
        'is_generated',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
        'is_generated' => 'boolean',
        'metadata' => 'array',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function template()
    {
        return $this->belongsTo(ContractTemplate::class, 'contract_template_id');
    }
}

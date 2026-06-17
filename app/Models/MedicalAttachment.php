<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicalAttachment extends Model
{
    protected $fillable = [
        'medical_record_id',
        'title',
        'category',
        'file_path',
        'notes'
    ];

    public function medicalRecord()
    {
        return $this->belongsTo(MedicalRecord::class);
    }
}

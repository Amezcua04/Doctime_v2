<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CatalogItem extends Model
{
    protected $fillable = [
        'type',
        'treatment_category_id',
        'name',
        'image_path',
        'requires_surface',
        'default_cost'
    ];

    protected $casts = [
        'requires_surface' => 'boolean',
        'default_cost' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(TreatmentCategory::class, 'treatment_category_id');
    }
}

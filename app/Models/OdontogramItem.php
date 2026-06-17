<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OdontogramItem extends Model
{
    protected $fillable = [
        'odontogram_id',
        'catalog_item_id',
        'tooth_number',
        'surface',
        'status',
        'cost',
        'observations'
    ];

    protected $casts = [
        'cost' => 'decimal:2',
    ];

    public function odontogram(): BelongsTo
    {
        return $this->belongsTo(Odontogram::class);
    }

    public function catalogItem(): BelongsTo
    {
        return $this->belongsTo(CatalogItem::class);
    }
}

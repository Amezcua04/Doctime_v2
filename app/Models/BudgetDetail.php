<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BudgetDetail extends Model
{
    protected $fillable = [
        'budget_id',
        'catalog_item_id',
        'odontogram_item_id',
        'concept',
        'quantity',
        'unit_price',
        'discount',
        'total',
    ];

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class);
    }

    public function catalogItem(): BelongsTo
    {
        return $this->belongsTo(CatalogItem::class);
    }

    public function odontogramItem(): BelongsTo
    {
        return $this->belongsTo(OdontogramItem::class);
    }
}

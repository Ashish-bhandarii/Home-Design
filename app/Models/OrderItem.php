<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'orderable_id',
        'orderable_type',
        'name',
        'description',
        'image',
        'price',
        'quantity',
        'total',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    /**
     * Get the order that owns the item.
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the orderable model (Furniture or Material).
     */
    public function orderable(): MorphTo
    {
        return $this->morphTo();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'cartable_id',
        'cartable_type',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'integer',
    ];

    public function cartable()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

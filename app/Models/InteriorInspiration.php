<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InteriorInspiration extends Model
{
    use HasFactory;

    protected $fillable = [
        'ulid',
        'slug',
        'label',
        'category',
        'swatch',
        'note',
        'asset_path',
        'source_url',
        'is_active',
        'meta',
    ];

    protected $casts = [
        'is_active' => 'bool',
        'meta' => 'array',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

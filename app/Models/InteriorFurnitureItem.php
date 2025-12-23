<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InteriorFurnitureItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'ulid',
        'slug',
        'name',
        'category',
        'style',
        'width',
        'length',
        'height',
        'price',
        'suitable_for',
        'primary_color',
        'finish',
        'thumbnail_path',
        'model_path',
        'is_active',
        'meta',
    ];

    protected $casts = [
        'width' => 'float',
        'length' => 'float',
        'height' => 'float',
        'price' => 'int',
        'suitable_for' => 'array',
        'is_active' => 'bool',
        'meta' => 'array',
    ];

    public function roomTemplates()
    {
        return $this->belongsToMany(InteriorRoomTemplate::class, 'furniture_room_template')
            ->withPivot(['is_primary', 'note'])
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

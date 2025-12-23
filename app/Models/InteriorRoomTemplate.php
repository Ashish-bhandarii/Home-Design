<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InteriorRoomTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'ulid',
        'slug',
        'name',
        'width',
        'length',
        'level',
        'description',
        'tags',
        'default_material_id',
        'default_lighting_id',
        'is_active',
        'meta',
    ];

    protected $casts = [
        'width' => 'float',
        'length' => 'float',
        'level' => 'int',
        'tags' => 'array',
        'is_active' => 'bool',
        'meta' => 'array',
    ];

    public function defaultMaterial()
    {
        return $this->belongsTo(InteriorMaterial::class, 'default_material_id');
    }

    public function defaultLighting()
    {
        return $this->belongsTo(InteriorLightingPreset::class, 'default_lighting_id');
    }

    public function materials()
    {
        return $this->belongsToMany(InteriorMaterial::class, 'material_room_template')
            ->withPivot(['is_default'])
            ->withTimestamps();
    }

    public function furnitureItems()
    {
        return $this->belongsToMany(InteriorFurnitureItem::class, 'furniture_room_template')
            ->withPivot(['is_primary', 'note'])
            ->withTimestamps();
    }

    public function defaultRooms()
    {
        return $this->hasMany(InteriorDefaultRoom::class, 'room_template_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

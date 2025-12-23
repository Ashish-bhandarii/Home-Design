<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InteriorMaterial extends Model
{
    use HasFactory;

    protected $fillable = [
        'ulid',
        'slug',
        'name',
        'floor_color',
        'wall_color',
        'accent_color',
        'lighting_color',
        'mood',
        'description',
        'applies_to',
        'is_active',
        'meta',
    ];

    protected $casts = [
        'applies_to' => 'array',
        'is_active' => 'bool',
        'meta' => 'array',
    ];

    public function roomTemplates()
    {
        return $this->belongsToMany(InteriorRoomTemplate::class, 'material_room_template')
            ->withPivot(['is_default'])
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

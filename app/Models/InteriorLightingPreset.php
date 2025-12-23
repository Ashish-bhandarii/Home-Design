<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InteriorLightingPreset extends Model
{
    use HasFactory;

    protected $fillable = [
        'ulid',
        'slug',
        'name',
        'temperature',
        'brightness',
        'tint',
        'description',
        'is_active',
        'meta',
    ];

    protected $casts = [
        'is_active' => 'bool',
        'meta' => 'array',
    ];

    public function roomTemplates()
    {
        return $this->hasMany(InteriorRoomTemplate::class, 'default_lighting_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

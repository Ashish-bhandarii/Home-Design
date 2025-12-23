<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Material extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'category',
        'type',
        'price_per_unit',
        'unit',
        'image',
        'color',
        'brand',
        'specifications',
        'availability',
        'stock',
        'is_active',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'price_per_unit' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($material) {
            if (empty($material->slug)) {
                $material->slug = Str::slug($material->name);
            }
        });
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return null;
    }

    public static function categories()
    {
        return ['Construction', 'Flooring', 'Wall Finish', 'Color Palette'];
    }

    public static function types()
    {
        return [
            'Construction' => ['Structural', 'Masonry', 'Binding', 'Reinforcement'],
            'Flooring' => ['Ceramic', 'Engineered', 'Natural Stone', 'Vinyl'],
            'Wall Finish' => ['Paint', 'Wallpaper', 'Stone', 'Tile'],
            'Color Palette' => ['Interior', 'Exterior', 'Accent'],
        ];
    }

    public static function units()
    {
        return ['piece', 'sq.ft', 'cu.m', 'liter', 'bag', 'kg', 'meter'];
    }
}

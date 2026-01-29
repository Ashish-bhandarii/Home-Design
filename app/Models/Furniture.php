<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Furniture extends Model
{
    use HasFactory;

    protected $table = 'furniture';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'category',
        'room',
        'price',
        'image',
        'dimensions',
        'material',
        'color',
        'stock',
        'availability',
        'is_active',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'dimensions' => 'array',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($furniture) {
            if (empty($furniture->slug)) {
                $furniture->slug = Str::slug($furniture->name);
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

    public function scopeByRoom($query, $room)
    {
        return $query->where('room', $room);
    }

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        return null;
    }

    /**
     * Get computed availability based on stock
     * Availability is purely computed from stock - no manual override needed
     */
    public function getComputedAvailabilityAttribute()
    {
        $stock = $this->stock;
        
        // If stock is null (not set), treat as available
        if ($stock === null) {
            return 'In Stock';
        }
        
        if ($stock <= 0) {
            return 'Out of Stock';
        } elseif ($stock <= 5) {
            return 'Limited Stock';
        }
        
        return 'In Stock';
    }

    /**
     * Check if item is available for purchase
     */
    public function isAvailable(): bool
    {
        return $this->stock === null || $this->stock > 0;
    }

    /**
     * Get available stock quantity
     */
    public function getAvailableStockAttribute(): int
    {
        return max(0, $this->stock ?? 999);
    }

    public static function categories()
    {
        return ['Seating', 'Tables', 'Beds', 'Storage', 'Lighting', 'Decor'];
    }

    public static function rooms()
    {
        return ['Living Room', 'Bedroom', 'Dining Room', 'Kitchen', 'Office', 'Bathroom'];
    }
}

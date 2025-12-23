<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class FloorDesign extends Model
{
    use HasFactory;

    protected $fillable = [
        'home_design_id',
        'name',
        'description',
        'floor_number',
        'width',
        'length',
        'floor_area_sqft',
        'carpet_area_sqft',
        'bedrooms',
        'bathrooms',
        'kitchens',
        'living_rooms',
        'dining_rooms',
        'balconies',
        'has_stairs',
        'has_lift',
        'has_puja_room',
        'has_store_room',
        'has_servant_room',
        'cover_image',
        'features',
        'is_active',
    ];

    protected $casts = [
        'width' => 'decimal:2',
        'length' => 'decimal:2',
        'floor_area_sqft' => 'decimal:2',
        'carpet_area_sqft' => 'decimal:2',
        'has_stairs' => 'boolean',
        'has_lift' => 'boolean',
        'has_puja_room' => 'boolean',
        'has_store_room' => 'boolean',
        'has_servant_room' => 'boolean',
        'is_active' => 'boolean',
        'features' => 'array',
    ];

    /**
     * Get the home design this floor belongs to.
     */
    public function homeDesign(): BelongsTo
    {
        return $this->belongsTo(HomeDesign::class);
    }

    /**
     * Get all rooms for this floor.
     */
    public function rooms(): HasMany
    {
        return $this->hasMany(Room::class);
    }

    /**
     * Get all files for this design.
     */
    public function files(): MorphMany
    {
        return $this->morphMany(DesignFile::class, 'designable');
    }

    /**
     * Get all images for this design.
     */
    public function images(): MorphMany
    {
        return $this->morphMany(DesignImage::class, 'imageable');
    }

    /**
     * Get floor name by number.
     */
    public function getFloorLabelAttribute(): string
    {
        return match ($this->floor_number) {
            -2 => 'Lower Basement',
            -1 => 'Basement',
            0 => 'Ground Floor',
            1 => 'First Floor',
            2 => 'Second Floor',
            3 => 'Third Floor',
            4 => 'Fourth Floor',
            5 => 'Fifth Floor',
            default => "Floor {$this->floor_number}",
        };
    }

    /**
     * Floor number options.
     */
    public static function floorNumberOptions(): array
    {
        return [
            -2 => 'Lower Basement',
            -1 => 'Basement',
            0 => 'Ground Floor',
            1 => 'First Floor',
            2 => 'Second Floor',
            3 => 'Third Floor',
            4 => 'Fourth Floor',
            5 => 'Fifth Floor',
            6 => 'Sixth Floor',
            7 => 'Seventh Floor',
        ];
    }
}

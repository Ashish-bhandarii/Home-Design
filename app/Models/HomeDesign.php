<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class HomeDesign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'style',
        'total_floors',
        'total_area_sqft',
        'plot_width',
        'plot_length',
        'bedrooms',
        'bathrooms',
        'kitchens',
        'living_rooms',
        'dining_rooms',
        'balconies',
        'garages',
        'has_basement',
        'has_terrace',
        'has_garden',
        'has_swimming_pool',
        'construction_type',
        'facing_direction',
        'estimated_cost_min',
        'estimated_cost_max',
        'cover_image',
        'features',
        'tags',
        'is_featured',
        'is_active',
        'views',
        'downloads',
    ];

    protected $casts = [
        'total_area_sqft' => 'decimal:2',
        'plot_width' => 'decimal:2',
        'plot_length' => 'decimal:2',
        'estimated_cost_min' => 'decimal:2',
        'estimated_cost_max' => 'decimal:2',
        'has_basement' => 'boolean',
        'has_terrace' => 'boolean',
        'has_garden' => 'boolean',
        'has_swimming_pool' => 'boolean',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'features' => 'array',
        'tags' => 'array',
    ];

    /**
     * Get all floor designs for this home.
     */
    public function floorDesigns(): HasMany
    {
        return $this->hasMany(FloorDesign::class)->orderBy('floor_number');
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
     * Style options for home designs.
     */
    public static function styleOptions(): array
    {
        return [
            'modern' => 'Modern',
            'traditional' => 'Traditional',
            'contemporary' => 'Contemporary',
            'minimalist' => 'Minimalist',
            'colonial' => 'Colonial',
            'mediterranean' => 'Mediterranean',
            'victorian' => 'Victorian',
            'craftsman' => 'Craftsman',
            'farmhouse' => 'Farmhouse',
            'industrial' => 'Industrial',
            'nepali_traditional' => 'Nepali Traditional',
            'duplex' => 'Duplex',
            'bungalow' => 'Bungalow',
            'villa' => 'Villa',
        ];
    }

    /**
     * Construction type options.
     */
    public static function constructionTypeOptions(): array
    {
        return [
            'rcc' => 'RCC (Reinforced Cement Concrete)',
            'load_bearing' => 'Load Bearing',
            'steel_frame' => 'Steel Frame',
            'prefabricated' => 'Prefabricated',
            'composite' => 'Composite',
        ];
    }

    /**
     * Facing direction options.
     */
    public static function facingDirectionOptions(): array
    {
        return [
            'north' => 'North',
            'south' => 'South',
            'east' => 'East',
            'west' => 'West',
            'north_east' => 'North-East',
            'north_west' => 'North-West',
            'south_east' => 'South-East',
            'south_west' => 'South-West',
        ];
    }
}

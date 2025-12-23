<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class InteriorDesign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'room_type',
        'style',
        'room_width',
        'room_length',
        'room_height',
        'area_sqft',
        'color_scheme',
        'primary_material',
        'flooring_type',
        'ceiling_type',
        'lighting_type',
        'estimated_cost_min',
        'estimated_cost_max',
        'cover_image',
        'furniture_items',
        'color_palette',
        'features',
        'tags',
        'is_featured',
        'is_active',
        'views',
        'downloads',
    ];

    protected $casts = [
        'room_width' => 'decimal:2',
        'room_length' => 'decimal:2',
        'room_height' => 'decimal:2',
        'area_sqft' => 'decimal:2',
        'estimated_cost_min' => 'decimal:2',
        'estimated_cost_max' => 'decimal:2',
        'furniture_items' => 'array',
        'color_palette' => 'array',
        'features' => 'array',
        'tags' => 'array',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
    ];

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
     * Room type options.
     */
    public static function roomTypeOptions(): array
    {
        return [
            'living_room' => 'Living Room',
            'bedroom' => 'Bedroom',
            'master_bedroom' => 'Master Bedroom',
            'kids_bedroom' => 'Kids Bedroom',
            'guest_bedroom' => 'Guest Bedroom',
            'kitchen' => 'Kitchen',
            'modular_kitchen' => 'Modular Kitchen',
            'bathroom' => 'Bathroom',
            'dining_room' => 'Dining Room',
            'study_room' => 'Study Room',
            'home_office' => 'Home Office',
            'puja_room' => 'Puja Room',
            'balcony' => 'Balcony',
            'terrace' => 'Terrace',
            'foyer' => 'Foyer/Entrance',
            'staircase' => 'Staircase Area',
            'walk_in_closet' => 'Walk-in Closet',
            'laundry_room' => 'Laundry Room',
            'home_theater' => 'Home Theater',
            'gym' => 'Home Gym',
            'bar_area' => 'Bar Area',
            'outdoor_living' => 'Outdoor Living Space',
        ];
    }

    /**
     * Style options for interior designs.
     */
    public static function styleOptions(): array
    {
        return [
            'modern' => 'Modern',
            'contemporary' => 'Contemporary',
            'minimalist' => 'Minimalist',
            'traditional' => 'Traditional',
            'industrial' => 'Industrial',
            'scandinavian' => 'Scandinavian',
            'bohemian' => 'Bohemian',
            'mid_century_modern' => 'Mid-Century Modern',
            'art_deco' => 'Art Deco',
            'rustic' => 'Rustic',
            'coastal' => 'Coastal',
            'farmhouse' => 'Farmhouse',
            'transitional' => 'Transitional',
            'eclectic' => 'Eclectic',
            'nepali_ethnic' => 'Nepali Ethnic',
            'luxury' => 'Luxury',
        ];
    }

    /**
     * Flooring type options.
     */
    public static function flooringTypeOptions(): array
    {
        return [
            'vitrified_tiles' => 'Vitrified Tiles',
            'ceramic_tiles' => 'Ceramic Tiles',
            'marble' => 'Marble',
            'granite' => 'Granite',
            'hardwood' => 'Hardwood',
            'laminate' => 'Laminate',
            'vinyl' => 'Vinyl',
            'carpet' => 'Carpet',
            'concrete' => 'Polished Concrete',
            'terrazzo' => 'Terrazzo',
            'natural_stone' => 'Natural Stone',
            'bamboo' => 'Bamboo',
        ];
    }

    /**
     * Ceiling type options.
     */
    public static function ceilingTypeOptions(): array
    {
        return [
            'plain' => 'Plain/Flat',
            'pop_false' => 'POP False Ceiling',
            'gypsum' => 'Gypsum False Ceiling',
            'wooden' => 'Wooden Ceiling',
            'coffered' => 'Coffered Ceiling',
            'tray' => 'Tray Ceiling',
            'beam' => 'Exposed Beam',
            'stretch' => 'Stretch Ceiling',
            'metal' => 'Metal Ceiling',
        ];
    }

    /**
     * Lighting type options.
     */
    public static function lightingTypeOptions(): array
    {
        return [
            'ambient' => 'Ambient/General',
            'task' => 'Task Lighting',
            'accent' => 'Accent Lighting',
            'decorative' => 'Decorative',
            'natural' => 'Natural Light Focus',
            'mixed' => 'Mixed/Layered',
            'cove' => 'Cove Lighting',
            'recessed' => 'Recessed Lighting',
            'chandelier' => 'Chandelier/Statement',
        ];
    }

    /**
     * Primary material options.
     */
    public static function primaryMaterialOptions(): array
    {
        return [
            'wood' => 'Wood',
            'metal' => 'Metal',
            'glass' => 'Glass',
            'fabric' => 'Fabric/Textiles',
            'leather' => 'Leather',
            'stone' => 'Stone',
            'concrete' => 'Concrete',
            'rattan' => 'Rattan/Cane',
            'acrylic' => 'Acrylic',
            'veneer' => 'Veneer',
            'laminate' => 'Laminate',
            'mixed' => 'Mixed Materials',
        ];
    }
}

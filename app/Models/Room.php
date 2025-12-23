<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'floor_design_id',
        'room_type',
        'name',
        'length',
        'width',
        'area_sqft',
        'has_attached_bathroom',
        'has_balcony',
        'has_wardrobe',
        'windows_count',
        'doors_count',
        'ventilation',
        'facing_direction',
        'notes',
    ];

    protected $casts = [
        'length' => 'decimal:2',
        'width' => 'decimal:2',
        'area_sqft' => 'decimal:2',
        'has_attached_bathroom' => 'boolean',
        'has_balcony' => 'boolean',
        'has_wardrobe' => 'boolean',
    ];

    /**
     * Get the floor design this room belongs to.
     */
    public function floorDesign(): BelongsTo
    {
        return $this->belongsTo(FloorDesign::class);
    }

    /**
     * Room type options.
     */
    public static function roomTypeOptions(): array
    {
        return [
            'bedroom' => 'Bedroom',
            'master_bedroom' => 'Master Bedroom',
            'kids_bedroom' => 'Kids Bedroom',
            'guest_bedroom' => 'Guest Bedroom',
            'bathroom' => 'Bathroom',
            'attached_bathroom' => 'Attached Bathroom',
            'common_bathroom' => 'Common Bathroom',
            'kitchen' => 'Kitchen',
            'living_room' => 'Living Room',
            'dining_room' => 'Dining Room',
            'drawing_room' => 'Drawing Room',
            'study_room' => 'Study Room',
            'puja_room' => 'Puja Room',
            'store_room' => 'Store Room',
            'balcony' => 'Balcony',
            'terrace' => 'Terrace',
            'garage' => 'Garage',
            'parking' => 'Parking',
            'servant_room' => 'Servant Room',
            'utility_room' => 'Utility Room',
            'laundry' => 'Laundry',
            'foyer' => 'Foyer',
            'corridor' => 'Corridor',
            'staircase' => 'Staircase',
            'lift_area' => 'Lift Area',
            'lobby' => 'Lobby',
        ];
    }

    /**
     * Ventilation options.
     */
    public static function ventilationOptions(): array
    {
        return [
            'excellent' => 'Excellent',
            'good' => 'Good',
            'average' => 'Average',
            'poor' => 'Poor',
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

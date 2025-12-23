<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InteriorDefaultRoom extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_template_id',
        'display_name',
        'sort_order',
        'is_active',
        'meta',
    ];

    protected $casts = [
        'sort_order' => 'int',
        'is_active' => 'bool',
        'meta' => 'array',
    ];

    public function roomTemplate()
    {
        return $this->belongsTo(InteriorRoomTemplate::class, 'room_template_id');
    }
}

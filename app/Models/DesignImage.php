<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class DesignImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'imageable_id',
        'imageable_type',
        'image_path',
        'caption',
        'is_cover',
        'sort_order',
    ];

    protected $casts = [
        'is_cover' => 'boolean',
    ];

    /**
     * Get the parent imageable model.
     */
    public function imageable(): MorphTo
    {
        return $this->morphTo();
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FloorPlanProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'thumbnail',
        'requirements',
        'generated_plans',
        'selected_plan_index',
    ];

    protected $casts = [
        'requirements' => 'array',
        'generated_plans' => 'array',
        'selected_plan_index' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DesignerBooking extends Model
{
    protected $fillable = [
        'user_id',
        'designer_id',
        'booking_date',
        'booking_time',
        'duration_minutes',
        'consultation_type',
        'status',
        'project_type',
        'description',
        'notes',
        'meeting_link',
        'price',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'booking_time' => 'datetime:H:i',
        'price' => 'decimal:2',
    ];

    protected $appends = ['total_amount'];

    /**
     * Get the total amount (alias for price)
     */
    public function getTotalAmountAttribute(): ?float
    {
        return $this->price ? (float) $this->price : null;
    }

    /**
     * Get the user who made the booking
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the designer for this booking
     */
    public function designer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'designer_id');
    }

    /**
     * Check if the booking is in the past
     */
    public function isPast(): bool
    {
        return $this->booking_date->isPast();
    }

    /**
     * Check if the booking can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return $this->status === 'pending' || $this->status === 'confirmed';
    }

    /**
     * Get status color for display
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'confirmed' => 'blue',
            'completed' => 'green',
            'cancelled' => 'red',
            default => 'gray',
        };
    }

    /**
     * Scope for upcoming bookings
     */
    public function scopeUpcoming($query)
    {
        return $query->where('booking_date', '>=', now()->toDateString())
                     ->whereIn('status', ['pending', 'confirmed']);
    }

    /**
     * Scope for a specific designer
     */
    public function scopeForDesigner($query, $designerId)
    {
        return $query->where('designer_id', $designerId);
    }

    /**
     * Scope for a specific user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }
}

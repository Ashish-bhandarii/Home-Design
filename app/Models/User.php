<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'specialty',
        'bio',
        'hourly_rate',
        'experience_years',
        'portfolio_url',
        'avatar',
        'is_available',
        'work_start_time',
        'work_end_time',
        'slot_duration',
        'working_days',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'hourly_rate' => 'decimal:2',
            'is_available' => 'boolean',
            'working_days' => 'array',
            'slot_duration' => 'integer',
        ];
    }

    /**
     * Get the bookings made by this user (as a client)
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(DesignerBooking::class, 'user_id');
    }

    /**
     * Get the bookings for this designer
     */
    public function designerBookings(): HasMany
    {
        return $this->hasMany(DesignerBooking::class, 'designer_id');
    }

    /**
     * Check if user is a designer
     */
    public function isDesigner(): bool
    {
        return $this->hasRole('designer');
    }

    /**
     * Scope for available designers
     */
    public function scopeDesigners($query)
    {
        return $query->role('designer')->where('is_available', true);
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminNotification extends Model
{
    protected $fillable = [
        'type',
        'title',
        'message',
        'icon',
        'color',
        'link',
        'data',
        'read_at',
    ];

    protected $casts = [
        'data' => 'array',
        'read_at' => 'datetime',
    ];

    /**
     * Scope to get unread notifications
     */
    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    /**
     * Scope to get read notifications
     */
    public function scopeRead($query)
    {
        return $query->whereNotNull('read_at');
    }

    /**
     * Check if notification is read
     */
    public function isRead(): bool
    {
        return $this->read_at !== null;
    }

    /**
     * Mark the notification as read
     */
    public function markAsRead(): void
    {
        $this->update(['read_at' => now()]);
    }

    /**
     * Mark the notification as unread
     */
    public function markAsUnread(): void
    {
        $this->update(['read_at' => null]);
    }

    /**
     * Create a new order notification
     */
    public static function orderNotification(string $title, string $message, ?string $link = null, ?array $data = null): self
    {
        return self::create([
            'type' => 'order',
            'title' => $title,
            'message' => $message,
            'icon' => 'ShoppingBag',
            'color' => 'green',
            'link' => $link,
            'data' => $data,
        ]);
    }

    /**
     * Create a new user notification
     */
    public static function userNotification(string $title, string $message, ?string $link = null, ?array $data = null): self
    {
        return self::create([
            'type' => 'user',
            'title' => $title,
            'message' => $message,
            'icon' => 'User',
            'color' => 'blue',
            'link' => $link,
            'data' => $data,
        ]);
    }

    /**
     * Create a new design notification
     */
    public static function designNotification(string $title, string $message, ?string $link = null, ?array $data = null): self
    {
        return self::create([
            'type' => 'design',
            'title' => $title,
            'message' => $message,
            'icon' => 'Palette',
            'color' => 'purple',
            'link' => $link,
            'data' => $data,
        ]);
    }

    /**
     * Create a new system notification
     */
    public static function systemNotification(string $title, string $message, ?string $link = null, ?array $data = null): self
    {
        return self::create([
            'type' => 'system',
            'title' => $title,
            'message' => $message,
            'icon' => 'Settings',
            'color' => 'gray',
            'link' => $link,
            'data' => $data,
        ]);
    }
}

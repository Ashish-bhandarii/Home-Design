<?php

namespace App\Observers;

use App\Models\AdminNotification;
use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        // Don't create notification for admin users (they might be seeded)
        if ($user->hasRole('admin')) {
            return;
        }

        AdminNotification::userNotification(
            'New User Registration',
            "{$user->name} ({$user->email}) has registered on the platform.",
            "/admin/users/{$user->id}/edit",
            [
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
            ]
        );
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // Check if email was verified
        if ($user->isDirty('email_verified_at') && $user->email_verified_at !== null) {
            AdminNotification::userNotification(
                'Email Verified',
                "{$user->name} has verified their email address.",
                "/admin/users/{$user->id}/edit",
                [
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                ]
            );
        }
    }
}

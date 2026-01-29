<?php

namespace Database\Seeders;

use App\Models\AdminNotification;
use Illuminate\Database\Seeder;

class AdminNotificationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing notifications
        AdminNotification::truncate();

        $notifications = [
            [
                'type' => 'order',
                'title' => 'New Order Received',
                'message' => 'Order #ORD-20260111-AB12 has been placed by John Doe for $1,250.00',
                'icon' => 'ShoppingBag',
                'color' => 'green',
                'link' => '/admin/orders',
                'data' => ['order_id' => 1, 'amount' => 1250.00],
                'created_at' => now()->subMinutes(5),
            ],
            [
                'type' => 'user',
                'title' => 'New User Registration',
                'message' => 'Jane Smith has joined the platform and verified their email.',
                'icon' => 'User',
                'color' => 'blue',
                'link' => '/admin/users',
                'data' => ['user_id' => 2],
                'created_at' => now()->subMinutes(30),
            ],
            [
                'type' => 'order',
                'title' => 'Order Completed',
                'message' => 'Order #ORD-20260110-CD34 has been marked as delivered.',
                'icon' => 'ShoppingBag',
                'color' => 'green',
                'link' => '/admin/orders',
                'data' => ['order_id' => 2],
                'read_at' => now()->subHours(1),
                'created_at' => now()->subHours(2),
            ],
            [
                'type' => 'design',
                'title' => 'Design Downloaded',
                'message' => 'Modern Villa Design has been downloaded 50 times today.',
                'icon' => 'Palette',
                'color' => 'purple',
                'link' => '/admin/home-designs',
                'data' => ['design_id' => 1, 'downloads' => 50],
                'created_at' => now()->subHours(3),
            ],
            [
                'type' => 'system',
                'title' => 'Weekly Report Ready',
                'message' => 'Your weekly analytics report is ready to view.',
                'icon' => 'Settings',
                'color' => 'gray',
                'link' => '/admin/analytics',
                'data' => null,
                'read_at' => now()->subHours(5),
                'created_at' => now()->subHours(6),
            ],
            [
                'type' => 'order',
                'title' => 'Payment Received',
                'message' => 'Payment of $850.00 received for Order #ORD-20260109-EF56',
                'icon' => 'ShoppingBag',
                'color' => 'green',
                'link' => '/admin/orders',
                'data' => ['order_id' => 3, 'amount' => 850.00],
                'created_at' => now()->subHours(12),
            ],
            [
                'type' => 'user',
                'title' => 'User Milestone',
                'message' => 'Congratulations! You have reached 1,000 registered users.',
                'icon' => 'User',
                'color' => 'blue',
                'link' => '/admin/users',
                'data' => ['total_users' => 1000],
                'read_at' => now()->subDays(1),
                'created_at' => now()->subDays(1),
            ],
            [
                'type' => 'design',
                'title' => 'New Interior Design Added',
                'message' => 'Scandinavian Living Room design has been added to the gallery.',
                'icon' => 'Palette',
                'color' => 'purple',
                'link' => '/admin/interior-designs',
                'data' => ['design_id' => 5],
                'created_at' => now()->subDays(2),
            ],
        ];

        foreach ($notifications as $notification) {
            AdminNotification::create($notification);
        }
    }
}

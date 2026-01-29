<?php

namespace App\Observers;

use App\Models\AdminNotification;
use App\Models\Order;

class OrderObserver
{
    /**
     * Handle the Order "created" event.
     */
    public function created(Order $order): void
    {
        AdminNotification::orderNotification(
            'New Order Received',
            "Order #{$order->order_number} has been placed by {$order->shipping_name} for Rs. " . number_format($order->total, 2),
            "/admin/orders/{$order->id}",
            [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'amount' => $order->total,
                'customer' => $order->shipping_name,
            ]
        );
    }

    /**
     * Handle the Order "updated" event.
     */
    public function updated(Order $order): void
    {
        // Check if status changed
        if ($order->isDirty('status')) {
            $oldStatus = $order->getOriginal('status');
            $newStatus = $order->status;

            $statusMessages = [
                'confirmed' => 'Order Confirmed',
                'processing' => 'Order Processing',
                'shipped' => 'Order Shipped',
                'delivered' => 'Order Delivered',
                'cancelled' => 'Order Cancelled',
            ];

            if (isset($statusMessages[$newStatus])) {
                AdminNotification::orderNotification(
                    $statusMessages[$newStatus],
                    "Order #{$order->order_number} status changed from {$oldStatus} to {$newStatus}.",
                    "/admin/orders/{$order->id}",
                    [
                        'order_id' => $order->id,
                        'order_number' => $order->order_number,
                        'old_status' => $oldStatus,
                        'new_status' => $newStatus,
                    ]
                );
            }
        }

        // Check if payment status changed to paid
        if ($order->isDirty('payment_status') && $order->payment_status === 'paid') {
            AdminNotification::orderNotification(
                'Payment Received',
                "Payment of Rs. " . number_format($order->total, 2) . " received for Order #{$order->order_number}",
                "/admin/orders/{$order->id}",
                [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'amount' => $order->total,
                ]
            );
        }
    }
}

<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    /**
     * Display all notifications page
     */
    public function index(Request $request): Response
    {
        $query = AdminNotification::orderBy('created_at', 'desc');

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filter by read status
        if ($request->has('status')) {
            if ($request->status === 'unread') {
                $query->whereNull('read_at');
            } elseif ($request->status === 'read') {
                $query->whereNotNull('read_at');
            }
        }

        $notifications = $query->paginate(20)->withQueryString();
        $unreadCount = AdminNotification::unread()->count();
        $totalCount = AdminNotification::count();

        return Inertia::render('admin/notifications', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
            'totalCount' => $totalCount,
            'filters' => [
                'type' => $request->type ?? 'all',
                'status' => $request->status ?? 'all',
            ],
        ]);
    }

    /**
     * Get recent notifications for the dropdown
     */
    public function recent(): JsonResponse
    {
        $notifications = AdminNotification::orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        $unreadCount = AdminNotification::unread()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get unread count
     */
    public function unreadCount(): JsonResponse
    {
        $count = AdminNotification::unread()->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Mark a specific notification as read
     */
    public function markAsRead(AdminNotification $notification): JsonResponse
    {
        $notification->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(): JsonResponse
    {
        AdminNotification::unread()->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /**
     * Delete a notification
     */
    public function destroy(AdminNotification $notification): JsonResponse
    {
        $notification->delete();

        return response()->json(['success' => true]);
    }

    /**
     * Clear all notifications
     */
    public function clearAll(): JsonResponse
    {
        AdminNotification::truncate();

        return response()->json(['success' => true]);
    }
}

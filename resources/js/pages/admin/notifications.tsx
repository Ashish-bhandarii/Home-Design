import AdminLayout from '@/layouts/admin-layout';
import { type AdminNotification } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import {
    Bell,
    Check,
    CheckCheck,
    ChevronLeft,
    ChevronRight,
    Filter,
    Palette,
    Settings,
    ShoppingBag,
    Trash2,
    User,
} from 'lucide-react';
import { useState } from 'react';

interface PaginatedNotifications {
    data: AdminNotification[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    notifications: PaginatedNotifications;
    unreadCount: number;
    totalCount: number;
    filters: {
        type: string;
        status: string;
    };
}

// Icon mapping for notifications
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    ShoppingBag,
    User,
    Palette,
    Settings,
    Bell,
};

// Color mapping for notification types
const colorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
    green: { bg: 'bg-green-100', text: 'text-green-600', darkBg: 'dark:bg-green-950/50', darkText: 'dark:text-green-400' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', darkBg: 'dark:bg-blue-950/50', darkText: 'dark:text-blue-400' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', darkBg: 'dark:bg-purple-950/50', darkText: 'dark:text-purple-400' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-600', darkBg: 'dark:bg-gray-950/50', darkText: 'dark:text-gray-400' },
    red: { bg: 'bg-red-100', text: 'text-red-600', darkBg: 'dark:bg-red-950/50', darkText: 'dark:text-red-400' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', darkBg: 'dark:bg-yellow-950/50', darkText: 'dark:text-yellow-400' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-600', darkBg: 'dark:bg-orange-950/50', darkText: 'dark:text-orange-400' },
};

function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function NotificationsPage({ notifications, unreadCount, totalCount, filters }: Props) {
    const [localNotifications, setLocalNotifications] = useState(notifications.data);
    const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);

    const getNotificationIcon = (notification: AdminNotification) => {
        const IconComponent = iconMap[notification.icon || 'Bell'] || Bell;
        const colors = colorMap[notification.color] || colorMap.gray;
        return (
            <div className={`rounded-full p-3 ${colors.bg} ${colors.darkBg}`}>
                <IconComponent className={`h-5 w-5 ${colors.text} ${colors.darkText}`} />
            </div>
        );
    };

    const handleMarkAsRead = async (notification: AdminNotification) => {
        if (notification.read_at) return;
        
        try {
            await axios.post(`/admin/notifications/${notification.id}/read`);
            setLocalNotifications(prev =>
                prev.map(n => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n))
            );
            setLocalUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.post('/admin/notifications/mark-all-read');
            setLocalNotifications(prev =>
                prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
            );
            setLocalUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDelete = async (notification: AdminNotification) => {
        try {
            await axios.delete(`/admin/notifications/${notification.id}`);
            setLocalNotifications(prev => prev.filter(n => n.id !== notification.id));
            if (!notification.read_at) {
                setLocalUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const handleClearAll = async () => {
        if (!confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
            return;
        }
        
        try {
            await axios.delete('/admin/notifications');
            setLocalNotifications([]);
            setLocalUnreadCount(0);
            router.reload();
        } catch (error) {
            console.error('Failed to clear notifications:', error);
        }
    };

    const handleFilterChange = (type: string, value: string) => {
        const params = new URLSearchParams(window.location.search);
        if (value === 'all') {
            params.delete(type);
        } else {
            params.set(type, value);
        }
        router.get(`/admin/notifications?${params.toString()}`);
    };

    const handleNotificationClick = (notification: AdminNotification) => {
        handleMarkAsRead(notification);
        if (notification.link) {
            router.visit(notification.link);
        }
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin' },
                { title: 'Notifications', href: '/admin/notifications' },
            ]}
        >
            <Head title="Notifications" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {localUnreadCount > 0 ? (
                                <>You have <span className="font-semibold text-indigo-600 dark:text-indigo-400">{localUnreadCount}</span> unread notifications</>
                            ) : (
                                'All caught up!'
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {localUnreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                            >
                                <CheckCheck className="h-4 w-4" />
                                Mark all as read
                            </button>
                        )}
                        {totalCount > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 dark:border-red-900 dark:bg-slate-800 dark:text-red-400 dark:hover:bg-red-950/30"
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter:</span>
                    
                    {/* Type Filter */}
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                        <option value="all">All Types</option>
                        <option value="order">Orders</option>
                        <option value="user">Users</option>
                        <option value="design">Designs</option>
                        <option value="system">System</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                        <option value="all">All Status</option>
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                    </select>
                </div>

                {/* Notifications List */}
                <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    {localNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                                <Bell className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">No notifications</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {filters.type !== 'all' || filters.status !== 'all'
                                    ? 'No notifications match your filters'
                                    : "You're all caught up! Check back later."}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {localNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`group flex cursor-pointer items-start gap-4 p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                                        !notification.read_at ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                                    }`}
                                >
                                    {getNotificationIcon(notification)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm ${!notification.read_at ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read_at && (
                                                        <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                                    {notification.message}
                                                </p>
                                                <div className="mt-2 flex items-center gap-4">
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                        {getRelativeTime(notification.created_at)}
                                                    </span>
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                        notification.type === 'order' ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' :
                                                        notification.type === 'user' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' :
                                                        notification.type === 'design' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400' :
                                                        'bg-gray-100 text-gray-700 dark:bg-gray-950/50 dark:text-gray-400'
                                                    }`}>
                                                        {notification.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {!notification.read_at && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkAsRead(notification);
                                                        }}
                                                        className="rounded-lg p-2 text-slate-400 opacity-0 transition-all hover:bg-slate-200 hover:text-indigo-600 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
                                                        title="Mark as read"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(notification);
                                                    }}
                                                    className="rounded-lg p-2 text-slate-400 opacity-0 transition-all hover:bg-red-100 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {notifications.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Showing {notifications.from} to {notifications.to} of {notifications.total} notifications
                            </div>
                            <div className="flex items-center gap-2">
                                {notifications.current_page > 1 && (
                                    <Link
                                        href={`/admin/notifications?page=${notifications.current_page - 1}${filters.type !== 'all' ? `&type=${filters.type}` : ''}${filters.status !== 'all' ? `&status=${filters.status}` : ''}`}
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Link>
                                )}
                                <span className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400">
                                    Page {notifications.current_page} of {notifications.last_page}
                                </span>
                                {notifications.current_page < notifications.last_page && (
                                    <Link
                                        href={`/admin/notifications?page=${notifications.current_page + 1}${filters.type !== 'all' ? `&type=${filters.type}` : ''}${filters.status !== 'all' ? `&status=${filters.status}` : ''}`}
                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

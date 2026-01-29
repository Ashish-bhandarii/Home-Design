import FlashMessage from '@/components/flash-message';
import { resolveUrl } from '@/lib/utils';
import admin from '@/routes/admin';
import { type AdminNotification, type BreadcrumbItem, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import {
    Armchair,
    BarChart3,
    Bell,
    Building2,
    Calendar,
    CheckCheck,
    ChevronDown,
    Layers,
    LayoutDashboard,
    LogOut,
    Menu,
    Moon,
    Palette,
    Search,
    Settings,
    ShoppingBag,
    Sun,
    Trash2,
    User,
    UserCheck,
    Users,
    X
} from 'lucide-react';
import { type PropsWithChildren, useCallback, useEffect, useState } from 'react';

interface AdminLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

const navItems = [
    { label: 'Dashboard', href: admin.dashboard().url, icon: LayoutDashboard },
    { label: 'Home Designs', href: admin.homeDesigns.index().url, icon: Building2 },
    { label: 'Interior Designs', href: admin.interiorDesigns.index().url, icon: Palette },
    { label: 'Furniture Library', href: admin.furniture.index().url, icon: Armchair },
    { label: 'Materials', href: admin.materials.index().url, icon: Layers },
    { label: 'Orders', href: admin.orders.index().url, icon: ShoppingBag },
    { label: 'Users', href: admin.users.index().url, icon: Users },
    { label: 'Designers', href: '/admin/designers', icon: UserCheck },
    { label: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Analytics', href: admin.analytics().url, icon: BarChart3 },
    { label: 'Settings', href: admin.settings().url, icon: Settings },
];

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
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function AdminLayout({ children, breadcrumbs }: AdminLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const fetchNotifications = useCallback(async () => {
        try {
            setIsLoadingNotifications(true);
            const response = await axios.get('/admin/notifications/recent');
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unread_count);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoadingNotifications(false);
        }
    }, []);

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setDarkMode(isDark);
        
        // Fetch notifications on mount
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
        setDarkMode(!darkMode);
    };

    const handleNotificationClick = async (notification: AdminNotification) => {
        if (!notification.read_at) {
            try {
                await axios.post(`/admin/notifications/${notification.id}/read`);
                setNotifications(prev =>
                    prev.map(n => (n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n))
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }
        
        if (notification.link) {
            window.location.href = notification.link;
        }
        setNotificationMenuOpen(false);
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.post('/admin/notifications/mark-all-read');
            setNotifications(prev =>
                prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const handleDeleteNotification = async (e: React.MouseEvent, notification: AdminNotification) => {
        e.stopPropagation();
        try {
            await axios.delete(`/admin/notifications/${notification.id}`);
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
            if (!notification.read_at) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    const getNotificationIcon = (notification: AdminNotification) => {
        const IconComponent = iconMap[notification.icon || 'Bell'] || Bell;
        const colors = colorMap[notification.color] || colorMap.gray;
        return (
            <div className={`rounded-full p-2 ${colors.bg} ${colors.darkBg}`}>
                <IconComponent className={`h-4 w-4 ${colors.text} ${colors.darkText}`} />
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
            <FlashMessage />
            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full bg-slate-900 transition-all duration-300 flex flex-col ${
                    sidebarOpen ? 'w-64' : 'w-20'
                } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-800 px-4">
                    <Link href="/admin" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-lg">
                            HD
                        </div>
                        {sidebarOpen && (
                            <div>
                                <span className="text-lg font-bold text-white">Home Design</span>
                                <span className="block text-xs text-slate-400">Admin Panel</span>
                            </div>
                        )}
                    </Link>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation - Scrollable */}
                <nav className="flex-1 overflow-y-auto px-3 py-6">
                    <div className="space-y-1">
                            {navItems.map((item) => {
                            const Icon = item.icon;
                            const itemHref = resolveUrl(item.href);
                            const isActive = currentPath === itemHref || 
                                (itemHref !== '/admin' && currentPath.startsWith(itemHref));
                            
                            return (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    {sidebarOpen && <span>{item.label}</span>}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
                {/* Top Header */}
                <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="flex h-16 items-center justify-between px-4 lg:px-6">
                        {/* Left Side */}
                        <div className="flex items-center gap-4">
                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </button>

                            {/* Sidebar Toggle (Desktop) */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:block"
                            >
                                <Menu className="h-5 w-5" />
                            </button>

                            {/* Breadcrumbs */}
                            {breadcrumbs && breadcrumbs.length > 0 && (
                                <nav className="hidden items-center gap-2 text-sm md:flex">
                                    {breadcrumbs.map((crumb, index) => {
                                        const crumbHref = resolveUrl(crumb.href);
                                        return (
                                            <span key={crumbHref} className="flex items-center gap-2">
                                                {index > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                                                <Link
                                                    href={crumb.href}
                                                    className={`${
                                                        index === breadcrumbs.length - 1
                                                            ? 'font-medium text-slate-900 dark:text-white'
                                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                                                    }`}
                                                >
                                                    {crumb.title}
                                                </Link>
                                            </span>
                                        );
                                    })}
                                </nav>
                            )}
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-3">
                            {/* Search */}
                            <div className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                                />
                            </div>

                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button 
                                    onClick={() => {
                                        setNotificationMenuOpen(!notificationMenuOpen);
                                        setUserMenuOpen(false);
                                        if (!notificationMenuOpen) {
                                            fetchNotifications();
                                        }
                                    }}
                                    className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                >
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {notificationMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setNotificationMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                                            {/* Header */}
                                            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
                                                    {unreadCount > 0 && (
                                                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-950/50 dark:text-red-400">
                                                            {unreadCount} new
                                                        </span>
                                                    )}
                                                </div>
                                                {unreadCount > 0 && (
                                                    <button
                                                        onClick={handleMarkAllAsRead}
                                                        className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    >
                                                        <CheckCheck className="h-3.5 w-3.5" />
                                                        Mark all read
                                                    </button>
                                                )}
                                            </div>

                                            {/* Notification List */}
                                            <div className="max-h-96 overflow-y-auto">
                                                {isLoadingNotifications ? (
                                                    <div className="flex items-center justify-center py-8">
                                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                                                    </div>
                                                ) : notifications.length === 0 ? (
                                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                                        <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-700">
                                                            <Bell className="h-6 w-6 text-slate-400" />
                                                        </div>
                                                        <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">No notifications</p>
                                                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">You're all caught up!</p>
                                                    </div>
                                                ) : (
                                                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                                                        {notifications.map((notification) => (
                                                            <div
                                                                key={notification.id}
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className={`group flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50 ${
                                                                    !notification.read_at ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                                                                }`}
                                                            >
                                                                {getNotificationIcon(notification)}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <p className={`text-sm ${!notification.read_at ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                                                                            {notification.title}
                                                                        </p>
                                                                        <div className="flex items-center gap-1">
                                                                            {!notification.read_at && (
                                                                                <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                                                            )}
                                                                            <button
                                                                                onClick={(e) => handleDeleteNotification(e, notification)}
                                                                                className="rounded p-1 opacity-0 transition-opacity hover:bg-slate-200 group-hover:opacity-100 dark:hover:bg-slate-600"
                                                                            >
                                                                                <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                                                        {notification.message}
                                                                    </p>
                                                                    <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                                                                        {getRelativeTime(notification.created_at)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            {notifications.length > 0 && (
                                                <div className="border-t border-slate-200 p-2 dark:border-slate-700">
                                                    <Link
                                                        href="/admin/notifications"
                                                        onClick={() => setNotificationMenuOpen(false)}
                                                        className="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                                                    >
                                                        View all notifications
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => {
                                        setUserMenuOpen(!userMenuOpen);
                                        setNotificationMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-semibold text-white">
                                        {auth?.user?.name?.charAt(0) || 'A'}
                                    </div>
                                    <div className="hidden text-left md:block">
                                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                                            {auth?.user?.name || 'Admin'}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Administrator</div>
                                    </div>
                                    <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
                                </button>

                                {/* Dropdown Menu */}
                                {userMenuOpen && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setUserMenuOpen(false)}
                                        />
                                        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                                            <Link
                                                href="/admin/settings"
                                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                <Settings className="h-4 w-4" />
                                                Settings
                                            </Link>
                                            <hr className="my-2 border-slate-200 dark:border-slate-700" />
                                            <button
                                                onClick={() => {
                                                    setUserMenuOpen(false);
                                                    router.post('/logout');
                                                }}
                                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}

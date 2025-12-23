import FlashMessage from '@/components/flash-message';
import { resolveUrl } from '@/lib/utils';
import admin from '@/routes/admin';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    Armchair,
    BarChart3,
    Bell,
    Building2,
    ChevronDown,
    Home,
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
    Users,
    X,
} from 'lucide-react';
import { type PropsWithChildren, useEffect, useState } from 'react';

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
    { label: 'Analytics', href: admin.analytics().url, icon: BarChart3 },
    { label: 'Settings', href: admin.settings().url, icon: Settings },
];

export default function AdminLayout({ children, breadcrumbs }: AdminLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark');
        setDarkMode(isDark);
    }, []);

    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
        setDarkMode(!darkMode);
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
                className={`fixed top-0 left-0 z-50 h-full bg-slate-900 transition-all duration-300 ${
                    sidebarOpen ? 'w-64' : 'w-20'
                } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
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

                {/* Navigation */}
                <nav className="mt-6 px-3">
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

                {/* Back to Site */}
                <div className="absolute bottom-6 left-0 right-0 px-3">
                    <Link
                        href="/"
                        className="flex items-center gap-3 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white"
                    >
                        <Home className="h-5 w-5 flex-shrink-0" />
                        {sidebarOpen && <span>Back to Site</span>}
                    </Link>
                </div>
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
                            <button className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800">
                                <Bell className="h-5 w-5" />
                                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
                            </button>

                            {/* User Menu */}
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
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
                                            >
                                                <Settings className="h-4 w-4" />
                                                Settings
                                            </Link>
                                            <hr className="my-2 border-slate-200 dark:border-slate-700" />
                                            <Link
                                                href="/logout"
                                                method="post"
                                                as="button"
                                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </Link>
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

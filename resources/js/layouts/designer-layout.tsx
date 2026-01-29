import FlashMessage from '@/components/flash-message';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Calendar,
    ChevronDown,
    Home,
    LogOut,
    Menu,
    Moon,
    Settings,
    Sun,
    User,
    X
} from 'lucide-react';
import { type PropsWithChildren, useEffect, useState } from 'react';

interface DesignerLayoutProps extends PropsWithChildren {
    breadcrumbs?: BreadcrumbItem[];
}

const navItems = [
    { label: 'Dashboard', href: '/designer', icon: Home },
    { label: 'My Bookings', href: '/designer/bookings', icon: Calendar },
    { label: 'Profile', href: '/designer/profile', icon: User },
];

export default function DesignerLayout({ children, breadcrumbs }: DesignerLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
        setDarkMode(isDark);
        document.documentElement.classList.toggle('dark', isDark);
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newMode);
    };

    const isActivePath = (href: string) => {
        if (href === '/designer') {
            return currentPath === '/designer' || currentPath === '/designer/';
        }
        return currentPath.startsWith(href);
    };

    const handleLogout = () => {
        setUserMenuOpen(false);
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <FlashMessage />

            {/* Sidebar - Desktop */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 hidden transform bg-white transition-all duration-300 dark:bg-slate-900 lg:block ${
                    sidebarOpen ? 'w-64' : 'w-20'
                } border-r border-slate-200 dark:border-slate-800`}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
                    <Link href="/designer" className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
                            <User className="h-5 w-5" />
                        </div>
                        {sidebarOpen && (
                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                Designer
                            </span>
                        )}
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-6 space-y-1 px-3">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActivePath(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all ${
                                    isActive
                                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {sidebarOpen && <span>{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info */}
                <div className="absolute bottom-0 left-0 right-0 border-t border-slate-200 p-4 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                            {auth?.user?.name?.charAt(0).toUpperCase() || 'D'}
                        </div>
                        {sidebarOpen && (
                            <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                    {auth?.user?.name || 'Designer'}
                                </div>
                                <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                                    Designer Account
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900">
                        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                Designer Panel
                            </span>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <nav className="mt-6 space-y-1 px-3">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = isActivePath(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition-all ${
                                            isActive
                                                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
                {/* Top Header */}
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80 lg:px-6">
                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    {/* Breadcrumbs */}
                    <div className="hidden items-center gap-2 text-sm lg:flex">
                        <Link
                            href="/designer"
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                            Designer
                        </Link>
                        {breadcrumbs?.map((crumb, index) => (
                            <span key={index} className="flex items-center gap-2">
                                <span className="text-slate-300 dark:text-slate-600">/</span>
                                <Link
                                    href={crumb.href}
                                    className={`${
                                        index === breadcrumbs.length - 1
                                            ? 'font-medium text-slate-900 dark:text-white'
                                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                    }`}
                                >
                                    {crumb.title}
                                </Link>
                            </span>
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">
                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-sm font-medium text-white">
                                    {auth?.user?.name?.charAt(0).toUpperCase() || 'D'}
                                </div>
                                <span className="hidden font-medium sm:inline">
                                    {auth?.user?.name || 'Designer'}
                                </span>
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                        <Link
                                            href="/designer/profile"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                            onClick={() => setUserMenuOpen(false)}
                                        >
                                            <Settings className="h-4 w-4" />
                                            Profile Settings
                                        </Link>
                                        <hr className="my-1 border-slate-200 dark:border-slate-700" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-6">{children}</main>
            </div>
        </div>
    );
}

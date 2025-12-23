import AdminLayout from '@/layouts/admin-layout';
import { resolveUrl } from '@/lib/utils';
import admin from '@/routes/admin';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    Armchair,
    ArrowDown,
    ArrowRight,
    ArrowUp,
    Building2,
    Layers,
    Palette,
    TrendingUp,
    Users,
} from 'lucide-react';

interface DashboardStats {
    totalUsers: number;
    totalDesigns: number;
    totalFurniture: number;
    totalMaterials: number;
    usersChange: number;
    designsChange: number;
}

interface Props {
    stats?: DashboardStats;
}

// Default data for demonstration
const defaultStats: DashboardStats = {
    totalUsers: 1248,
    totalDesigns: 342,
    totalFurniture: 156,
    totalMaterials: 89,
    usersChange: 12.5,
    designsChange: 8.3,
};

const quickLinks = [
    { 
        title: 'Home Designs', 
        description: 'Manage house design templates',
        href: admin.homeDesigns.index().url, 
        icon: Building2, 
        color: 'from-blue-500 to-cyan-500',
        bgLight: 'bg-blue-50',
        bgDark: 'dark:bg-blue-950/30',
        count: 45
    },
    { 
        title: 'Interior Designs', 
        description: 'Manage interior design gallery',
        href: admin.interiorDesigns.index().url, 
        icon: Palette, 
        color: 'from-purple-500 to-pink-500',
        bgLight: 'bg-purple-50',
        bgDark: 'dark:bg-purple-950/30',
        count: 78
    },
    { 
        title: 'Furniture Library', 
        description: 'Manage furniture items for users',
        href: admin.furniture.index().url, 
        icon: Armchair, 
        color: 'from-amber-500 to-orange-500',
        bgLight: 'bg-amber-50',
        bgDark: 'dark:bg-amber-950/30',
        count: 156
    },
    { 
        title: 'Materials', 
        description: 'Construction materials & finishes',
        href: admin.materials.index().url, 
        icon: Layers, 
        color: 'from-emerald-500 to-teal-500',
        bgLight: 'bg-emerald-50',
        bgDark: 'dark:bg-emerald-950/30',
        count: 89
    },
];

export default function AdminDashboard({ stats = defaultStats }: Props) {
    return (
        <AdminLayout breadcrumbs={[{ title: 'Dashboard', href: admin.dashboard() }]}>
            <Head title="Admin Dashboard" />

            <div className="space-y-8">
                {/* Welcome Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Welcome back! Here's an overview of your platform.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Users */}
                    <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start justify-between">
                            <div className="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-950/50">
                                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <span className={`flex items-center gap-1 text-sm font-medium ${stats.usersChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {stats.usersChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                {Math.abs(stats.usersChange)}%
                            </span>
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {stats.totalUsers.toLocaleString()}
                            </div>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Total Users</p>
                        </div>
                        <Link 
                            href="/admin/users"
                            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-indigo-400"
                        >
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Total Designs */}
                    <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start justify-between">
                            <div className="rounded-xl bg-purple-100 p-3 dark:bg-purple-950/50">
                                <Building2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className={`flex items-center gap-1 text-sm font-medium ${stats.designsChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {stats.designsChange >= 0 ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                                {Math.abs(stats.designsChange)}%
                            </span>
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {stats.totalDesigns.toLocaleString()}
                            </div>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Total Designs</p>
                        </div>
                        <Link 
                            href="/admin/home-designs"
                            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-purple-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-purple-400"
                        >
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Furniture Items */}
                    <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start justify-between">
                            <div className="rounded-xl bg-amber-100 p-3 dark:bg-amber-950/50">
                                <Armchair className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                                <TrendingUp className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {stats.totalFurniture}
                            </div>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Furniture Items</p>
                        </div>
                        <Link 
                            href="/admin/furniture"
                            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-amber-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-amber-400"
                        >
                            Manage <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Materials */}
                    <div className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-start justify-between">
                            <div className="rounded-xl bg-emerald-100 p-3 dark:bg-emerald-950/50">
                                <Layers className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                                <Activity className="h-4 w-4" />
                            </span>
                        </div>
                        <div className="mt-4">
                            <div className="text-3xl font-bold text-slate-900 dark:text-white">
                                {stats.totalMaterials}
                            </div>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Materials</p>
                        </div>
                        <Link 
                            href="/admin/materials"
                            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-emerald-400"
                        >
                            Manage <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>

                {/* Quick Access Cards */}
                <div>
                    <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                        Quick Access
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {quickLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={resolveUrl(link.href)}
                                    href={link.href}
                                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                                >
                                    {/* Gradient Background on Hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-0 transition-opacity group-hover:opacity-5`} />
                                    
                                    <div className="relative">
                                        <div className={`inline-flex rounded-xl ${link.bgLight} ${link.bgDark} p-3`}>
                                            <Icon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                                        </div>
                                        
                                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                                            {link.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                            {link.description}
                                        </p>
                                        
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                                {link.count}
                                            </span>
                                            <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                Manage <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Platform Status & Quick Actions */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Platform Status */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Platform Status
                        </h3>
                        <div className="mt-6 space-y-4">
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Server Status</span>
                                <span className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                                    Operational
                                </span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Database</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">Connected</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Storage</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">128 GB / 500 GB</span>
                            </div>
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800">
                                <span className="text-sm text-slate-600 dark:text-slate-400">Last Backup</span>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">2 hours ago</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Quick Actions
                        </h3>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <Link
                                href="/admin/home-designs/create"
                                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm font-medium text-slate-700 transition-all hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
                            >
                                + New Home Design
                            </Link>
                            <Link
                                href="/admin/interior-designs/create"
                                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm font-medium text-slate-700 transition-all hover:border-purple-500 hover:bg-purple-50 hover:text-purple-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-purple-500 dark:hover:bg-purple-950/30 dark:hover:text-purple-400"
                            >
                                + New Interior
                            </Link>
                            <Link
                                href="/admin/furniture/create"
                                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm font-medium text-slate-700 transition-all hover:border-amber-500 hover:bg-amber-50 hover:text-amber-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-amber-500 dark:hover:bg-amber-950/30 dark:hover:text-amber-400"
                            >
                                + Add Furniture
                            </Link>
                            <Link
                                href="/admin/materials/create"
                                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-sm font-medium text-slate-700 transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400"
                            >
                                + Add Material
                            </Link>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <Link
                                href="/admin/users"
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl"
                            >
                                <Users className="h-4 w-4" />
                                Manage All Users
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

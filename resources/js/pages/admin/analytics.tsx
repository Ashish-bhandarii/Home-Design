import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';
import { Head, Link, type InertiaLinkProps } from '@inertiajs/react';
import {
    AlertTriangle,
    Armchair,
    BarChart3,
    Box,
    ChevronRight,
    Home,
    Layers,
    Package,
    Star,
    TrendingUp,
    Users,
} from 'lucide-react';

interface Stats {
    totalUsers: number;
    totalFurniture: number;
    totalMaterials: number;
    totalDesigns: number;
    activeFurniture: number;
    activeMaterials: number;
    featuredFurniture: number;
    featuredMaterials: number;
    recentUsers: number;
    lowStockFurniture: number;
    outOfStockFurniture: number;
}

interface ChartData {
    [key: string]: string | number;
}

interface Props {
    stats: Stats;
    userGrowth: { month: string; users: number }[];
    furnitureByCategory: { category: string; count: number }[];
    furnitureByRoom: { room: string; count: number }[];
    materialsByCategory: { category: string; count: number }[];
    materialsByType: { type: string; count: number }[];
    furniturePriceRanges: { range: string; count: number }[];
    topFurniture: { id: number; name: string; category: string; price: number; is_active: boolean }[];
    topMaterials: { id: number; name: string; category: string; price_per_unit: number; unit: string; is_active: boolean }[];
    recentFurniture: { id: number; name: string; category: string; created_at: string }[];
    recentMaterials: { id: number; name: string; category: string; created_at: string }[];
}

const categoryColors: Record<string, string> = {
    'Seating': 'bg-blue-500',
    'Tables': 'bg-emerald-500',
    'Beds': 'bg-purple-500',
    'Storage': 'bg-amber-500',
    'Lighting': 'bg-yellow-500',
    'Decor': 'bg-pink-500',
    'Construction': 'bg-orange-500',
    'Flooring': 'bg-cyan-500',
    'Wall Finish': 'bg-indigo-500',
    'Color Palette': 'bg-rose-500',
};

function StatCard({ title, value, subtitle, icon: Icon, color, link }: {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: any;
    color: string;
    link?: string;
}) {
    const content = (
        <div className={`rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${link ? 'hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer' : ''}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
                    {subtitle && (
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                    )}
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                    <Icon className="h-6 w-6 text-white" />
                </div>
            </div>
            {link && (
                <div className="mt-3 flex items-center text-sm text-indigo-600 dark:text-indigo-400">
                    View details <ChevronRight className="ml-1 h-4 w-4" />
                </div>
            )}
        </div>
    );

    return link ? <Link href={link}>{content}</Link> : content;
}

function ProgressBar({ label, value, total, color }: {
    label: string;
    value: number;
    total: number;
    color: string;
}) {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                <span className="font-medium text-slate-900 dark:text-white">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                    className={`h-full rounded-full ${color}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}

function SimpleBarChart({ data, dataKey, labelKey, color = 'bg-indigo-500' }: {
    data: ChartData[];
    dataKey: string;
    labelKey: string;
    color?: string;
}) {
    const maxValue = Math.max(...data.map(d => Number(d[dataKey])));
    
    return (
        <div className="space-y-3">
            {data.map((item, index) => {
                const value = Number(item[dataKey]);
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                const barColor = categoryColors[String(item[labelKey])] || color;
                
                return (
                    <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400 truncate max-w-[60%]">
                                {String(item[labelKey])}
                            </span>
                            <span className="font-medium text-slate-900 dark:text-white">{value}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                                className={`h-full rounded-full ${barColor} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function Analytics({
    stats,
    userGrowth,
    furnitureByCategory,
    furnitureByRoom,
    materialsByCategory,
    materialsByType,
    furniturePriceRanges,
    topFurniture,
    topMaterials,
    recentFurniture,
    recentMaterials,
}: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AdminLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin' }, { title: 'Analytics', href: '/admin/analytics' }]}>
            <Head title="Analytics - Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">
                        Overview of your furniture and materials inventory
                    </p>
                </div>

                {/* Main Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        subtitle={`+${stats.recentUsers} this month`}
                        icon={Users}
                        color="bg-gradient-to-br from-blue-500 to-blue-600"
                        link="/admin/users"
                    />
                    <StatCard
                        title="Furniture Items"
                        value={stats.totalFurniture}
                        subtitle={`${stats.activeFurniture} active`}
                        icon={Armchair}
                        color="bg-gradient-to-br from-emerald-500 to-emerald-600"
                        link="/admin/furniture"
                    />
                    <StatCard
                        title="Materials"
                        value={stats.totalMaterials}
                        subtitle={`${stats.activeMaterials} active`}
                        icon={Layers}
                        color="bg-gradient-to-br from-purple-500 to-purple-600"
                        link="/admin/materials"
                    />
                    <StatCard
                        title="Interior Designs"
                        value={stats.totalDesigns}
                        subtitle="Published designs"
                        icon={Home}
                        color="bg-gradient-to-br from-amber-500 to-amber-600"
                        link="/admin/interior-designs"
                    />
                </div>

                {/* Featured & Stock Stats */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-950/50">
                                <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.featuredFurniture}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Featured Furniture</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/50">
                                <Star className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.featuredMaterials}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Featured Materials</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/50">
                                <Package className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.lowStockFurniture}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Low Stock Items</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/50">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.outOfStockFurniture}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Out of Stock</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Row 1 */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Furniture by Category */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Furniture by Category
                            </h2>
                            <BarChart3 className="h-5 w-5 text-slate-400" />
                        </div>
                        <SimpleBarChart
                            data={furnitureByCategory}
                            dataKey="count"
                            labelKey="category"
                        />
                    </div>

                    {/* Materials by Category */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Materials by Category
                            </h2>
                            <BarChart3 className="h-5 w-5 text-slate-400" />
                        </div>
                        <SimpleBarChart
                            data={materialsByCategory}
                            dataKey="count"
                            labelKey="category"
                        />
                    </div>
                </div>

                {/* Charts Row 2 */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Furniture by Room */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Furniture by Room
                            </h2>
                            <Home className="h-5 w-5 text-slate-400" />
                        </div>
                        <SimpleBarChart
                            data={furnitureByRoom}
                            dataKey="count"
                            labelKey="room"
                            color="bg-cyan-500"
                        />
                    </div>

                    {/* Furniture Price Distribution */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Furniture Price Ranges
                            </h2>
                            <TrendingUp className="h-5 w-5 text-slate-400" />
                        </div>
                        <SimpleBarChart
                            data={furniturePriceRanges}
                            dataKey="count"
                            labelKey="range"
                            color="bg-violet-500"
                        />
                    </div>
                </div>

                {/* Tables Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Top Priced Furniture */}
                    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Top Priced Furniture
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {topFurniture.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/admin/furniture/${item.id}/edit`}
                                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                            <Armchair className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            NPR {item.price.toLocaleString()}
                                        </p>
                                        <span className={`text-xs ${item.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Top Priced Materials */}
                    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Top Priced Materials
                            </h2>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {topMaterials.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/admin/materials/${item.id}/edit`}
                                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                            <Layers className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            NPR {item.price_per_unit.toLocaleString()}/{item.unit}
                                        </p>
                                        <span className={`text-xs ${item.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {item.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Items */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recently Added Furniture */}
                    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Recently Added Furniture
                            </h2>
                            <Link
                                href="/admin/furniture"
                                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentFurniture.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${categoryColors[item.category] || 'bg-slate-400'}`} />
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-slate-400">{formatDate(item.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recently Added Materials */}
                    <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Recently Added Materials
                            </h2>
                            <Link
                                href="/admin/materials"
                                className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentMaterials.map((item) => (
                                <div key={item.id} className="flex items-center justify-between p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${categoryColors[item.category] || 'bg-slate-400'}`} />
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-slate-400">{formatDate(item.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Material Types Distribution */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Materials by Type (Top 10)
                        </h2>
                        <Box className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        {materialsByType.map((item, index) => (
                            <div
                                key={index}
                                className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50"
                            >
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{item.count}</p>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 truncate">{item.type}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

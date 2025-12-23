import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Edit,
    Eye,
    Filter,
    Grid3X3,
    Home,
    LayoutGrid,
    PenTool,
    Plus,
    Search,
    Star,
    Trash2
} from 'lucide-react';
import { useState } from 'react';

interface Design {
    id: number;
    title: string;
    description: string | null;
    type: 'floor_plan' | 'home_design' | 'interior_design';
    category: string | null;
    thumbnail: string | null;
    dimensions: string | null;
    rooms: number | null;
    bathrooms: number | null;
    is_featured: boolean;
    is_active: boolean;
    views: number;
    downloads: number;
    created_at: string;
}

interface PaginatedDesigns {
    data: Design[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    designs: PaginatedDesigns;
    filters: {
        type?: string;
        status?: string;
        search?: string;
    };
}

const typeIcons = {
    floor_plan: LayoutGrid,
    home_design: Home,
    interior_design: PenTool,
};

const typeLabels = {
    floor_plan: 'Floor Plan',
    home_design: 'Home Design',
    interior_design: 'Interior Design',
};

const typeColors = {
    floor_plan: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
    home_design: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
    interior_design: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
};

export default function DesignsIndex({ designs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [openMenu, setOpenMenu] = useState<number | null>(null);

    const handleFilter = () => {
        router.get(
            '/admin/designs',
            { search, type: typeFilter, status: statusFilter },
            { preserveState: true },
        );
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this design?')) {
            router.delete(`/admin/designs/${id}`);
        }
    };

    const toggleFeatured = (id: number) => {
        router.post(`/admin/designs/${id}/toggle-featured`);
    };

    const toggleActive = (id: number) => {
        router.post(`/admin/designs/${id}/toggle-active`);
    };

    return (
        <AdminLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin' }, { title: 'Designs', href: '/admin/designs' }]}>
            <Head title="Manage Designs" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Designs</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            Manage floor plans, home designs, and interior designs
                        </p>
                    </div>
                    <Link
                        href="/admin/designs/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl"
                    >
                        <Plus className="h-4 w-4" />
                        Add Design
                    </Link>
                </div>

                {/* Filters */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search designs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

                        {/* Type Filter */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                            <option value="">All Types</option>
                            <option value="floor_plan">Floor Plans</option>
                            <option value="home_design">Home Designs</option>
                            <option value="interior_design">Interior Designs</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <button
                            onClick={handleFilter}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            <Filter className="h-4 w-4" />
                            Filter
                        </button>
                    </div>
                </div>

                {/* Designs Grid */}
                {designs.data.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {designs.data.map((design) => {
                            const TypeIcon = typeIcons[design.type];
                            return (
                                <div
                                    key={design.id}
                                    className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-800">
                                        {design.thumbnail ? (
                                            <img
                                                src={`/storage/${design.thumbnail}`}
                                                alt={design.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <TypeIcon className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                                            </div>
                                        )}

                                        {/* Featured Badge */}
                                        {design.is_featured && (
                                            <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-xs font-medium text-white">
                                                <Star className="h-3 w-3 fill-current" />
                                                Featured
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div
                                            className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-medium ${
                                                design.is_active
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-slate-500 text-white'
                                            }`}
                                        >
                                            {design.is_active ? 'Active' : 'Inactive'}
                                        </div>

                                        {/* Hover Actions */}
                                        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                            <Link
                                                href={`/admin/designs/${design.id}/edit`}
                                                className="rounded-lg bg-white p-2 text-slate-700 transition-colors hover:bg-slate-100"
                                            >
                                                <Edit className="h-5 w-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(design.id)}
                                                className="rounded-lg bg-red-500 p-2 text-white transition-colors hover:bg-red-600"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4">
                                        <div className="mb-2 flex items-center gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${typeColors[design.type]}`}
                                            >
                                                <TypeIcon className="h-3 w-3" />
                                                {typeLabels[design.type]}
                                            </span>
                                        </div>

                                        <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">
                                            {design.title}
                                        </h3>

                                        {design.description && (
                                            <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                                {design.description}
                                            </p>
                                        )}

                                        {/* Meta Info */}
                                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                            {design.dimensions && <span>{design.dimensions}</span>}
                                            {design.rooms !== null && <span>{design.rooms} Rooms</span>}
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {design.views}
                                            </span>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 flex items-center gap-2">
                                            <button
                                                onClick={() => toggleFeatured(design.id)}
                                                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                                    design.is_featured
                                                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-950/50 dark:text-amber-400'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                                }`}
                                            >
                                                {design.is_featured ? 'Unfeature' : 'Feature'}
                                            </button>
                                            <button
                                                onClick={() => toggleActive(design.id)}
                                                className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                                    design.is_active
                                                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                                }`}
                                            >
                                                {design.is_active ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
                        <Grid3X3 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No designs found</h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Get started by creating your first design.
                        </p>
                        <Link
                            href="/admin/designs/create"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white"
                        >
                            <Plus className="h-4 w-4" />
                            Add Design
                        </Link>
                    </div>
                )}

                {/* Pagination */}
                {designs.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {designs.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                                    link.active
                                        ? 'bg-indigo-500 text-white'
                                        : link.url
                                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                                          : 'cursor-not-allowed bg-slate-50 text-slate-400 dark:bg-slate-900'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';
import { Head, Link, router } from '@inertiajs/react';
import {
    Building2,
    Edit,
    Eye,
    Filter,
    MoreVertical,
    Plus,
    Search,
    Star,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface HomeDesign {
    id: number;
    name: string;
    description: string | null;
    style: string | null;
    total_floors: number;
    total_area_sqft: string | null;
    bedrooms: number;
    bathrooms: number;
    cover_image: string | null;
    is_featured: boolean;
    is_active: boolean;
    views: number;
    downloads: number;
    floor_designs_count: number;
    created_at: string;
}

interface PaginatedData {
    data: HomeDesign[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    designs: PaginatedData;
    filters: {
        style?: string;
        status?: string;
        search?: string;
        bedrooms?: string;
    };
    styleOptions: Record<string, string>;
}

export default function HomeDesignsIndex({ designs, filters, styleOptions }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedStyle, setSelectedStyle] = useState(filters.style || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedBedrooms, setSelectedBedrooms] = useState(filters.bedrooms || '');
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        router.get(admin.homeDesigns.index({
            query: {
                search: search || undefined,
                style: selectedStyle || undefined,
                status: selectedStatus || undefined,
                bedrooms: selectedBedrooms || undefined,
            }
        }).url, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedStyle('');
        setSelectedStatus('');
        setSelectedBedrooms('');
        router.get(admin.homeDesigns.index().url);
    };

    const toggleFeatured = (id: number) => {
        router.post(admin.homeDesigns.toggleFeatured({ homeDesign: id }).url, {}, {
            preserveScroll: true,
        });
    };

    const toggleActive = (id: number) => {
        router.post(admin.homeDesigns.toggleActive({ homeDesign: id }).url, {}, {
            preserveScroll: true,
        });
    };

    const deleteDesign = (id: number) => {
        if (confirm('Are you sure you want to delete this design?')) {
            router.delete(admin.homeDesigns.destroy({ homeDesign: id }).url);
        }
    };

    return (
        <AdminLayout>
            <Head title="Home Designs" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Home Designs
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Manage complete home/building design plans
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Showing <span className="font-medium text-slate-900 dark:text-white">{designs.data.length}</span> / <span className="font-medium text-slate-900 dark:text-white">{designs.total}</span> designs</p>
                    </div>
                    <Link
                        href={admin.homeDesigns.create().url}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Design
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <form onSubmit={handleSearch} className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search home designs..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-indigo-500"
                                />
                            </div>
                        </form>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                                showFilters
                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            }`}
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                            {(selectedStyle || selectedStatus || selectedBedrooms) && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-xs text-white">
                                    {[selectedStyle, selectedStatus, selectedBedrooms].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 dark:border-slate-700 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Style
                                </label>
                                <select
                                    value={selectedStyle}
                                    onChange={(e) => setSelectedStyle(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="">All Styles</option>
                                    {Object.entries(styleOptions).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Status
                                </label>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Bedrooms
                                </label>
                                <select
                                    value={selectedBedrooms}
                                    onChange={(e) => setSelectedBedrooms(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                >
                                    <option value="">Any Bedrooms</option>
                                    {[1, 2, 3, 4, 5, 6].map((num) => (
                                        <option key={num} value={num}>{num} BHK</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={applyFilters}
                                    className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Designs Grid */}
                {designs.data.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {designs.data.map((design) => (
                            <div
                                key={design.id}
                                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700">
                                    {design.cover_image ? (
                                        <img
                                            src={`/storage/${design.cover_image}`}
                                            alt={design.name}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                                        </div>
                                    )}
                                    {/* Badges */}
                                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                                        {design.is_featured && (
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2 py-1 text-xs font-medium text-white">
                                                <Star className="h-3 w-3" fill="currentColor" />
                                                Featured
                                            </span>
                                        )}
                                        {!design.is_active && (
                                            <span className="rounded-lg bg-slate-500 px-2 py-1 text-xs font-medium text-white">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    {/* Actions Dropdown */}
                                    <div className="absolute right-3 top-3">
                                        <div className="relative">
                                            <button
                                                onClick={() => setDropdownOpen(dropdownOpen === design.id ? null : design.id)}
                                                className="rounded-lg bg-white/90 p-2 text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:bg-slate-800/90 dark:text-slate-300"
                                            >
                                                <MoreVertical className="h-4 w-4" />
                                            </button>
                                            {dropdownOpen === design.id && (
                                                <div className="absolute right-0 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                                    <Link
                                                        href={admin.homeDesigns.edit({ homeDesign: design.id }).url}
                                                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => toggleFeatured(design.id)}
                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    >
                                                        <Star className="h-4 w-4" />
                                                        {design.is_featured ? 'Remove Featured' : 'Mark Featured'}
                                                    </button>
                                                    <button
                                                        onClick={() => toggleActive(design.id)}
                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        {design.is_active ? 'Deactivate' : 'Activate'}
                                                    </button>
                                                    <hr className="my-1 border-slate-200 dark:border-slate-700" />
                                                    <button
                                                        onClick={() => deleteDesign(design.id)}
                                                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                        {design.name}
                                    </h3>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                        {design.style ? styleOptions[design.style] || design.style : 'No style specified'}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                            {design.bedrooms} BHK
                                        </span>
                                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                            {design.total_floors} Floor{design.total_floors > 1 ? 's' : ''}
                                        </span>
                                        {design.total_area_sqft && (
                                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                                {parseFloat(design.total_area_sqft).toLocaleString()} sq.ft
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                                        <span>{design.floor_designs_count} Floor Plan{design.floor_designs_count !== 1 ? 's' : ''}</span>
                                        <span>{design.views} views</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
                        <Building2 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                        <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                            No home designs found
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Get started by creating your first home design.
                        </p>
                        <Link
                            href={admin.homeDesigns.create().url}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                        >
                            <Plus className="h-4 w-4" />
                            Create Design
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
                                        ? 'bg-indigo-600 text-white'
                                        : link.url
                                        ? 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                                        : 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700'
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

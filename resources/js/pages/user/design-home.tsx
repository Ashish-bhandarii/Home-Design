import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Bath,
    Bed,
    Building2,
    Car,
    ChevronDown,
    Eye,
    Filter,
    Home,
    Layers,
    MapPin,
    Ruler,
    Search,
    Sparkles,
    Star,
    TreePine,
    Waves,
    X,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Home Designs', href: '/design-home' },
];

type GalleryImage = {
    id: number;
    url: string;
    caption?: string | null;
};

type HomeDesign = {
    id: number;
    name: string;
    description?: string | null;
    style?: string | null;
    style_label?: string | null;
    total_floors: number;
    total_area_sqft?: string | null;
    bedrooms: number;
    bathrooms: number;
    kitchens: number;
    garages: number;
    has_basement: boolean;
    has_terrace: boolean;
    has_garden: boolean;
    has_swimming_pool: boolean;
    estimated_cost_min?: string | null;
    estimated_cost_max?: string | null;
    cover_image_url?: string | null;
    gallery_images: GalleryImage[];
    floor_count: number;
    views: number;
    is_featured: boolean;
};

type PaginatedData = {
    data: HomeDesign[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Props = {
    designs: PaginatedData;
    filters: {
        style?: string;
        bedrooms?: string;
        min_price?: string;
        max_price?: string;
        search?: string;
    };
    styleOptions: Record<string, string>;
};

function formatCurrency(value?: string | null): string {
    if (!value) return '';
    const num = parseFloat(value);
    if (num >= 10000000) {
        return `Rs. ${(num / 10000000).toFixed(1)}Cr`;
    }
    if (num >= 100000) {
        return `Rs. ${(num / 100000).toFixed(1)}L`;
    }
    return `Rs. ${num.toLocaleString()}`;
}

export default function DesignHome({ designs, filters, styleOptions }: Props) {
    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedStyle, setSelectedStyle] = useState(filters.style || '');
    const [selectedBedrooms, setSelectedBedrooms] = useState(filters.bedrooms || '');

    const applyFilters = () => {
        router.get('/design-home', {
            ...(search && { search }),
            ...(selectedStyle && { style: selectedStyle }),
            ...(selectedBedrooms && { bedrooms: selectedBedrooms }),
        }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedStyle('');
        setSelectedBedrooms('');
        router.get('/design-home', {}, { preserveState: true });
    };

    const hasActiveFilters = search || selectedStyle || selectedBedrooms;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home Designs" />

            <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Home Designs
                                </h1>
                                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                                    Browse {designs.total} beautiful home designs curated by our experts
                                </p>
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                                {hasActiveFilters && (
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs text-white">
                                        !
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Filters Panel */}
                        {showFilters && (
                            <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {/* Search */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                            Search
                                        </label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search designs..."
                                                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Style */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                            Style
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedStyle}
                                                onChange={(e) => setSelectedStyle(e.target.value)}
                                                className="w-full appearance-none rounded-xl border border-zinc-200 bg-white py-2.5 pl-4 pr-10 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
                                            >
                                                <option value="">All Styles</option>
                                                {Object.entries(styleOptions).map(([value, label]) => (
                                                    <option key={value} value={value}>
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        </div>
                                    </div>

                                    {/* Bedrooms */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                            Bedrooms
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={selectedBedrooms}
                                                onChange={(e) => setSelectedBedrooms(e.target.value)}
                                                className="w-full appearance-none rounded-xl border border-zinc-200 bg-white py-2.5 pl-4 pr-10 text-sm text-zinc-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
                                            >
                                                <option value="">Any</option>
                                                {[1, 2, 3, 4, 5, 6].map((num) => (
                                                    <option key={num} value={num}>
                                                        {num} Bedroom{num > 1 ? 's' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-end gap-2">
                                        <button
                                            onClick={applyFilters}
                                            className="flex-1 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                                        >
                                            Apply
                                        </button>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="rounded-xl border border-zinc-200 px-3 py-2.5 text-zinc-600 transition-all hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-700"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Designs Grid */}
                    {designs.data.length === 0 ? (
                        <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                            <Home className="mx-auto h-16 w-16 text-zinc-300 dark:text-zinc-600" />
                            <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">
                                No home designs found
                            </h3>
                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                {hasActiveFilters
                                    ? 'Try adjusting your filters to find more designs.'
                                    : 'Home designs are being added. Check back soon!'}
                            </p>
                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-orange-700"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {designs.data.map((design) => (
                                <Link
                                    key={design.id}
                                    href={`/design-home/${design.id}`}
                                    className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 dark:border-zinc-700 dark:bg-zinc-800/50"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20">
                                        {design.cover_image_url ? (
                                            <img
                                                src={design.cover_image_url}
                                                alt={design.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-2">
                                                <Building2 className="h-16 w-16 text-orange-400/60" />
                                                <span className="text-xs font-medium text-orange-500/80">
                                                    Home Design
                                                </span>
                                            </div>
                                        )}

                                        {/* Featured Badge */}
                                        {design.is_featured && (
                                            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                                                <Star className="h-3 w-3 fill-current" />
                                                Featured
                                            </div>
                                        )}

                                        {/* Quick Stats Overlay */}
                                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                            <div className="flex gap-2">
                                                {design.bedrooms > 0 && (
                                                    <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                        <Bed className="h-3 w-3" />
                                                        {design.bedrooms}
                                                    </span>
                                                )}
                                                {design.bathrooms > 0 && (
                                                    <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                        <Bath className="h-3 w-3" />
                                                        {design.bathrooms}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                <Eye className="h-3 w-3" />
                                                {design.views}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-1 flex-col p-5">
                                        <div className="mb-3 flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-zinc-900 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">
                                                    {design.name}
                                                </h3>
                                                {design.style_label && (
                                                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                                                        {design.style_label}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Specs Grid */}
                                        <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                            <div className="flex flex-col items-center">
                                                <Layers className="mb-1 h-4 w-4 text-zinc-400" />
                                                <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                                                    {design.total_floors}
                                                </span>
                                                <span className="text-[10px] text-zinc-500">Floors</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <Ruler className="mb-1 h-4 w-4 text-zinc-400" />
                                                <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                                                    {design.total_area_sqft
                                                        ? `${parseFloat(design.total_area_sqft).toLocaleString()}`
                                                        : '-'}
                                                </span>
                                                <span className="text-[10px] text-zinc-500">Sq.ft</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <MapPin className="mb-1 h-4 w-4 text-zinc-400" />
                                                <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                                                    {design.floor_count}
                                                </span>
                                                <span className="text-[10px] text-zinc-500">Plans</span>
                                            </div>
                                        </div>

                                        {/* Amenities */}
                                        <div className="mb-4 flex flex-wrap gap-1.5">
                                            {design.has_garden && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                    <TreePine className="h-3 w-3" />
                                                    Garden
                                                </span>
                                            )}
                                            {design.has_swimming_pool && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                    <Waves className="h-3 w-3" />
                                                    Pool
                                                </span>
                                            )}
                                            {design.garages > 0 && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                                                    <Car className="h-3 w-3" />
                                                    {design.garages} Car
                                                </span>
                                            )}
                                            {design.has_terrace && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                    <Sparkles className="h-3 w-3" />
                                                    Terrace
                                                </span>
                                            )}
                                        </div>

                                        {/* Price & Action */}
                                        <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-700">
                                            <div>
                                                {(design.estimated_cost_min || design.estimated_cost_max) ? (
                                                    <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                        {design.estimated_cost_min && design.estimated_cost_max
                                                            ? `${formatCurrency(design.estimated_cost_min)} - ${formatCurrency(design.estimated_cost_max)}`
                                                            : formatCurrency(design.estimated_cost_min || design.estimated_cost_max)}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-zinc-500">Contact for price</div>
                                                )}
                                            </div>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700 transition-colors group-hover:bg-orange-600 group-hover:text-white dark:bg-orange-900/30 dark:text-orange-400 dark:group-hover:bg-orange-600 dark:group-hover:text-white">
                                                View Details
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {designs.last_page > 1 && (
                        <div className="mt-8 flex items-center justify-center gap-2">
                            {designs.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    preserveState
                                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                        link.active
                                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                                            : link.url
                                            ? 'bg-white text-zinc-700 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                                            : 'cursor-not-allowed text-zinc-400'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

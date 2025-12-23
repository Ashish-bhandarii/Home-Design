import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Bath,
    Bed,
    Building2,
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    Compass,
    Download,
    Eye,
    FileText,
    HardHat,
    Heart,
    Home,
    Layers,
    Maximize2,
    Ruler,
    Share2,
    Sparkles,
    Star,
    X
} from 'lucide-react';
import { useState } from 'react';

type GalleryImage = {
    id: number;
    url: string;
    caption?: string | null;
};

type Room = {
    id: number;
    name: string;
    room_type: string;
    area_sqft?: string | null;
    width?: string | null;
    length?: string | null;
};

type FloorDesign = {
    id: number;
    floor_number: number;
    name?: string | null;
    area_sqft?: string | null;
    cover_image_url?: string | null;
    rooms: Room[];
};

type DesignFile = {
    id: number;
    title?: string | null;
    file_type: string;
    file_type_label: string;
    file_extension: string;
    file_size_formatted: string;
};

type HomeDesignData = {
    id: number;
    name: string;
    description?: string | null;
    style?: string | null;
    style_label?: string | null;
    construction_type?: string | null;
    construction_type_label?: string | null;
    facing_direction?: string | null;
    facing_direction_label?: string | null;
    total_floors: number;
    total_area_sqft?: string | null;
    plot_width?: string | null;
    plot_length?: string | null;
    bedrooms: number;
    bathrooms: number;
    kitchens: number;
    living_rooms: number;
    dining_rooms: number;
    balconies: number;
    garages: number;
    has_basement: boolean;
    has_terrace: boolean;
    has_garden: boolean;
    has_swimming_pool: boolean;
    estimated_cost_min?: string | null;
    estimated_cost_max?: string | null;
    features: string[];
    tags: string[];
    cover_image_url?: string | null;
    gallery_images: GalleryImage[];
    floor_designs: FloorDesign[];
    design_files: DesignFile[];
    views: number;
    downloads: number;
    is_featured: boolean;
    is_wishlisted: boolean;
    created_at: string;
};

type Props = {
    design: HomeDesignData;
};

function formatCurrency(value?: string | null): string {
    if (!value) return '';
    const num = parseFloat(value);
    if (num >= 10000000) {
        return `Rs. ${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
        return `Rs. ${(num / 100000).toFixed(2)} Lakh`;
    }
    return `Rs. ${num.toLocaleString()}`;
}

export default function DesignHomeShow({ design }: Props) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [activeFloor, setActiveFloor] = useState(0);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Home Designs', href: '/design-home' },
        { title: design.name, href: `/design-home/${design.id}` },
    ];

    // Combine cover image and gallery images for the lightbox
    const allImages: GalleryImage[] = [
        ...(design.cover_image_url
            ? [{ id: 0, url: design.cover_image_url, caption: 'Cover Image' }]
            : []),
        ...design.gallery_images,
    ];

    const openLightbox = (index: number) => {
        setSelectedImageIndex(index);
    };

    const closeLightbox = () => {
        setSelectedImageIndex(null);
    };

    const navigateImage = (direction: 'prev' | 'next') => {
        if (selectedImageIndex === null) return;
        const newIndex =
            direction === 'prev'
                ? (selectedImageIndex - 1 + allImages.length) % allImages.length
                : (selectedImageIndex + 1) % allImages.length;
        setSelectedImageIndex(newIndex);
    };

    const handleWishlist = () => {
        router.post('/wishlist/toggle', {
            wishlistable_id: design.id,
            wishlistable_type: 'App\\Models\\HomeDesign',
        }, {
            preserveScroll: true,
        });
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={design.name} />

            <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/20 to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        href="/design-home"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home Designs
                    </Link>

                    {/* Hero Section */}
                    <div className="mb-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800/50">
                        <div className="grid gap-0 lg:grid-cols-2">
                            {/* Main Image */}
                            <div className="relative aspect-[4/3] lg:aspect-auto">
                                {design.cover_image_url ? (
                                    <img
                                        src={design.cover_image_url}
                                        alt={design.name}
                                        className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                                        onClick={() => openLightbox(0)}
                                    />
                                ) : (
                                    <div className="flex h-full min-h-[400px] flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20">
                                        <Building2 className="h-24 w-24 text-orange-400/60" />
                                        <span className="mt-2 text-sm font-medium text-orange-500/80">
                                            Home Design
                                        </span>
                                    </div>
                                )}

                                {/* Featured Badge */}
                                {design.is_featured && (
                                    <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
                                        <Star className="h-4 w-4 fill-current" />
                                        Featured Design
                                    </div>
                                )}

                                {/* View Count */}
                                <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                                    <Eye className="h-4 w-4" />
                                    {design.views.toLocaleString()} views
                                </div>
                            </div>

                            {/* Info Panel */}
                            <div className="flex flex-col p-6 lg:p-8">
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {design.style_label && (
                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                            {design.style_label}
                                        </span>
                                    )}
                                    {design.construction_type_label && (
                                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                                            {design.construction_type_label}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white lg:text-4xl">
                                    {design.name}
                                </h1>

                                {design.description && (
                                    <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                                        {design.description}
                                    </p>
                                )}

                                {/* Quick Stats */}
                                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                        <Bed className="mb-1 h-5 w-5 text-orange-500" />
                                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                            {design.bedrooms}
                                        </span>
                                        <span className="text-xs text-zinc-500">Bedrooms</span>
                                    </div>
                                    <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                        <Bath className="mb-1 h-5 w-5 text-blue-500" />
                                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                            {design.bathrooms}
                                        </span>
                                        <span className="text-xs text-zinc-500">Bathrooms</span>
                                    </div>
                                    <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                        <Layers className="mb-1 h-5 w-5 text-purple-500" />
                                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                            {design.total_floors}
                                        </span>
                                        <span className="text-xs text-zinc-500">Floors</span>
                                    </div>
                                    <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                        <Ruler className="mb-1 h-5 w-5 text-green-500" />
                                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                            {design.total_area_sqft
                                                ? parseFloat(design.total_area_sqft).toLocaleString()
                                                : '-'}
                                        </span>
                                        <span className="text-xs text-zinc-500">Sq.ft</span>
                                    </div>
                                </div>

                                {/* Price */}
                                {(design.estimated_cost_min || design.estimated_cost_max) && (
                                    <div className="mt-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white">
                                        <span className="text-sm font-medium opacity-90">
                                            Estimated Cost
                                        </span>
                                        <div className="mt-1 text-2xl font-bold">
                                            {design.estimated_cost_min && design.estimated_cost_max
                                                ? `${formatCurrency(design.estimated_cost_min)} - ${formatCurrency(design.estimated_cost_max)}`
                                                : formatCurrency(
                                                      design.estimated_cost_min ||
                                                          design.estimated_cost_max
                                                  )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="mt-auto flex flex-wrap gap-3 pt-6">
                                    <a
                                        href={`/design-home/${design.id}/download`}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:bg-orange-700"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Plans
                                    </a>
                                    <button 
                                        onClick={handleWishlist}
                                        className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-all ${
                                            design.is_wishlisted 
                                                ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400' 
                                                : 'border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700'
                                        }`}
                                    >
                                        <Heart className={`h-4 w-4 ${design.is_wishlisted ? 'fill-current' : ''}`} />
                                    </button>
                                    <button 
                                        onClick={handleShare}
                                        className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                    >
                                        <Share2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gallery Section */}
                    {design.gallery_images.length > 0 && (
                        <div className="mb-8">
                            <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-white">
                                Gallery
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {design.gallery_images.map((image, index) => (
                                    <div
                                        key={image.id}
                                        className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800"
                                        onClick={() => openLightbox(design.cover_image_url ? index + 1 : index)}
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.caption || `Gallery image ${index + 1}`}
                                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                                            <Maximize2 className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Specifications */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                                <HardHat className="h-5 w-5 text-orange-500" />
                                Specifications
                            </h2>
                            <div className="space-y-3">
                                {design.plot_width && design.plot_length && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">
                                            Plot Size
                                        </span>
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            {design.plot_width} × {design.plot_length} ft
                                        </span>
                                    </div>
                                )}
                                {design.total_area_sqft && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">
                                            Total Area
                                        </span>
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            {parseFloat(design.total_area_sqft).toLocaleString()} sq.ft
                                        </span>
                                    </div>
                                )}
                                {design.facing_direction_label && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">
                                            Facing
                                        </span>
                                        <span className="flex items-center gap-1 font-medium text-zinc-900 dark:text-white">
                                            <Compass className="h-4 w-4 text-zinc-400" />
                                            {design.facing_direction_label}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500 dark:text-zinc-400">Kitchens</span>
                                    <span className="font-medium text-zinc-900 dark:text-white">
                                        {design.kitchens}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500 dark:text-zinc-400">
                                        Living Rooms
                                    </span>
                                    <span className="font-medium text-zinc-900 dark:text-white">
                                        {design.living_rooms}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500 dark:text-zinc-400">
                                        Dining Rooms
                                    </span>
                                    <span className="font-medium text-zinc-900 dark:text-white">
                                        {design.dining_rooms}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500 dark:text-zinc-400">Balconies</span>
                                    <span className="font-medium text-zinc-900 dark:text-white">
                                        {design.balconies}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500 dark:text-zinc-400">Garages</span>
                                    <span className="font-medium text-zinc-900 dark:text-white">
                                        {design.garages}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                                <Sparkles className="h-5 w-5 text-orange-500" />
                                Amenities
                            </h2>
                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    className={`flex items-center gap-2 rounded-lg p-2 text-sm ${
                                        design.has_basement
                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-zinc-50 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                                    }`}
                                >
                                    {design.has_basement ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <X className="h-4 w-4" />
                                    )}
                                    Basement
                                </div>
                                <div
                                    className={`flex items-center gap-2 rounded-lg p-2 text-sm ${
                                        design.has_terrace
                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-zinc-50 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                                    }`}
                                >
                                    {design.has_terrace ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <X className="h-4 w-4" />
                                    )}
                                    Terrace
                                </div>
                                <div
                                    className={`flex items-center gap-2 rounded-lg p-2 text-sm ${
                                        design.has_garden
                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-zinc-50 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                                    }`}
                                >
                                    {design.has_garden ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <X className="h-4 w-4" />
                                    )}
                                    Garden
                                </div>
                                <div
                                    className={`flex items-center gap-2 rounded-lg p-2 text-sm ${
                                        design.has_swimming_pool
                                            ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                            : 'bg-zinc-50 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                                    }`}
                                >
                                    {design.has_swimming_pool ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <X className="h-4 w-4" />
                                    )}
                                    Pool
                                </div>
                            </div>
                        </div>

                        {/* Features */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                                <Check className="h-5 w-5 text-orange-500" />
                                Features
                            </h2>
                            {design.features.length > 0 ? (
                                <ul className="space-y-2">
                                    {design.features.map((feature, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                                        >
                                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    No features listed for this design.
                                </p>
                            )}

                            {design.tags.length > 0 && (
                                <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-700">
                                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {design.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Available Files Section */}
                    {design.design_files && design.design_files.length > 0 && (
                        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
                                <FileText className="h-6 w-6 text-orange-500" />
                                Available Downloads
                            </h2>
                            <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                                {design.design_files.length} file{design.design_files.length !== 1 ? 's' : ''} available for download
                                {design.downloads > 0 && (
                                    <span className="ml-2">• Downloaded {design.downloads.toLocaleString()} time{design.downloads !== 1 ? 's' : ''}</span>
                                )}
                            </p>
                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                {design.design_files.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-600 dark:bg-zinc-900/50"
                                    >
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                            <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                                                {file.title || `File ${file.id}`}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <span>{file.file_type_label}</span>
                                                <span>•</span>
                                                <span className="uppercase">{file.file_extension}</span>
                                                <span>•</span>
                                                <span>{file.file_size_formatted}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6">
                                <a
                                    href={`/design-home/${design.id}/download`}
                                    className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:bg-orange-700"
                                >
                                    <Download className="h-4 w-4" />
                                    Download All Files ({design.design_files.length})
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Floor Plans Section */}
                    {design.floor_designs.length > 0 && (
                        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-white">
                                <Layers className="h-6 w-6 text-orange-500" />
                                Floor Plans
                            </h2>

                            {/* Floor Tabs */}
                            <div className="mb-6 flex flex-wrap gap-2">
                                {design.floor_designs.map((floor, index) => (
                                    <button
                                        key={floor.id}
                                        onClick={() => setActiveFloor(index)}
                                        className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                            activeFloor === index
                                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
                                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
                                        }`}
                                    >
                                        Floor {floor.floor_number}
                                        {floor.name && ` - ${floor.name}`}
                                    </button>
                                ))}
                            </div>

                            {/* Active Floor Content */}
                            {design.floor_designs[activeFloor] && (
                                <div className="grid gap-6 lg:grid-cols-2">
                                    {/* Floor Image */}
                                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                                        {design.floor_designs[activeFloor].cover_image_url ? (
                                            <img
                                                src={design.floor_designs[activeFloor].cover_image_url}
                                                alt={`Floor ${design.floor_designs[activeFloor].floor_number} Plan`}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center">
                                                <Home className="h-16 w-16 text-zinc-400" />
                                                <span className="mt-2 text-sm text-zinc-500">
                                                    Floor plan image not available
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Floor Info */}
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">
                                            Floor {design.floor_designs[activeFloor].floor_number}
                                            {design.floor_designs[activeFloor].name &&
                                                ` - ${design.floor_designs[activeFloor].name}`}
                                        </h3>
                                        {design.floor_designs[activeFloor].area_sqft && (
                                            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                                                Total Area:{' '}
                                                {parseFloat(
                                                    design.floor_designs[activeFloor].area_sqft!
                                                ).toLocaleString()}{' '}
                                                sq.ft
                                            </p>
                                        )}

                                        {/* Rooms List */}
                                        {design.floor_designs[activeFloor].rooms.length > 0 && (
                                            <div>
                                                <h4 className="mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                                    Rooms on this floor
                                                </h4>
                                                <div className="grid gap-2 sm:grid-cols-2">
                                                    {design.floor_designs[activeFloor].rooms.map(
                                                        (room) => (
                                                            <div
                                                                key={room.id}
                                                                className="flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-900/50"
                                                            >
                                                                <div>
                                                                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                                        {room.name}
                                                                    </span>
                                                                    <span className="ml-2 text-xs text-zinc-500">
                                                                        {room.room_type}
                                                                    </span>
                                                                </div>
                                                                {room.area_sqft && (
                                                                    <span className="text-xs text-zinc-500">
                                                                        {room.area_sqft} sq.ft
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="mt-6 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Added on {design.created_at}
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {design.views.toLocaleString()} views
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {selectedImageIndex !== null && allImages.length > 0 && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
                    onClick={closeLightbox}
                >
                    <button
                        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
                        onClick={closeLightbox}
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {allImages.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateImage('prev');
                                }}
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigateImage('next');
                                }}
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </>
                    )}

                    <img
                        src={allImages[selectedImageIndex].url}
                        alt={allImages[selectedImageIndex].caption || 'Gallery Image'}
                        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
                        onClick={(e) => e.stopPropagation()}
                    />

                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white">
                        {selectedImageIndex + 1} / {allImages.length}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

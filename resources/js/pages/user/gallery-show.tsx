import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    Download,
    Eye,
    Heart,
    Lamp,
    Layers,
    Maximize2,
    Palette,
    Ruler,
    Share2,
    Sofa,
    Sparkles,
    Square,
    Star,
    X,
} from 'lucide-react';
import { useState } from 'react';

type GalleryImage = {
    id: number;
    url: string;
    caption?: string | null;
};

type InteriorDesignData = {
    id: number;
    name: string;
    description?: string | null;
    room_type?: string | null;
    room_type_label?: string | null;
    style?: string | null;
    style_label?: string | null;
    color_scheme?: string | null;
    color_palette?: string[];
    flooring_type?: string | null;
    flooring_type_label?: string | null;
    ceiling_type?: string | null;
    ceiling_type_label?: string | null;
    lighting_type?: string | null;
    lighting_type_label?: string | null;
    primary_material?: string | null;
    primary_material_label?: string | null;
    room_width?: string | null;
    room_length?: string | null;
    room_height?: string | null;
    area_sqft?: string | null;
    estimated_cost_min?: string | null;
    estimated_cost_max?: string | null;
    features: string[];
    furniture_items: string[];
    tags: string[];
    cover_image_url?: string | null;
    gallery_images: GalleryImage[];
    views: number;
    downloads: number;
    is_featured: boolean;
    is_wishlisted: boolean;
    created_at: string;
};

type Props = {
    design: InteriorDesignData;
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

export default function GalleryShow({ design }: Props) {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Gallery', href: '/gallery' },
        { title: design.name, href: `/gallery/${design.id}` },
    ];

    // Combine cover image and gallery images for the lightbox
    const allImages: GalleryImage[] = [
        ...(design.cover_image_url
            ? [{ id: 0, url: design.cover_image_url, caption: 'Cover Image' }]
            : []),
        ...design.gallery_images,
    ];

    const handleWishlist = () => {
        router.post('/wishlist/toggle', {
            wishlistable_id: design.id,
            wishlistable_type: 'App\\Models\\InteriorDesign',
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={design.name} />

            <div className="min-h-screen bg-gradient-to-br from-white via-orange-50/20 to-zinc-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        href="/gallery"
                        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Gallery
                    </Link>

                    {/* Hero Section */}
                    <div className="mb-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800/50">
                        <div className="grid gap-0 lg:grid-cols-2">
                            {/* Main Image */}
                            <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[500px]">
                                {design.cover_image_url ? (
                                    <img
                                        src={design.cover_image_url}
                                        alt={design.name}
                                        className="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
                                        onClick={() => openLightbox(0)}
                                    />
                                ) : (
                                    <div className="flex h-full min-h-[400px] flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20">
                                        <Sofa className="h-24 w-24 text-orange-400/60" />
                                        <span className="mt-2 text-sm font-medium text-orange-500/80">
                                            Interior Design
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

                                {/* Stats */}
                                <div className="absolute bottom-4 left-4 flex gap-2">
                                    <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                                        <Eye className="h-4 w-4" />
                                        {design.views.toLocaleString()} views
                                    </span>
                                    <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                                        <Download className="h-4 w-4" />
                                        {design.downloads.toLocaleString()} downloads
                                    </span>
                                </div>
                            </div>

                            {/* Info Panel */}
                            <div className="flex flex-col p-6 lg:p-8">
                                <div className="mb-4 flex flex-wrap gap-2">
                                    {design.room_type_label && (
                                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                            {design.room_type_label}
                                        </span>
                                    )}
                                    {design.style_label && (
                                        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                                            {design.style_label}
                                        </span>
                                    )}
                                    {design.color_scheme && (
                                        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                            {design.color_scheme}
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
                                    {design.area_sqft && (
                                        <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                            <Ruler className="mb-1 h-5 w-5 text-orange-500" />
                                            <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                                {parseFloat(design.area_sqft).toLocaleString()}
                                            </span>
                                            <span className="text-[10px] text-zinc-500">Sq.ft</span>
                                        </div>
                                    )}
                                    {design.room_width && design.room_length && (
                                        <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                            <Square className="mb-1 h-5 w-5 text-blue-500" />
                                            <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                                {design.room_width}×{design.room_length}
                                            </span>
                                            <span className="text-[10px] text-zinc-500">Dimensions</span>
                                        </div>
                                    )}
                                    {design.room_height && (
                                        <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                            <Layers className="mb-1 h-5 w-5 text-purple-500" />
                                            <span className="text-lg font-bold text-zinc-900 dark:text-white">
                                                {design.room_height} ft
                                            </span>
                                            <span className="text-[10px] text-zinc-500">Height</span>
                                        </div>
                                    )}
                                    {design.lighting_type_label && (
                                        <div className="flex flex-col items-center rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
                                            <Lamp className="mb-1 h-5 w-5 text-amber-500" />
                                            <span className="text-sm font-bold text-zinc-900 dark:text-white">
                                                {design.lighting_type_label}
                                            </span>
                                            <span className="text-[10px] text-zinc-500">Lighting</span>
                                        </div>
                                    )}
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
                                        href={`/gallery/${design.id}/download`}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition-all hover:bg-orange-700"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download Design
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
                        {/* Features */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                                <Sparkles className="h-5 w-5 text-orange-500" />
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
                        </div>

                        {/* Specifications */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                                <Palette className="h-5 w-5 text-purple-500" />
                                Specifications
                            </h2>
                            <div className="space-y-3">
                                {design.flooring_type_label && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">Flooring</span>
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            {design.flooring_type_label}
                                        </span>
                                    </div>
                                )}
                                {design.ceiling_type_label && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">Ceiling</span>
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            {design.ceiling_type_label}
                                        </span>
                                    </div>
                                )}
                                {design.primary_material_label && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">Material</span>
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            {design.primary_material_label}
                                        </span>
                                    </div>
                                )}
                                {design.color_scheme && (
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-zinc-500 dark:text-zinc-400">Color Scheme</span>
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            {design.color_scheme}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {design.color_palette && design.color_palette.length > 0 && (
                                <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-700">
                                    <span className="mb-2 block text-xs font-medium text-zinc-500">Color Palette</span>
                                    <div className="flex flex-wrap gap-2">
                                        {design.color_palette.map((color, index) => (
                                            <span
                                                key={index}
                                                className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                                            >
                                                {color}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Furniture List */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-900 dark:text-white">
                                <Sofa className="h-5 w-5 text-blue-500" />
                                Furniture Items
                            </h2>
                            {design.furniture_items.length > 0 ? (
                                <ul className="space-y-2">
                                    {design.furniture_items.map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                                        >
                                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    No furniture list available.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tags */}
                    {design.tags.length > 0 && (
                        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800/50">
                            <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-white">
                                Tags
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {design.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="rounded-full bg-orange-100 px-3 py-1.5 text-sm font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="mt-6 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Added on {design.created_at}
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {design.views.toLocaleString()} views
                            </span>
                            <span className="flex items-center gap-1">
                                <Download className="h-4 w-4" />
                                {design.downloads.toLocaleString()} downloads
                            </span>
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

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { Download, Eye, Heart, Image, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Gallery', href: '/gallery' },
];

type GalleryImage = {
    id: number;
    url: string;
    caption?: string | null;
};

type GalleryDesign = {
    id: number;
    name: string;
    description?: string | null;
    room_type?: string | null;
    style?: string | null;
    cover_image_url?: string | null;
    gallery_images: GalleryImage[];
    views: number;
    downloads: number;
    featured: boolean;
};

type Props = {
    designs: GalleryDesign[];
};

export default function Gallery({ designs }: Props) {
    const [wishlistedIds, setWishlistedIds] = useState<number[]>([]);

    useEffect(() => {
        // Check wishlist status for all designs
        const checkWishlists = async () => {
            const statuses = await Promise.all(
                designs.map(async (design) => {
                    try {
                        const response = await axios.get('/wishlist/check', {
                            params: {
                                wishlistable_id: design.id,
                                wishlistable_type: 'App\\Models\\InteriorDesign'
                            }
                        });
                        return response.data.exists ? design.id : null;
                    } catch (e) {
                        return null;
                    }
                })
            );
            setWishlistedIds(statuses.filter(id => id !== null) as number[]);
        };

        if (designs.length > 0) {
            checkWishlists();
        }
    }, [designs]);

    const toggleWishlist = async (e: React.MouseEvent, designId: number) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
            const response = await axios.post('/wishlist/toggle', {
                wishlistable_id: designId,
                wishlistable_type: 'App\\Models\\InteriorDesign'
            });
            
            if (response.data.status === 'added') {
                setWishlistedIds(prev => [...prev, designId]);
            } else {
                setWishlistedIds(prev => prev.filter(id => id !== designId));
            }
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gallery" />

            <div className="min-h-screen bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    <div className="mb-8 space-y-1">
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Gallery</h1>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Explore the latest interiors curated by the admin team.
                        </p>
                    </div>

                    {designs.length === 0 ? (
                        <div className="rounded-2xl border border-zinc-200 bg-white/70 p-8 text-center text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
                            Interior designs are still being uploaded — check back soon for inspiration.
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {designs.map((design) => (
                                <Link
                                    key={design.id}
                                    href={`/gallery/${design.id}`}
                                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900/60"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40">
                                        {design.cover_image_url ? (
                                            <img
                                                src={design.cover_image_url}
                                                alt={design.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full flex-col items-center justify-center gap-1 text-orange-500">
                                                <Image className="h-12 w-12 text-orange-500" />
                                                <span className="text-xs font-semibold tracking-wide">Interior preview</span>
                                            </div>
                                        )}
                                        {design.featured && (
                                            <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                                                <Star className="h-3 w-3 fill-current" />
                                                Featured
                                            </div>
                                        )}
                                        
                                        {/* Wishlist Button */}
                                        <button
                                            onClick={(e) => toggleWishlist(e, design.id)}
                                            className={`absolute right-3 top-3 p-2 rounded-full backdrop-blur-md transition-all ${
                                                wishlistedIds.includes(design.id)
                                                    ? 'bg-red-500 text-white shadow-lg'
                                                    : 'bg-white/80 text-zinc-400 hover:text-red-500 dark:bg-zinc-900/80'
                                            }`}
                                        >
                                            <Heart className={`h-4 w-4 ${wishlistedIds.includes(design.id) ? 'fill-current' : ''}`} />
                                        </button>

                                        {/* Quick Stats Overlay */}
                                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                    <Eye className="h-3 w-3" />
                                                    {design.views}
                                                </span>
                                                <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                    <Download className="h-3 w-3" />
                                                    {design.downloads}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-1 flex-col gap-3 p-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-zinc-900 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-400">{design.name}</h3>
                                                {design.room_type && (
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{design.room_type}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                            {design.style && (
                                                <span className="rounded-full border border-zinc-200 px-2 py-1 text-[11px] dark:border-zinc-700">
                                                    {design.style}
                                                </span>
                                            )}
                                        </div>

                                        <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">
                                            {design.description || 'Explore this beautifully curated interior design.'}
                                        </p>

                                        {design.gallery_images.length > 0 && (
                                            <div className="grid grid-cols-3 gap-2">
                                                {design.gallery_images.map((image) => (
                                                    <img
                                                        key={image.id}
                                                        src={image.url}
                                                        alt={image.caption || design.name}
                                                        className="h-12 w-full rounded-xl object-cover"
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400">Click to view details</span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-semibold text-orange-700 transition-colors group-hover:bg-orange-600 group-hover:text-white dark:bg-orange-900/30 dark:text-orange-400 dark:group-hover:bg-orange-600 dark:group-hover:text-white">
                                                View Details
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

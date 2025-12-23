import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { Bookmark, Building2, FolderOpen, Info, Layers, Layout, PenTool, Ruler, Sofa, Tag, Trash2, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Wishlist', href: '/wishlist' },
];

interface WishlistItem {
    id: number;
    wishlistable_id: number;
    wishlistable_type: string;
    item: {
        id: number;
        name: string;
        description: string | null;
        thumbnail: string | null;
        cover_image: string | null;
        image: string | null;
        category?: string;
        room?: string;
        type?: string;
        price?: number;
        material?: string;
        color?: string;
        brand?: string;
        unit?: string;
        dimensions?: { width?: number; height?: number; depth?: number } | null;
        updated_at: string;
    };
    created_at: string;
}

interface Props {
    wishlistItems: WishlistItem[];
}

export default function Wishlist({ wishlistItems }: Props) {
    const { showToast } = useToast();
    const [removingId, setRemovingId] = useState<number | null>(null);
    const [localItems, setLocalItems] = useState<WishlistItem[]>(wishlistItems);
    const [activeTab, setActiveTab] = useState<'all' | 'designs' | 'furniture' | 'materials'>('all');
    const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleRemove = async (item: WishlistItem) => {
        setRemovingId(item.id);
        try {
            await axios.post('/api/wishlist/toggle', {
                wishlistable_id: item.wishlistable_id,
                wishlistable_type: item.wishlistable_type,
            });
            
            // Remove from local state
            setLocalItems(prev => prev.filter(i => i.id !== item.id));
            showToast(`${item.item?.name || 'Item'} removed from wishlist`, 'success');
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
            showToast('Failed to remove item', 'error');
        } finally {
            setRemovingId(null);
        }
    };

    // Categorize items - use localItems for live updates
    const furnitureItems = localItems.filter(item => item.wishlistable_type.includes('Furniture'));
    const materialItems = localItems.filter(item => item.wishlistable_type.includes('Material'));
    const designItems = localItems.filter(item => 
        !item.wishlistable_type.includes('Furniture') && !item.wishlistable_type.includes('Material')
    );

    const displayItems = activeTab === 'all' 
        ? localItems 
        : activeTab === 'furniture' 
            ? furnitureItems 
            : activeTab === 'materials'
                ? materialItems
                : designItems;

    const getImageUrl = (item: WishlistItem['item']) => {
        const img = item.thumbnail || item.cover_image || item.image;
        if (!img) return null;
        if (img.startsWith('http') || img.startsWith('/storage')) return img;
        return `/storage/${img}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Wishlist" />
            
            <div className="min-h-screen bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white flex items-center gap-3">
                                <Bookmark className="h-8 w-8 text-purple-500" />
                                My Saved Items
                            </h1>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                                {localItems.length} item{localItems.length !== 1 ? 's' : ''} saved for your designs
                            </p>
                        </div>

                        {/* Tab Filter */}
                        <div className="flex flex-wrap bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === 'all' 
                                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                            >
                                All ({localItems.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('furniture')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === 'furniture' 
                                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                            >
                                <Sofa className="h-4 w-4 inline mr-1" />
                                Furniture ({furnitureItems.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('materials')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === 'materials' 
                                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                            >
                                <Layers className="h-4 w-4 inline mr-1" />
                                Materials ({materialItems.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('designs')}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === 'designs' 
                                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                }`}
                            >
                                <Layout className="h-4 w-4 inline mr-1" />
                                Designs ({designItems.length})
                            </button>
                        </div>
                    </div>

                    {displayItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800">
                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                                <Bookmark className="w-8 h-8 text-zinc-400" />
                            </div>
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-white">
                                {activeTab === 'all' ? 'Your wishlist is empty' : `No ${activeTab} saved yet`}
                            </h3>
                            <p className="text-zinc-500 dark:text-zinc-400 mt-1 mb-6">
                                Start saving items to see them here
                            </p>
                            <div className="flex gap-4">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 transition-colors"
                                >
                                    <Sofa className="w-4 h-4" />
                                    Browse Furniture
                                </Link>
                                <Link
                                    href="/floor-plan"
                                    className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
                                >
                                    <Layout className="w-4 h-4" />
                                    Floor Plans
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Furniture Section - Spacious Design Grid */}
                            {(activeTab === 'all' || activeTab === 'furniture') && furnitureItems.length > 0 && (
                                <div className="mb-12">
                                    {activeTab === 'all' && (
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Sofa className="h-5 w-5 text-purple-500" />
                                            Saved Furniture & Materials
                                            <span className="text-sm font-normal text-zinc-500">({furnitureItems.length})</span>
                                        </h2>
                                    )}
                                    
                                    {/* Spacious Furniture Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {furnitureItems.map((wishItem) => (
                                            <div 
                                                key={wishItem.id}
                                                onClick={() => setSelectedItem(wishItem)}
                                                className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                            >
                                                {/* Large Image */}
                                                <div className="relative aspect-square bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 overflow-hidden">
                                                    {getImageUrl(wishItem.item) ? (
                                                        <img 
                                                            src={getImageUrl(wishItem.item)!} 
                                                            alt={wishItem.item.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Sofa className="w-16 h-16 text-purple-300 dark:text-purple-700" />
                                                        </div>
                                                    )}
                                                    
                                                    {/* View Details Overlay */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                        <span className="opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-zinc-900/90 px-4 py-2 rounded-lg text-sm font-medium text-zinc-900 dark:text-white transition-opacity">
                                                            View Details
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRemove(wishItem); }}
                                                        disabled={removingId === wishItem.id}
                                                        className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-zinc-900/90 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shadow-sm"
                                                        title="Remove from saved"
                                                    >
                                                        <Trash2 className={`w-4 h-4 ${removingId === wishItem.id ? 'animate-spin' : ''}`} />
                                                    </button>

                                                    {/* Category Badge */}
                                                    {wishItem.item.category && (
                                                        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-purple-500 text-white text-xs font-semibold capitalize">
                                                            {wishItem.item.category}
                                                        </div>
                                                    )}

                                                    {/* Hover Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="absolute bottom-4 left-4 right-4">
                                                            <Link
                                                                href="/interior-design"
                                                                className="block w-full rounded-lg bg-white/95 py-2 text-center text-sm font-medium text-zinc-900 hover:bg-white transition-colors"
                                                            >
                                                                Use in Design
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="p-4">
                                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate mb-1">
                                                        {wishItem.item.name}
                                                    </h3>
                                                    
                                                    {/* Details Row */}
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {wishItem.item.room && (
                                                            <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 capitalize">
                                                                {wishItem.item.room}
                                                            </span>
                                                        )}
                                                        {wishItem.item.material && (
                                                            <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 capitalize">
                                                                {wishItem.item.material}
                                                            </span>
                                                        )}
                                                        {wishItem.item.color && (
                                                            <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                                                                <span 
                                                                    className="w-3 h-3 rounded-full border border-zinc-300" 
                                                                    style={{ backgroundColor: wishItem.item.color }}
                                                                />
                                                                {wishItem.item.color}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Dimensions */}
                                                    {wishItem.item.dimensions && (
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                                                            📐 {wishItem.item.dimensions.width}W × {wishItem.item.dimensions.height}H × {wishItem.item.dimensions.depth}D cm
                                                        </p>
                                                    )}

                                                    {/* Price & Saved Date */}
                                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                                        {wishItem.item.price ? (
                                                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                                                Rs. {wishItem.item.price.toLocaleString()}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-zinc-400">No price</span>
                                                        )}
                                                        <span className="text-xs text-zinc-400">
                                                            Saved {formatDate(wishItem.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Materials Section */}
                            {(activeTab === 'all' || activeTab === 'materials') && materialItems.length > 0 && (
                                <div className="mb-12">
                                    {activeTab === 'all' && (
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Layers className="h-5 w-5 text-blue-500" />
                                            Saved Materials
                                            <span className="text-sm font-normal text-zinc-500">({materialItems.length})</span>
                                        </h2>
                                    )}
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {materialItems.map((wishItem) => (
                                            <div 
                                                key={wishItem.id}
                                                onClick={() => setSelectedItem(wishItem)}
                                                className="group bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                            >
                                                {/* Image */}
                                                <div className="relative aspect-square bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 overflow-hidden">
                                                    {getImageUrl(wishItem.item) ? (
                                                        <img 
                                                            src={getImageUrl(wishItem.item)!} 
                                                            alt={wishItem.item.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Layers className="w-16 h-16 text-blue-300 dark:text-blue-700" />
                                                        </div>
                                                    )}
                                                    
                                                    {/* View Details Overlay */}
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                        <span className="opacity-0 group-hover:opacity-100 bg-white/90 dark:bg-zinc-900/90 px-4 py-2 rounded-lg text-sm font-medium text-zinc-900 dark:text-white transition-opacity">
                                                            View Details
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Remove Button */}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRemove(wishItem); }}
                                                        disabled={removingId === wishItem.id}
                                                        className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-zinc-900/90 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shadow-sm"
                                                        title="Remove from saved"
                                                    >
                                                        <Trash2 className={`w-4 h-4 ${removingId === wishItem.id ? 'animate-spin' : ''}`} />
                                                    </button>

                                                    {/* Type Badge */}
                                                    {wishItem.item.type && (
                                                        <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold capitalize">
                                                            {wishItem.item.type}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="p-4">
                                                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate mb-1">
                                                        {wishItem.item.name}
                                                    </h3>
                                                    
                                                    {/* Details Row */}
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {wishItem.item.category && (
                                                            <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 capitalize">
                                                                {wishItem.item.category}
                                                            </span>
                                                        )}
                                                        {wishItem.item.brand && (
                                                            <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400">
                                                                {wishItem.item.brand}
                                                            </span>
                                                        )}
                                                        {wishItem.item.color && (
                                                            <span className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-600 dark:text-zinc-400 flex items-center gap-1">
                                                                <span 
                                                                    className="w-3 h-3 rounded-full border border-zinc-300" 
                                                                    style={{ backgroundColor: wishItem.item.color }}
                                                                />
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Price & Saved Date */}
                                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                                        {wishItem.item.price ? (
                                                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                                Rs. {wishItem.item.price.toLocaleString()}{wishItem.item.unit ? `/${wishItem.item.unit}` : ''}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-zinc-400">Contact for price</span>
                                                        )}
                                                        <span className="text-xs text-zinc-400">
                                                            Saved {formatDate(wishItem.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Designs Section */}
                            {(activeTab === 'all' || activeTab === 'designs') && designItems.length > 0 && (
                                <div>
                                    {activeTab === 'all' && (
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
                                            <Layout className="h-5 w-5 text-orange-500" />
                                            Saved Designs
                                            <span className="text-sm font-normal text-zinc-500">({designItems.length})</span>
                                        </h2>
                                    )}
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {designItems.map((wishItem) => {
                                            const isFloorPlan = wishItem.wishlistable_type.includes('FloorPlanProject');
                                            const isHomeDesign = wishItem.wishlistable_type.includes('HomeDesign');
                                            
                                            let editUrl = '';
                                            let typeLabel = '';
                                            let typeColor = '';
                                            let Icon = Layout;

                                            if (isFloorPlan) {
                                                editUrl = `/floor-plan/${wishItem.wishlistable_id}`;
                                                typeLabel = 'Floor Plan';
                                                typeColor = 'bg-orange-500 text-white';
                                                Icon = Layout;
                                            } else if (isHomeDesign) {
                                                editUrl = `/design-home/${wishItem.wishlistable_id}`;
                                                typeLabel = 'Home Design';
                                                typeColor = 'bg-blue-500 text-white';
                                                Icon = Building2;
                                            } else {
                                                editUrl = `/interior-design/${wishItem.wishlistable_id}`;
                                                typeLabel = 'Interior';
                                                typeColor = 'bg-purple-500 text-white';
                                                Icon = PenTool;
                                            }
                                            
                                            return (
                                                <div 
                                                    key={wishItem.id}
                                                    className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl transition-all duration-300"
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                                                        {getImageUrl(wishItem.item) ? (
                                                            <img 
                                                                src={getImageUrl(wishItem.item)!} 
                                                                alt={wishItem.item.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Icon className="w-12 h-12 text-zinc-300" />
                                                            </div>
                                                        )}
                                                        <div className="absolute top-3 left-3">
                                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${typeColor}`}>
                                                                {typeLabel}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemove(wishItem)}
                                                            disabled={removingId === wishItem.id}
                                                            className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-zinc-900/90 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors shadow-sm"
                                                            title="Remove from wishlist"
                                                        >
                                                            <Trash2 className={`w-4 h-4 ${removingId === wishItem.id ? 'animate-spin' : ''}`} />
                                                        </button>
                                                    </div>

                                                    {/* Content */}
                                                    <div className="p-5">
                                                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white truncate mb-1">
                                                            {wishItem.item.name}
                                                        </h3>
                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 h-10">
                                                            {wishItem.item.description || 'No description provided.'}
                                                        </p>
                                                        
                                                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                                            <span className="text-xs text-zinc-400">
                                                                Saved {formatDate(wishItem.created_at)}
                                                            </span>
                                                            <Link
                                                                href={editUrl}
                                                                className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                                                            >
                                                                <FolderOpen className="w-4 h-4" />
                                                                Open Project
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-zinc-800/90 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col md:flex-row max-h-[90vh] overflow-auto">
                            {/* Image Section */}
                            <div className="md:w-1/2 aspect-square md:aspect-auto bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                                {getImageUrl(selectedItem.item) ? (
                                    <img 
                                        src={getImageUrl(selectedItem.item)!} 
                                        alt={selectedItem.item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full min-h-[300px] flex items-center justify-center">
                                        {selectedItem.wishlistable_type.includes('Furniture') ? (
                                            <Sofa className="w-24 h-24 text-purple-300 dark:text-purple-700" />
                                        ) : (
                                            <Layers className="w-24 h-24 text-blue-300 dark:text-blue-700" />
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Details Section */}
                            <div className="md:w-1/2 p-6 overflow-y-auto">
                                {/* Type Badge */}
                                <div className="mb-4">
                                    {selectedItem.wishlistable_type.includes('Furniture') ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold">
                                            <Sofa className="w-3 h-3" />
                                            Furniture
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                                            <Layers className="w-3 h-3" />
                                            Material
                                        </span>
                                    )}
                                </div>

                                {/* Name */}
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                                    {selectedItem.item.name}
                                </h2>

                                {/* Description */}
                                {selectedItem.item.description && (
                                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                                        {selectedItem.item.description}
                                    </p>
                                )}

                                {/* Price */}
                                {selectedItem.item.price && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl">
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">Price</p>
                                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                            Rs. {selectedItem.item.price.toLocaleString()}
                                            {selectedItem.item.unit && (
                                                <span className="text-base font-normal text-zinc-500">/{selectedItem.item.unit}</span>
                                            )}
                                        </p>
                                    </div>
                                )}

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    {selectedItem.item.category && (
                                        <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                            <Tag className="w-5 h-5 text-zinc-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Category</p>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{selectedItem.item.category}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedItem.item.type && (
                                        <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                            <Info className="w-5 h-5 text-zinc-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Type</p>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{selectedItem.item.type}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedItem.item.room && (
                                        <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                            <Layout className="w-5 h-5 text-zinc-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Room</p>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{selectedItem.item.room}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedItem.item.material && (
                                        <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                            <Layers className="w-5 h-5 text-zinc-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Material</p>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{selectedItem.item.material}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedItem.item.brand && (
                                        <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                            <Tag className="w-5 h-5 text-zinc-400 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Brand</p>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedItem.item.brand}</p>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedItem.item.color && (
                                        <div className="flex items-start gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                            <div 
                                                className="w-5 h-5 rounded-full border-2 border-zinc-300 dark:border-zinc-600 mt-0.5"
                                                style={{ backgroundColor: selectedItem.item.color }}
                                            />
                                            <div>
                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Color</p>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedItem.item.color}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Dimensions */}
                                {selectedItem.item.dimensions && (
                                    <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Ruler className="w-5 h-5 text-zinc-400" />
                                            <p className="text-sm font-medium text-zinc-900 dark:text-white">Dimensions</p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            {selectedItem.item.dimensions.width && (
                                                <div className="text-center p-2 bg-white dark:bg-zinc-900 rounded-lg">
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Width</p>
                                                    <p className="text-lg font-bold text-zinc-900 dark:text-white">{selectedItem.item.dimensions.width}<span className="text-xs text-zinc-400 ml-1">cm</span></p>
                                                </div>
                                            )}
                                            {selectedItem.item.dimensions.height && (
                                                <div className="text-center p-2 bg-white dark:bg-zinc-900 rounded-lg">
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Height</p>
                                                    <p className="text-lg font-bold text-zinc-900 dark:text-white">{selectedItem.item.dimensions.height}<span className="text-xs text-zinc-400 ml-1">cm</span></p>
                                                </div>
                                            )}
                                            {selectedItem.item.dimensions.depth && (
                                                <div className="text-center p-2 bg-white dark:bg-zinc-900 rounded-lg">
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Depth</p>
                                                    <p className="text-lg font-bold text-zinc-900 dark:text-white">{selectedItem.item.dimensions.depth}<span className="text-xs text-zinc-400 ml-1">cm</span></p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Saved Date */}
                                <p className="text-xs text-zinc-400 mb-6">
                                    Saved on {formatDate(selectedItem.created_at)}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    {selectedItem.wishlistable_type.includes('Furniture') && (
                                        <Link
                                            href="/interior-design"
                                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-600 transition-colors"
                                        >
                                            <PenTool className="w-4 h-4" />
                                            Use in Design
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            handleRemove(selectedItem);
                                            setSelectedItem(null);
                                        }}
                                        className={`inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/30 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors ${!selectedItem.wishlistable_type.includes('Furniture') ? 'flex-1' : ''}`}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Bookmark, Check, Filter, RefreshCw, Ruler, Search, ShoppingCart, Sofa, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Furniture Library', href: '/library/furniture' },
];

interface Furniture {
    id: number;
    name: string;
    category: string;
    room: string;
    price: number;
    image?: string;
    image_url?: string;
    description?: string;
    material?: string;
    color?: string;
    stock: number;
    availability?: string;
    is_featured: boolean;
    dimensions?: {
        width?: number;
        height?: number;
        depth?: number;
    };
}

interface Props {
    furniture: Furniture[];
    categories: string[];
    rooms: string[];
}

export default function FurnitureLibrary({ furniture, categories, rooms }: Props) {
    const { showToast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [savedFurnitureIds, setSavedFurnitureIds] = useState<number[]>([]);
    const [savingFurnitureId, setSavingFurnitureId] = useState<number | null>(null);
    const [cartFurnitureIds, setCartFurnitureIds] = useState<number[]>([]);
    const [addingToCartId, setAddingToCartId] = useState<number | null>(null);
    const [selectedFurniture, setSelectedFurniture] = useState<Furniture | null>(null);

    const allCategories = ['All', ...categories];

    // Get image URL - handle both direct URLs and storage paths
    const getImageUrl = (item: Furniture): string | null => {
        if (!item.image) return null;
        // If it's already a full URL or starts with /storage, use as is
        if (item.image.startsWith('http') || item.image.startsWith('/storage')) {
            return item.image;
        }
        // Otherwise prepend /storage/
        return `/storage/${item.image}`;
    };

    // Load saved furniture IDs on mount
    useEffect(() => {
        const loadSavedFurniture = async () => {
            try {
                const response = await axios.get('/api/wishlist/furniture-ids');
                setSavedFurnitureIds(response.data.ids || []);
            } catch (error) {
                console.error('Failed to load saved furniture:', error);
            }
        };
        const loadCartFurniture = async () => {
            try {
                const response = await axios.get('/api/cart/furniture-ids');
                setCartFurnitureIds(response.data.ids || []);
            } catch (error) {
                console.error('Failed to load cart furniture:', error);
            }
        };
        loadSavedFurniture();
        loadCartFurniture();
    }, []);

    // Toggle save furniture
    const toggleSaveFurniture = async (e: React.MouseEvent, furnitureId: number, furnitureName: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        setSavingFurnitureId(furnitureId);
        try {
            const response = await axios.post('/api/wishlist/toggle', {
                wishlistable_id: furnitureId,
                wishlistable_type: 'App\\Models\\Furniture'
            });
            
            if (response.data.saved) {
                setSavedFurnitureIds(prev => [...prev, furnitureId]);
                showToast(`${furnitureName} added to wishlist`, 'success');
            } else {
                setSavedFurnitureIds(prev => prev.filter(id => id !== furnitureId));
                showToast(`${furnitureName} removed from wishlist`, 'info');
            }
        } catch (error) {
            console.error('Failed to toggle save:', error);
            showToast('Failed to update wishlist', 'error');
        } finally {
            setSavingFurnitureId(null);
        }
    };

    // Add to cart
    const addToCart = async (e: React.MouseEvent, furnitureId: number, furnitureName: string, stock: number | null | undefined, availability?: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Check if out of stock - availability is computed from backend
        if (availability === 'Out of Stock' || (stock !== null && stock !== undefined && stock <= 0)) {
            showToast('This item is out of stock', 'error');
            return;
        }
        
        if (cartFurnitureIds.includes(furnitureId)) {
            // Already in cart, remove it
            setAddingToCartId(furnitureId);
            try {
                await axios.post('/api/cart/remove', {
                    cartable_id: furnitureId,
                    cartable_type: 'App\\Models\\Furniture'
                });
                setCartFurnitureIds(prev => prev.filter(id => id !== furnitureId));
                showToast(`${furnitureName} removed from cart`, 'info');
            } catch (error) {
                console.error('Failed to remove from cart:', error);
                showToast('Failed to remove from cart', 'error');
            } finally {
                setAddingToCartId(null);
            }
        } else {
            // Add to cart
            setAddingToCartId(furnitureId);
            try {
                await axios.post('/api/cart/add', {
                    cartable_id: furnitureId,
                    cartable_type: 'App\\Models\\Furniture'
                });
                setCartFurnitureIds(prev => [...prev, furnitureId]);
                showToast(`${furnitureName} added to cart`, 'success');
            } catch (error: any) {
                console.error('Failed to add to cart:', error);
                const message = error.response?.data?.message || 'Failed to add to cart';
                showToast(message, 'error');
            } finally {
                setAddingToCartId(null);
            }
        }
    };

    const filteredFurniture = furniture.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Furniture Library" />
            
            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-purple-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5">
                                <Sofa className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                    Furniture Library
                                </h1>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                    Browse furniture & create your design
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 dark:bg-purple-950/30">
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                {filteredFurniture.length} Items
                            </span>
                        </div>
                    </div>

                    {/* Search and Filter */}
                    <div className="mb-8 space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                                <input
                                    type="text"
                                    placeholder="Search furniture..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                />
                            </div>
                            <button className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 font-medium dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                <Filter className="h-5 w-5" />
                                Filter
                            </button>
                        </div>

                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {allCategories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                                        selectedCategory === category
                                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Furniture Grid */}
                    {filteredFurniture.length === 0 ? (
                        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-900/50">
                            <Sofa className="h-12 w-12 text-zinc-400 mb-4" />
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                {searchQuery ? 'No furniture found' : 'No furniture available'}
                            </h3>
                            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                                {searchQuery ? 'Try a different search term' : 'Check back later for new items'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredFurniture.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedFurniture(item)}
                                    className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 cursor-pointer"
                                >
                                    {/* Save/Bookmark Button */}
                                    <button
                                        onClick={(e) => toggleSaveFurniture(e, item.id, item.name)}
                                        disabled={savingFurnitureId === item.id}
                                        className={`absolute top-3 right-3 z-10 rounded-full p-2 shadow-sm transition-colors ${
                                            savedFurnitureIds.includes(item.id)
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-white/90 dark:bg-zinc-800/90 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                                        }`}
                                        title={savedFurnitureIds.includes(item.id) ? 'Remove from saved' : 'Save for later'}
                                    >
                                        {savingFurnitureId === item.id ? (
                                            <RefreshCw className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
                                        ) : (
                                            <Bookmark className={`h-4 w-4 ${savedFurnitureIds.includes(item.id) ? 'fill-current' : 'text-purple-600 dark:text-purple-400'}`} />
                                        )}
                                    </button>

                                    {/* Image */}
                                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                                        {getImageUrl(item) ? (
                                            <img
                                                src={getImageUrl(item)!}
                                                alt={item.name}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Sofa className="h-16 w-16 text-purple-300 dark:text-purple-700" />
                                            </div>
                                        )}
                                        {item.is_featured && (
                                            <div className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2.5 py-1 text-xs font-semibold text-white flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-white" />
                                                Featured
                                            </div>
                                        )}
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                                            <div className="absolute bottom-3 left-3 right-3">
                                                <span className="block w-full rounded-lg bg-white/90 py-2 text-center text-sm font-medium text-zinc-900 backdrop-blur-sm">
                                                    View Details
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                                            {item.name}
                                        </h3>
                                        <div className="mt-1 flex items-center justify-between">
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                                                {item.category} • {item.room}
                                            </span>
                                        </div>
                                        
                                        {/* Stock Info - computed from backend */}
                                        {item.availability === 'Out of Stock' ? (
                                            <p className="mt-2 text-xs font-medium text-red-500">
                                                Out of Stock
                                            </p>
                                        ) : item.availability === 'Limited Stock' ? (
                                            <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                                                {item.stock !== null && item.stock !== undefined 
                                                    ? `Only ${item.stock} left in stock` 
                                                    : 'Limited Stock'}
                                            </p>
                                        ) : null}

                                        {/* Price and Cart Button */}
                                        <div className="mt-3 flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                                            <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                                Rs. {item.price?.toLocaleString() || 0}
                                            </span>
                                            {item.availability === 'Out of Stock' ? (
                                                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400 cursor-not-allowed">
                                                    Out of Stock
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={(e) => addToCart(e, item.id, item.name, item.stock, item.availability)}
                                                    disabled={addingToCartId === item.id}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                        cartFurnitureIds.includes(item.id)
                                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                                            : item.availability === 'Made to Order'
                                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                            : 'bg-purple-500 text-white hover:bg-purple-600'
                                                    }`}
                                                >
                                                    {addingToCartId === item.id ? (
                                                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                                    ) : cartFurnitureIds.includes(item.id) ? (
                                                        <Check className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <ShoppingCart className="h-3.5 w-3.5" />
                                                    )}
                                                    {cartFurnitureIds.includes(item.id) ? 'In Cart' : item.availability === 'Made to Order' ? 'Pre-Order' : 'Add'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Furniture Detail Modal */}
                {selectedFurniture && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                        onClick={() => setSelectedFurniture(null)}
                    >
                        <div 
                            className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Large Image Preview */}
                            <div className="relative h-64 overflow-hidden rounded-t-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                                {getImageUrl(selectedFurniture) ? (
                                    <img 
                                        src={getImageUrl(selectedFurniture)!}
                                        alt={selectedFurniture.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <Sofa className="h-24 w-24 text-purple-300 dark:text-purple-700" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
                                
                                {/* Close button */}
                                <button
                                    onClick={() => setSelectedFurniture(null)}
                                    className="absolute top-4 left-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                {/* Featured badge */}
                                {selectedFurniture.is_featured && (
                                    <div className="absolute top-4 right-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-white" />
                                        Featured
                                    </div>
                                )}

                                {/* Save button */}
                                <button
                                    onClick={(e) => toggleSaveFurniture(e, selectedFurniture.id, selectedFurniture.name)}
                                    disabled={savingFurnitureId === selectedFurniture.id}
                                    className={`absolute bottom-4 right-4 rounded-full p-3 shadow-lg transition-colors ${
                                        savedFurnitureIds.includes(selectedFurniture.id)
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-white/90 dark:bg-zinc-800/90 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                                    }`}
                                >
                                    {savingFurnitureId === selectedFurniture.id ? (
                                        <RefreshCw className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Bookmark className={`h-5 w-5 ${savedFurnitureIds.includes(selectedFurniture.id) ? 'fill-current' : 'text-purple-600 dark:text-purple-400'}`} />
                                    )}
                                </button>
                            </div>

                            <div className="p-6">
                                {/* Title and Category */}
                                <div className="mb-4">
                                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                                        {selectedFurniture.name}
                                    </h2>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
                                            {selectedFurniture.category}
                                        </span>
                                        <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700 dark:bg-pink-950/30 dark:text-pink-300">
                                            {selectedFurniture.room}
                                        </span>
                                    </div>
                                </div>

                                {/* Description */}
                                {selectedFurniture.description && (
                                    <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                                        {selectedFurniture.description}
                                    </p>
                                )}

                                {/* Price */}
                                <div className="mb-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-4 dark:from-purple-950/30 dark:to-pink-950/30 dark:border-purple-800">
                                    <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Price</p>
                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                        Rs. {selectedFurniture.price?.toLocaleString() || 0}
                                    </p>
                                </div>

                                {/* Specifications Grid */}
                                <div className="mb-4 grid grid-cols-2 gap-3">
                                    {/* Dimensions */}
                                    {selectedFurniture.dimensions && (selectedFurniture.dimensions.width || selectedFurniture.dimensions.height || selectedFurniture.dimensions.depth) && (
                                        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                                            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                                                <Ruler className="h-4 w-4" />
                                                <span className="text-xs font-medium">Dimensions</span>
                                            </div>
                                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                {selectedFurniture.dimensions.width && `W: ${selectedFurniture.dimensions.width}cm`}
                                                {selectedFurniture.dimensions.height && ` × H: ${selectedFurniture.dimensions.height}cm`}
                                                {selectedFurniture.dimensions.depth && ` × D: ${selectedFurniture.dimensions.depth}cm`}
                                            </p>
                                        </div>
                                    )}

                                    {/* Material */}
                                    {selectedFurniture.material && (
                                        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Material</p>
                                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                {selectedFurniture.material}
                                            </p>
                                        </div>
                                    )}

                                    {/* Color */}
                                    {selectedFurniture.color && (
                                        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                                            <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Color</p>
                                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                {selectedFurniture.color}
                                            </p>
                                        </div>
                                    )}

                                    {/* Availability */}
                                    <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">Availability</p>
                                        <p className={`text-sm font-semibold ${
                                            selectedFurniture.availability === 'Out of Stock' 
                                                ? 'text-red-600 dark:text-red-400'
                                                : selectedFurniture.availability === 'Limited Stock'
                                                ? 'text-orange-600 dark:text-orange-400'
                                                : 'text-green-600 dark:text-green-400'
                                        }`}>
                                            {selectedFurniture.availability || 'In Stock'}
                                            {selectedFurniture.stock > 0 && selectedFurniture.stock <= 10 && ` (${selectedFurniture.stock} left)`}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    {selectedFurniture.availability === 'Out of Stock' ? (
                                        <button 
                                            disabled
                                            className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400 cursor-not-allowed"
                                        >
                                            Out of Stock
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={(e) => addToCart(e, selectedFurniture.id, selectedFurniture.name, selectedFurniture.stock, selectedFurniture.availability)}
                                            disabled={addingToCartId === selectedFurniture.id}
                                            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                                                cartFurnitureIds.includes(selectedFurniture.id)
                                                    ? 'bg-green-500 text-white hover:bg-green-600'
                                                    : selectedFurniture.availability === 'Made to Order'
                                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg shadow-purple-500/30'
                                            }`}
                                        >
                                            {addingToCartId === selectedFurniture.id ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : cartFurnitureIds.includes(selectedFurniture.id) ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <ShoppingCart className="h-4 w-4" />
                                            )}
                                            {cartFurnitureIds.includes(selectedFurniture.id) 
                                                ? 'In Cart' 
                                                : selectedFurniture.availability === 'Made to Order' 
                                                ? 'Pre-Order Now' 
                                                : 'Add to Cart'}
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setSelectedFurniture(null)}
                                        className="rounded-xl border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

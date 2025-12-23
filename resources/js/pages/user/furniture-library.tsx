import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Armchair, Bookmark, Check, Filter, Plus, RefreshCw, Search, ShoppingCart, Star } from 'lucide-react';
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

    const allCategories = ['All', ...categories];

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
    const addToCart = async (e: React.MouseEvent, furnitureId: number, furnitureName: string, stock: number, availability?: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Check if out of stock - only block if availability is explicitly "Out of Stock"
        // "In Stock" and "Limited Stock" should always allow adding to cart
        if (availability === 'Out of Stock') {
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
            
            <div className="min-h-screen bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                            Furniture Library
                        </h1>
                        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                            Explore and add furniture to your designs
                        </p>
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
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <button className="flex items-center gap-2 rounded-lg border border-zinc-300 px-4 py-2.5 font-medium dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">
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
                                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                                        selectedCategory === category
                                            ? 'bg-orange-500 text-white shadow-lg'
                                            : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Furniture Grid */}
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {filteredFurniture.length > 0 ? (
                            filteredFurniture.map((item) => (
                                <div
                                    key={item.id}
                                    className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40">
                                        {item.image ? (
                                            <img 
                                                src={`/storage/${item.image}`} 
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Armchair className="h-16 w-16 text-blue-400 dark:text-blue-600" />
                                            </div>
                                        )}

                                        {/* Save/Bookmark Button */}
                                        <button
                                            onClick={(e) => toggleSaveFurniture(e, item.id, item.name)}
                                            disabled={savingFurnitureId === item.id}
                                            className={`absolute top-2 right-2 z-10 rounded-full p-2 shadow-sm transition-colors ${
                                                savedFurnitureIds.includes(item.id)
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-white/90 dark:bg-zinc-800/90 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                                            }`}
                                            title={savedFurnitureIds.includes(item.id) ? 'Remove from saved' : 'Save for later'}
                                        >
                                            {savingFurnitureId === item.id ? (
                                                <RefreshCw className="h-4 w-4 animate-spin text-orange-600 dark:text-orange-400" />
                                            ) : (
                                                <Bookmark className={`h-4 w-4 ${savedFurnitureIds.includes(item.id) ? 'fill-current' : 'text-orange-600 dark:text-orange-400'}`} />
                                            )}
                                        </button>

                                        {/* Featured Badge */}
                                        {item.is_featured && (
                                            <div className="absolute top-2 left-2">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500 px-2 py-1 text-xs font-medium text-white">
                                                    <Star className="h-3 w-3 fill-white" />
                                                    Featured
                                                </span>
                                            </div>
                                        )}
                                        
                                        {/* Hover Button */}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                            <button className="p-3 rounded-lg bg-white hover:bg-orange-50 transition-colors">
                                                <Plus className="h-5 w-5 text-orange-600" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 space-y-3">
                                        <div>
                                            <h3 className="font-semibold text-zinc-900 dark:text-white">
                                                {item.name}
                                            </h3>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                {item.category} • {item.room}
                                            </p>
                                        </div>

                                        {/* Details */}
                                        {item.description && (
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                                {item.description}
                                            </p>
                                        )}

                                        {/* Stock Info */}
                                        {item.availability === 'Made to Order' ? (
                                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                                Made to order • 2-4 weeks delivery
                                            </p>
                                        ) : item.availability === 'Limited Stock' ? (
                                            <p className="text-xs text-orange-600 dark:text-orange-400">
                                                Limited Stock
                                            </p>
                                        ) : item.availability === 'In Stock' && item.stock > 0 && item.stock <= 5 ? (
                                            <p className="text-xs text-orange-600 dark:text-orange-400">
                                                Only {item.stock} left in stock
                                            </p>
                                        ) : null}

                                        {/* Price and Cart Button */}
                                        <div className="flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-zinc-800">
                                            <span className="font-bold text-orange-600 dark:text-orange-400">
                                                NPR {item.price?.toLocaleString() || 0}
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
                                                            : 'bg-orange-500 text-white hover:bg-orange-600'
                                                    }`}
                                                >
                                                    {addingToCartId === item.id ? (
                                                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                                    ) : cartFurnitureIds.includes(item.id) ? (
                                                        <Check className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <ShoppingCart className="h-3.5 w-3.5" />
                                                    )}
                                                    {cartFurnitureIds.includes(item.id) ? 'In Cart' : item.availability === 'Made to Order' ? 'Pre-Order' : 'Add to Cart'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center">
                                <Armchair className="mx-auto h-12 w-12 text-zinc-300 dark:text-zinc-600" />
                                <h3 className="mt-4 text-sm font-medium text-zinc-900 dark:text-white">No furniture found</h3>
                                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                    {furniture.length === 0 
                                        ? 'No furniture items have been added yet. Check back later!'
                                        : 'Try adjusting your search or filter criteria'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

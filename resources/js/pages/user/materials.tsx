import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { STATIC_INTERIOR_CATALOG } from '@/lib/interior-data';
import { type BreadcrumbItem } from '@/types';
import type { RoomApplication } from '@/types/interior-design';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Blocks, Bookmark, Check, Filter, Hammer, Home, Layers, PaintBucket, Palette, RefreshCw, Search, ShoppingCart, Sparkles, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Material Library',
        href: '/library/materials',
    },
];

// Database material interface
interface DbMaterial {
    id: number;
    name: string;
    category: string;
    type: string;
    description?: string;
    price_per_unit: number;
    unit: string;
    color?: string;
    image?: string;
    image_url?: string;
    brand?: string;
    specifications?: string;
    availability?: string;
    stock: number;
    is_featured: boolean;
}

interface Props {
    materials: DbMaterial[];
    categories: string[];
    types: Record<string, string[]>;
}

type MaterialCategory = 'color-palettes' | 'flooring' | 'wall-finishes' | 'construction' | 'all';
type MoodFilter = 'all' | 'Warm' | 'Cool' | 'Neutral';
type RoomFilter = 'all' | 'living' | 'bedroom' | 'bathroom' | 'kitchen' | 'dining' | 'study' | 'any';

// STATIC MATERIAL DATA - This shows you what to include
// Recommendation: Start with STATIC, then move to admin-managed database later

const CONSTRUCTION_MATERIALS = [
    {
        id: 'concrete-standard',
        name: 'Standard Concrete',
        category: 'construction',
        type: 'Foundation & Structure',
        description: 'M20 grade concrete for foundations, columns, and beams. Compressive strength: 20 MPa.',
        pricePerUnit: 'NPR 8,500 per cubic meter',
        unit: 'm³',
        specifications: 'Cement, sand, aggregate mix ratio 1:1.5:3',
        image: 'https://images.unsplash.com/photo-1615844773754-5686e3c07d03?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1615844773754-5686e3c07d03?w=400&q=80',
        usedFor: ['Foundation', 'Columns', 'Beams', 'Slabs'],
        availability: 'Available throughout Nepal',
    },
    {
        id: 'red-brick',
        name: 'Red Clay Bricks',
        category: 'construction',
        type: 'Walls & Partitions',
        description: 'First-class red bricks for load-bearing walls. Size: 9"×4.5"×3"',
        pricePerUnit: 'NPR 18-22 per piece',
        unit: 'piece',
        specifications: 'Compressive strength: 10-12 MPa, Water absorption: <15%',
        image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=400&q=80',
        usedFor: ['Exterior walls', 'Internal walls', 'Boundary walls'],
        availability: 'Local kilns in Kathmandu, Bhaktapur',
    },
    {
        id: 'cement-opc',
        name: 'OPC Cement (53 Grade)',
        category: 'construction',
        type: 'Binding Material',
        description: 'Ordinary Portland Cement for general construction work',
        pricePerUnit: 'NPR 850-950 per 50kg bag',
        unit: 'bag (50kg)',
        specifications: 'Compressive strength: 53 MPa at 28 days',
        image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=400&q=80',
        usedFor: ['Concrete mix', 'Plastering', 'Masonry work'],
        availability: 'All hardware stores',
    },
    {
        id: 'steel-rebar',
        name: 'TMT Steel Bars (Fe 500D)',
        category: 'construction',
        type: 'Reinforcement',
        description: 'Thermo-mechanically treated steel bars for RCC structures',
        pricePerUnit: 'NPR 95,000-110,000 per ton',
        unit: 'kg/ton',
        specifications: 'Grade: Fe 500D, Sizes: 8mm to 32mm diameter',
        image: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&q=80',
        usedFor: ['Columns', 'Beams', 'Slabs', 'Foundation'],
        availability: 'Steel depots in Kathmandu',
    },
];

const FLOORING_MATERIALS = [
    {
        id: 'vitrified-tiles',
        name: 'Vitrified Tiles (Polished)',
        category: 'flooring',
        type: 'Floor Finish',
        description: 'High-quality glazed vitrified tiles with marble-like finish. Size: 2×2 feet',
        pricePerUnit: 'NPR 850-1,500 per sq ft',
        unit: 'sq ft',
        image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=400&q=80',
        color: '#f8fafc',
        finishType: 'Glossy/Polished',
        usedFor: ['Living room', 'Bedroom', 'Dining'],
        maintenance: 'Low - Easy to clean',
    },
    {
        id: 'wooden-flooring',
        name: 'Engineered Wood Flooring',
        category: 'flooring',
        type: 'Floor Finish',
        description: 'Oak veneer engineered wood planks with AC3 rating',
        pricePerUnit: 'NPR 180-300 per sq ft',
        unit: 'sq ft',
        image: 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=400&q=80',
        color: '#b45309',
        finishType: 'Matte/Natural wood',
        usedFor: ['Bedroom', 'Living room', 'Study'],
        maintenance: 'Medium - Avoid water',
    },
    {
        id: 'granite-tile',
        name: 'Granite Floor Tiles',
        category: 'flooring',
        type: 'Floor Finish',
        description: 'Natural granite tiles with anti-slip finish. Size: 2×2 feet',
        pricePerUnit: 'NPR 120-200 per sq ft',
        unit: 'sq ft',
        image: 'https://images.unsplash.com/photo-1564540586616-1951a3cc6ec9?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1564540586616-1951a3cc6ec9?w=400&q=80',
        color: '#57534e',
        finishType: 'Matte/Anti-slip',
        usedFor: ['Kitchen', 'Bathroom', 'Balcony'],
        maintenance: 'Low - Very durable',
    },
];

const WALL_FINISHES = [
    {
        id: 'asian-paints-royale',
        name: 'Asian Paints Royale (Premium)',
        category: 'wall-finishes',
        type: 'Interior Paint',
        description: 'Premium emulsion paint with rich finish and 10-year warranty',
        pricePerUnit: 'NPR 550-650 per liter',
        unit: 'liter',
        coverage: '140-160 sq ft per liter',
        image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&q=80',
        colors: ['White', 'Beige', 'Gray', 'Blue', 'Green', '1000+ shades'],
        finishType: 'Matt/Silk',
        usedFor: ['Living room', 'Bedroom', 'All interiors'],
        maintenance: 'Low - Washable',
    },
    {
        id: 'wallpaper-3d',
        name: '3D Textured Wallpaper',
        category: 'wall-finishes',
        type: 'Wall Covering',
        description: 'Self-adhesive 3D textured wallpaper with brick/stone patterns',
        pricePerUnit: 'NPR 180-350 per sq ft',
        unit: 'sq ft',
        image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=400&q=80',
        patterns: ['Brick', 'Stone', 'Wood panel', 'Abstract'],
        finishType: 'Textured/3D',
        usedFor: ['Feature walls', 'Living room', 'Bedroom'],
        maintenance: 'Easy - Wipeable',
    },
    {
        id: 'marble-cladding',
        name: 'Italian Marble Wall Cladding',
        category: 'wall-finishes',
        type: 'Stone Cladding',
        description: 'Premium Italian marble slabs for luxury wall finish. Thickness: 18mm',
        pricePerUnit: 'NPR 350-800 per sq ft',
        unit: 'sq ft',
        image: 'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800&q=80',
        thumbnail: 'https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=400&q=80',
        varieties: ['Statuario', 'Carrara', 'Calacatta'],
        finishType: 'Polished/Glossy',
        usedFor: ['Feature walls', 'Bathroom', 'Entrance'],
        maintenance: 'Medium - Requires sealing',
    },
];

export default function MaterialsLibrary({ materials = [], categories = [], types = {} }: Props) {
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<MaterialCategory>('all');
    const [moodFilter, setMoodFilter] = useState<MoodFilter>('all');
    const [roomFilter, setRoomFilter] = useState<RoomFilter>('all');
    const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
    const [savedMaterialIds, setSavedMaterialIds] = useState<number[]>([]);
    const [savingMaterialId, setSavingMaterialId] = useState<number | null>(null);
    const [cartMaterialIds, setCartMaterialIds] = useState<number[]>([]);
    const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

    const colorPalettes = STATIC_INTERIOR_CATALOG.materials;

    // Load saved material IDs on mount
    useEffect(() => {
        const loadSavedMaterials = async () => {
            try {
                const response = await axios.get('/api/wishlist/material-ids');
                setSavedMaterialIds(response.data.ids || []);
            } catch (error) {
                console.error('Failed to load saved materials:', error);
            }
        };
        const loadCartMaterials = async () => {
            try {
                const response = await axios.get('/api/cart/material-ids');
                setCartMaterialIds(response.data.ids || []);
            } catch (error) {
                console.error('Failed to load cart materials:', error);
            }
        };
        loadSavedMaterials();
        loadCartMaterials();
    }, []);

    // Toggle save material
    const toggleSaveMaterial = async (e: React.MouseEvent, materialId: number, materialName: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        setSavingMaterialId(materialId);
        try {
            const response = await axios.post('/api/wishlist/toggle', {
                wishlistable_id: materialId,
                wishlistable_type: 'App\\Models\\Material'
            });
            
            if (response.data.saved) {
                setSavedMaterialIds(prev => [...prev, materialId]);
                showToast(`${materialName} added to wishlist`, 'success');
            } else {
                setSavedMaterialIds(prev => prev.filter(id => id !== materialId));
                showToast(`${materialName} removed from wishlist`, 'info');
            }
        } catch (error) {
            console.error('Failed to toggle save:', error);
            showToast('Failed to update wishlist', 'error');
        } finally {
            setSavingMaterialId(null);
        }
    };

    // Add to cart
    const addToCart = async (e: React.MouseEvent, materialId: number, materialName: string, stock?: number, availability?: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Check if out of stock - only block if availability is explicitly "Out of Stock"
        // "In Stock" and "Limited Stock" should always allow adding to cart
        if (availability === 'Out of Stock') {
            showToast('This item is out of stock', 'error');
            return;
        }
        
        if (cartMaterialIds.includes(materialId)) {
            // Already in cart, remove it
            setAddingToCartId(materialId);
            try {
                await axios.post('/api/cart/remove', {
                    cartable_id: materialId,
                    cartable_type: 'App\\Models\\Material'
                });
                setCartMaterialIds(prev => prev.filter(id => id !== materialId));
                showToast(`${materialName} removed from cart`, 'info');
            } catch (error) {
                console.error('Failed to remove from cart:', error);
                showToast('Failed to remove from cart', 'error');
            } finally {
                setAddingToCartId(null);
            }
        } else {
            // Add to cart
            setAddingToCartId(materialId);
            try {
                await axios.post('/api/cart/add', {
                    cartable_id: materialId,
                    cartable_type: 'App\\Models\\Material'
                });
                setCartMaterialIds(prev => [...prev, materialId]);
                showToast(`${materialName} added to cart`, 'success');
            } catch (error: any) {
                console.error('Failed to add to cart:', error);
                const message = error.response?.data?.message || 'Failed to add to cart';
                showToast(message, 'error');
            } finally {
                setAddingToCartId(null);
            }
        }
    };
    
    // Convert database materials to the format used in the UI
    const dbMaterialsMapped = useMemo(() => {
        return materials.map((m) => {
            // Map database category to UI category
            let uiCategory: MaterialCategory = 'all';
            if (m.category === 'Construction') uiCategory = 'construction';
            else if (m.category === 'Flooring') uiCategory = 'flooring';
            else if (m.category === 'Wall Finish') uiCategory = 'wall-finishes';
            else if (m.category === 'Color Palette') uiCategory = 'color-palettes';
            
            // Generate usedFor based on category and type
            const usedFor: string[] = [];
            if (m.category === 'Construction') {
                usedFor.push('Foundation', 'Structure', 'Walls');
            } else if (m.category === 'Flooring') {
                usedFor.push('Living Room', 'Bedroom', 'Kitchen');
            } else if (m.category === 'Wall Finish') {
                usedFor.push('Interior Walls', 'Exterior Walls');
            }
            
            return {
                id: `db-${m.id}`,
                name: m.name,
                category: uiCategory,
                type: m.type,
                description: m.description || '',
                pricePerUnit: m.price_per_unit > 0 ? `NPR ${m.price_per_unit.toLocaleString()} per ${m.unit}` : 'Contact for price',
                unit: m.unit,
                image: m.image ? `/storage/${m.image}` : null,
                thumbnail: m.image ? `/storage/${m.image}` : null,
                color: m.color,
                brand: m.brand,
                specifications: m.specifications,
                availability: m.availability || 'Available',
                stock: m.stock,
                isFeatured: m.is_featured,
                usedFor,
            };
        });
    }, [materials]);
    
    // Combine all materials - database materials first (if any), then static fallback
    const allMaterials = useMemo(() => {
        const staticMaterials = [
            ...colorPalettes.map(p => ({ ...p, category: 'color-palettes' as const })),
            ...CONSTRUCTION_MATERIALS,
            ...FLOORING_MATERIALS,
            ...WALL_FINISHES,
        ];
        
        // If we have database materials, use those; otherwise use static
        if (dbMaterialsMapped.length > 0) {
            return [...dbMaterialsMapped, ...staticMaterials.filter(s => s.category === 'color-palettes')];
        }
        return staticMaterials;
    }, [dbMaterialsMapped, colorPalettes]);

    // Filter materials
    const filteredMaterials = allMaterials.filter((material: any) => {
        const matchesSearch = material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            material.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
        const matchesMood = moodFilter === 'all' || material.mood === moodFilter;
        const matchesRoom = roomFilter === 'all' || 
                          material.appliesTo?.includes(roomFilter) || 
                          material.appliesTo?.includes('any') ||
                          material.usedFor?.some((room: string) => room.toLowerCase().includes(roomFilter));
        
        return matchesSearch && matchesCategory && matchesMood && matchesRoom;
    });

    const categoryOptions = [
        { value: 'all' as MaterialCategory, label: 'All Materials', icon: Blocks, color: 'purple' },
        { value: 'color-palettes' as MaterialCategory, label: 'Color Palettes', icon: Palette, color: 'pink' },
        { value: 'construction' as MaterialCategory, label: 'Construction', icon: Hammer, color: 'orange' },
        { value: 'flooring' as MaterialCategory, label: 'Flooring', icon: Layers, color: 'blue' },
        { value: 'wall-finishes' as MaterialCategory, label: 'Wall Finishes', icon: PaintBucket, color: 'green' },
    ];

    const moodOptions: { value: MoodFilter; label: string; icon: string }[] = [
        { value: 'all', label: 'All Moods', icon: '🎨' },
        { value: 'Warm', label: 'Warm', icon: '🔥' },
        { value: 'Cool', label: 'Cool', icon: '❄️' },
        { value: 'Neutral', label: 'Neutral', icon: '⚪' },
    ];

    const roomOptions: { value: RoomFilter; label: string; icon: string }[] = [
        { value: 'all', label: 'All Rooms', icon: '🏠' },
        { value: 'living', label: 'Living Room', icon: '🛋️' },
        { value: 'bedroom', label: 'Bedroom', icon: '🛏️' },
        { value: 'bathroom', label: 'Bathroom', icon: '🚿' },
        { value: 'kitchen', label: 'Kitchen', icon: '🍳' },
        { value: 'dining', label: 'Dining', icon: '🍽️' },
        { value: 'study', label: 'Study', icon: '📚' },
    ];

    const getMoodColor = (mood: string) => {
        switch (mood) {
            case 'Warm': return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950/30 dark:text-orange-400';
            case 'Cool': return 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-400';
            case 'Neutral': return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Material Library" />
            
            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-purple-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                {/* Header */}
                <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
                    <div className="mx-auto max-w-7xl px-6 py-8">
                        <div className="flex items-start gap-4">
                            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-4 shadow-lg">
                                <Palette className="h-8 w-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                    Material Library
                                </h1>
                                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                                    {allMaterials.length} materials: {colorPalettes.length} color palettes • {CONSTRUCTION_MATERIALS.length} construction • {FLOORING_MATERIALS.length} flooring • {WALL_FINISHES.length} wall finishes
                                </p>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 dark:bg-purple-950/30">
                                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                    {filteredMaterials.length} Results
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-6 py-8">
                    {/* Info Banner */}
                    <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
                        <div className="flex items-start gap-3">
                            <Home className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    📚 Material Library Guide
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    <strong>Color Palettes</strong> = Interior design color schemes (floor, wall, accent colors)<br/>
                                    <strong>Construction</strong> = Building materials (concrete, bricks, cement, steel)<br/>
                                    <strong>Flooring</strong> = Floor finishes (tiles, wood, granite, marble)<br/>
                                    <strong>Wall Finishes</strong> = Wall treatments (paint, wallpaper, cladding)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="mb-6 overflow-x-auto">
                        <div className="flex gap-3 pb-2">
                            {categoryOptions.map((cat) => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.value}
                                        onClick={() => setCategoryFilter(cat.value)}
                                        className={`flex items-center gap-2 whitespace-nowrap rounded-xl border-2 px-6 py-3 font-semibold transition-all ${
                                            categoryFilter === cat.value
                                                ? `border-${cat.color}-500 bg-${cat.color}-50 text-${cat.color}-700 dark:border-${cat.color}-400 dark:bg-${cat.color}-950/50`
                                                : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700'
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span>{cat.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="mb-8 space-y-6">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search materials by name or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-zinc-300 bg-white py-3 pl-12 pr-4 text-zinc-900 placeholder:text-zinc-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>

                        {/* Filter Pills - Only show for color palettes */}
                        {categoryFilter === 'all' || categoryFilter === 'color-palettes' ? (
                        <div className="flex flex-wrap gap-4">
                            {/* Mood Filter */}
                            <div className="flex-1 min-w-[250px]">
                                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    <Filter className="inline h-4 w-4 mr-1" />
                                    Mood
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {moodOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setMoodFilter(option.value)}
                                            className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-medium transition-all ${
                                                moodFilter === option.value
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-400 dark:bg-purple-950/50 dark:text-purple-300'
                                                    : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                                            }`}
                                        >
                                            <span>{option.icon}</span>
                                            <span>{option.label}</span>
                                            {moodFilter === option.value && <Check className="h-4 w-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Room Filter */}
                            <div className="flex-1 min-w-[250px]">
                                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    <Layers className="inline h-4 w-4 mr-1" />
                                    Room Type
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {roomOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setRoomFilter(option.value)}
                                            className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all ${
                                                roomFilter === option.value
                                                    ? 'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-400 dark:bg-purple-950/50 dark:text-purple-300'
                                                    : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                                            }`}
                                        >
                                            <span>{option.icon}</span>
                                            <span className="hidden sm:inline">{option.label}</span>
                                            {roomFilter === option.value && <Check className="h-4 w-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        ) : null}
                    </div>

                    {/* Materials Grid */}
                    {filteredMaterials.length === 0 ? (
                        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 p-8 dark:border-zinc-700 dark:bg-zinc-900/50">
                            <Palette className="h-16 w-16 text-zinc-400 mb-4" />
                            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
                                No materials found
                            </h3>
                            <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-md">
                                Try adjusting your filters or search query to find materials
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredMaterials.map((material: any) => {
                                // Extract numeric ID for database materials
                                const numericId = typeof material.id === 'string' && material.id.startsWith('db-') 
                                    ? parseInt(material.id.replace('db-', '')) 
                                    : null;
                                const isSaved = numericId ? savedMaterialIds.includes(numericId) : false;
                                const isSaving = numericId ? savingMaterialId === numericId : false;
                                
                                return (
                                <div
                                    key={material.id}
                                    onClick={() => setSelectedMaterial(material)}
                                    className="group cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900 relative"
                                >
                                    {/* Save/Bookmark Button - Only for database materials */}
                                    {numericId && (
                                        <button
                                            onClick={(e) => toggleSaveMaterial(e, numericId, material.name)}
                                            disabled={isSaving}
                                            className={`absolute top-3 right-3 z-10 rounded-full p-2 shadow-sm transition-colors ${
                                                isSaved
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-white/90 dark:bg-zinc-800/90 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                                            }`}
                                            title={isSaved ? 'Remove from saved' : 'Save for later'}
                                        >
                                            {isSaving ? (
                                                <RefreshCw className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
                                            ) : (
                                                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : 'text-purple-600 dark:text-purple-400'}`} />
                                            )}
                                        </button>
                                    )}

                                    {/* Preview - Different for each category */}
                                    {material.category === 'color-palettes' ? (
                                    <div className="h-40 relative overflow-hidden">
                                        {/* Floor & Wall split */}
                                        <div className="absolute inset-0 flex">
                                            <div 
                                                className="flex-1 relative"
                                                style={{ backgroundColor: material.floor }}
                                            >
                                                <span className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                    Floor
                                                </span>
                                            </div>
                                            <div 
                                                className="flex-1 relative"
                                                style={{ backgroundColor: material.wall }}
                                            >
                                                <span className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                    Wall
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Accent bar at bottom */}
                                        <div 
                                            className="absolute bottom-0 left-0 right-0 h-8"
                                            style={{ backgroundColor: material.accent }}
                                        >
                                            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                                                Accent
                                            </span>
                                        </div>

                                        {/* Lighting indicator */}
                                        <div 
                                            className="absolute top-2 right-2 h-8 w-8 rounded-full border-2 border-white shadow-lg"
                                            style={{ backgroundColor: material.lighting }}
                                            title="Lighting"
                                        />
                                    </div>
                                    ) : (
                                    <div className="h-40 relative overflow-hidden bg-zinc-100">
                                        <img 
                                            src={material.thumbnail || material.image} 
                                            alt={material.name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                // Fallback to color if image fails to load
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.style.backgroundColor = material.color || '#94a3b8';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <span className="inline-block rounded bg-white/90 px-3 py-1.5 text-xs font-semibold text-zinc-900 backdrop-blur-sm shadow-lg">
                                                {material.type || material.category}
                                            </span>
                                        </div>
                                    </div>
                                    )}

                                    {/* Material Info */}
                                    <div className="p-5">
                                        <div className="mb-3 flex items-start justify-between">
                                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                                {material.name}
                                            </h3>
                                            {material.mood && (
                                                <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getMoodColor(material.mood)}`}>
                                                    {material.mood}
                                                </span>
                                            )}
                                        </div>

                                        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                            {material.description}
                                        </p>

                                        {/* Price for construction/flooring/wall materials */}
                                        {material.pricePerUnit && (
                                            <p className="mb-3 text-sm font-semibold text-green-600 dark:text-green-400">
                                                💰 {material.pricePerUnit}
                                            </p>
                                        )}

                                        {/* Color Swatches - only for color palettes */}
                                        {material.category === 'color-palettes' && material.floor && (
                                        <div className="mb-4 flex gap-2">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex gap-1">
                                                    <div 
                                                        className="h-6 flex-1 rounded border border-zinc-200 dark:border-zinc-700"
                                                        style={{ backgroundColor: material.floor }}
                                                        title={`Floor: ${material.floor}`}
                                                    />
                                                    <div 
                                                        className="h-6 flex-1 rounded border border-zinc-200 dark:border-zinc-700"
                                                        style={{ backgroundColor: material.wall }}
                                                        title={`Wall: ${material.wall}`}
                                                    />
                                                </div>
                                                <div className="flex gap-1">
                                                    <div 
                                                        className="h-6 flex-1 rounded border border-zinc-200 dark:border-zinc-700"
                                                        style={{ backgroundColor: material.accent }}
                                                        title={`Accent: ${material.accent}`}
                                                    />
                                                    <div 
                                                        className="h-6 flex-1 rounded border border-zinc-200 dark:border-zinc-700"
                                                        style={{ backgroundColor: material.lighting }}
                                                        title={`Lighting: ${material.lighting}`}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        )}

                                        {/* Room/Usage Tags */}
                                        <div className="flex flex-wrap gap-1">
                                            {material.appliesTo?.map((room: RoomApplication) => (
                                                <span 
                                                    key={room}
                                                    className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                                >
                                                    {room === 'any' ? 'All Rooms' : room.charAt(0).toUpperCase() + room.slice(1)}
                                                </span>
                                            ))}
                                            {material.usedFor?.slice(0, 3).map((use: string, idx: number) => (
                                                <span 
                                                    key={idx}
                                                    className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                                                >
                                                    {use}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Stock Info */}
                                        {numericId && material.availability === 'Made to Order' ? (
                                            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                                                Made to order • 2-4 weeks delivery
                                            </p>
                                        ) : numericId && material.availability === 'Limited Stock' ? (
                                            <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                                                Limited Stock
                                            </p>
                                        ) : numericId && material.availability === 'In Stock' && material.stock > 0 && material.stock <= 5 ? (
                                            <p className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                                                Only {material.stock} left in stock
                                            </p>
                                        ) : null}

                                        {/* Action Buttons */}
                                        <div className="mt-4 flex gap-2">
                                            {numericId && material.availability === 'Out of Stock' ? (
                                                <span className="flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400 cursor-not-allowed">
                                                    Out of Stock
                                                </span>
                                            ) : numericId ? (
                                                <button 
                                                    onClick={(e) => addToCart(e, numericId, material.name, material.stock, material.availability)}
                                                    disabled={addingToCartId === numericId}
                                                    className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-all ${
                                                        cartMaterialIds.includes(numericId)
                                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                                            : material.availability === 'Made to Order'
                                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                                            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700'
                                                    }`}
                                                >
                                                    {addingToCartId === numericId ? (
                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                    ) : cartMaterialIds.includes(numericId) ? (
                                                        <Check className="h-4 w-4" />
                                                    ) : (
                                                        <ShoppingCart className="h-4 w-4" />
                                                    )}
                                                    {cartMaterialIds.includes(numericId) ? 'In Cart' : material.availability === 'Made to Order' ? 'Pre-Order' : 'Add to Cart'}
                                                </button>
                                            ) : null}
                                            <button className={`${numericId ? 'flex-1' : 'w-full'} rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 py-2 text-sm font-semibold text-white transition-all hover:from-purple-600 hover:to-purple-700 hover:shadow-lg`}>
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Material Detail Modal */}
                {selectedMaterial && (
                    <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                        onClick={() => setSelectedMaterial(null)}
                    >
                        <div 
                            className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Large Preview */}
                            <div className="relative h-48 overflow-hidden rounded-t-2xl bg-zinc-100">
                                {selectedMaterial.category === 'color-palettes' ? (
                                    <>
                                        <div className="absolute inset-0 flex">
                                            <div className="flex-1" style={{ backgroundColor: selectedMaterial.floor }} />
                                            <div className="flex-1" style={{ backgroundColor: selectedMaterial.wall }} />
                                        </div>
                                        <div 
                                            className="absolute bottom-0 left-0 right-0 h-16"
                                            style={{ backgroundColor: selectedMaterial.accent }}
                                        />
                                        <div 
                                            className="absolute top-4 right-4 h-12 w-12 rounded-full border-4 border-white shadow-lg"
                                            style={{ backgroundColor: selectedMaterial.lighting }}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <img 
                                            src={selectedMaterial.image} 
                                            alt={selectedMaterial.name}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.parentElement!.style.backgroundColor = selectedMaterial.color || '#94a3b8';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
                                    </>
                                )}
                                <button
                                    onClick={() => setSelectedMaterial(null)}
                                    className="absolute top-4 left-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="p-4">
                                <div className="mb-3 flex items-start justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                                            {selectedMaterial.name}
                                        </h2>
                                        {selectedMaterial.mood && (
                                            <span className={`mt-2 inline-block rounded-full border px-3 py-1 text-sm font-medium ${getMoodColor(selectedMaterial.mood)}`}>
                                                {selectedMaterial.mood} Palette
                                            </span>
                                        )}
                                        {selectedMaterial.type && (
                                            <span className="mt-2 inline-block rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                                                {selectedMaterial.type}
                                            </span>
                                        )}
                                    </div>
                                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                </div>

                                <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
                                    {selectedMaterial.description}
                                </p>

                                {/* Price & Specifications - for non-color-palette materials */}
                                {selectedMaterial.pricePerUnit && (
                                    <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 dark:bg-green-950/30 dark:border-green-800">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-green-700 dark:text-green-300 mb-1">Price</p>
                                                <p className="text-xl font-bold text-green-900 dark:text-green-100">{selectedMaterial.pricePerUnit}</p>
                                            </div>
                                            {selectedMaterial.unit && (
                                                <span className="rounded bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                                    per {selectedMaterial.unit}
                                                </span>
                                            )}
                                        </div>
                                        {selectedMaterial.specifications && (
                                            <p className="mt-3 text-xs text-green-600 dark:text-green-400">
                                                <strong>Specifications:</strong> {selectedMaterial.specifications}
                                            </p>
                                        )}
                                        {selectedMaterial.availability && (
                                            <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                                                <strong>Availability:</strong> {selectedMaterial.availability}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Color Details - only for color palettes */}
                                {selectedMaterial.category === 'color-palettes' && (
                                <div className="mb-4 grid grid-cols-4 gap-2">
                                    <div className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-700 text-center">
                                        <div 
                                            className="h-8 w-full rounded border border-zinc-300 mb-1"
                                            style={{ backgroundColor: selectedMaterial.floor }}
                                        />
                                        <span className="text-xs text-zinc-600 dark:text-zinc-400">Floor</span>
                                    </div>
                                    <div className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-700 text-center">
                                        <div 
                                            className="h-8 w-full rounded border border-zinc-300 mb-1"
                                            style={{ backgroundColor: selectedMaterial.wall }}
                                        />
                                        <span className="text-xs text-zinc-600 dark:text-zinc-400">Wall</span>
                                    </div>
                                    <div className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-700 text-center">
                                        <div 
                                            className="h-8 w-full rounded border border-zinc-300 mb-1"
                                            style={{ backgroundColor: selectedMaterial.accent }}
                                        />
                                        <span className="text-xs text-zinc-600 dark:text-zinc-400">Accent</span>
                                    </div>
                                    <div className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-700 text-center">
                                        <div 
                                            className="h-8 w-full rounded border border-zinc-300 mb-1"
                                            style={{ backgroundColor: selectedMaterial.lighting }}
                                        />
                                        <span className="text-xs text-zinc-600 dark:text-zinc-400">Light</span>
                                    </div>
                                </div>
                                )}

                                {/* Best For */}
                                {(selectedMaterial.appliesTo?.length > 0 || selectedMaterial.usedFor?.length > 0) && (
                                <div className="mb-4">
                                    <h3 className="mb-2 text-xs font-semibold text-zinc-900 dark:text-white">
                                        Best For:
                                    </h3>
                                    <div className="flex flex-wrap gap-1">
                                        {selectedMaterial.appliesTo?.map((room: string) => (
                                            <span 
                                                key={room}
                                                className="rounded-lg bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950/30 dark:text-purple-300"
                                            >
                                                {room === 'any' ? '✨ All Rooms' : `${room.charAt(0).toUpperCase() + room.slice(1)}`}
                                            </span>
                                        ))}
                                        {selectedMaterial.usedFor?.map((use: string, idx: number) => (
                                            <span 
                                                key={idx}
                                                className="rounded-lg bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                                            >
                                                {use}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                )}

                                {/* Action Button */}
                                <button 
                                    onClick={() => setSelectedMaterial(null)}
                                    className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 py-2.5 font-semibold text-white transition-all hover:from-purple-600 hover:to-purple-700 hover:shadow-lg"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

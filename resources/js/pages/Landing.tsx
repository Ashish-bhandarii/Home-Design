import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Bath, Bed, Bookmark, Check, Copy, FolderOpen, Home, Lock, MapPin, Palette, Plus, RefreshCw, Ruler, Search, ShoppingCart, Sofa, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Home',
        href: '/',
    },
];

// =============================================================================
// MEASUREMENT CONVERSION UTILITIES - Nepal & International
// =============================================================================

// Nepal Hill Region: Ropani System
// 1 Ropani = 508.72 m² = 5476 sq ft
// 1 Ropani = 16 Anna
// 1 Anna = 4 Paisa
// 1 Paisa = 4 Dam
const ROPANI_TO_SQM = 508.72;
const ANNA_TO_SQM = 31.795; // 508.72 / 16
const PAISA_TO_SQM = 7.94875; // 31.795 / 4
const DAM_TO_SQM = 1.9871875; // 7.94875 / 4

// Nepal Terai Region: Bigha System
// 1 Bigha = 6772.63 m² = 72900 sq ft = 1.67 acres
// 1 Bigha = 20 Kattha
// 1 Kattha = 20 Dhur
const BIGHA_TO_SQM = 6772.63;
const KATTHA_TO_SQM = 338.63; // 6772.63 / 20
const DHUR_TO_SQM = 16.93; // 338.63 / 20

// International
const SQM_TO_SQFT = 10.7639;
const SQM_TO_ACRES = 0.000247105;

type MeasurementSystem = 'international' | 'ropani' | 'bigha';

interface MeasurementResult {
    primary: string;
    secondary: string;
    breakdown?: string;
}

// Convert m² to Ropani system (Ropani-Anna-Paisa-Dam)
function sqmToRopani(sqm: number): MeasurementResult {
    const totalRopani = sqm / ROPANI_TO_SQM;

    const ropani = Math.floor(totalRopani);
    const remainingAfterRopani = sqm - (ropani * ROPANI_TO_SQM);

    const anna = Math.floor(remainingAfterRopani / ANNA_TO_SQM);
    const remainingAfterAnna = remainingAfterRopani - (anna * ANNA_TO_SQM);

    const paisa = Math.floor(remainingAfterAnna / PAISA_TO_SQM);
    const remainingAfterPaisa = remainingAfterAnna - (paisa * PAISA_TO_SQM);

    const dam = Math.round(remainingAfterPaisa / DAM_TO_SQM * 10) / 10;

    // Build display strings
    const parts: string[] = [];
    if (ropani > 0) parts.push(`${ropani} Ropani`);
    if (anna > 0) parts.push(`${anna} Anna`);
    if (paisa > 0) parts.push(`${paisa} Paisa`);
    if (dam > 0) parts.push(`${dam} Dam`);

    if (parts.length === 0) {
        return {
            primary: `${dam.toFixed(1)} Dam`,
            secondary: `${sqm.toFixed(2)} m²`,
            breakdown: `≈ ${(sqm * SQM_TO_SQFT).toFixed(0)} sq ft`
        };
    }

    return {
        primary: parts.slice(0, 2).join(' '),
        secondary: parts.length > 2 ? parts.slice(2).join(' ') : `${sqm.toFixed(2)} m²`,
        breakdown: `${sqm.toFixed(2)} m² • ${(sqm * SQM_TO_SQFT).toFixed(0)} sq ft`
    };
}

// Convert m² to Bigha system (Bigha-Kattha-Dhur)
function sqmToBigha(sqm: number): MeasurementResult {
    const totalBigha = sqm / BIGHA_TO_SQM;

    const bigha = Math.floor(totalBigha);
    const remainingAfterBigha = sqm - (bigha * BIGHA_TO_SQM);

    const kattha = Math.floor(remainingAfterBigha / KATTHA_TO_SQM);
    const remainingAfterKattha = remainingAfterBigha - (kattha * KATTHA_TO_SQM);

    const dhur = Math.round(remainingAfterKattha / DHUR_TO_SQM * 10) / 10;

    const parts: string[] = [];
    if (bigha > 0) parts.push(`${bigha} Bigha`);
    if (kattha > 0) parts.push(`${kattha} Kattha`);
    if (dhur > 0) parts.push(`${dhur.toFixed(1)} Dhur`);

    if (parts.length === 0) {
        return {
            primary: `${dhur.toFixed(1)} Dhur`,
            secondary: `${sqm.toFixed(2)} m²`,
            breakdown: `≈ ${(sqm * SQM_TO_SQFT).toFixed(0)} sq ft`
        };
    }

    return {
        primary: parts.slice(0, 2).join(' '),
        secondary: parts.length > 2 ? parts.slice(2).join(' ') : `${sqm.toFixed(2)} m²`,
        breakdown: `${sqm.toFixed(2)} m² • ${(sqm * SQM_TO_SQFT).toFixed(0)} sq ft`
    };
}

// Convert m² to International (m², sq ft, acres)
function sqmToInternational(sqm: number): MeasurementResult {
    const sqft = sqm * SQM_TO_SQFT;
    const acres = sqm * SQM_TO_ACRES;

    return {
        primary: `${sqm.toFixed(2)} m²`,
        secondary: `${sqft.toFixed(0)} sq ft`,
        breakdown: acres >= 0.01 ? `${acres.toFixed(3)} acres` : undefined
    };
}

// Main conversion function
function convertArea(sqm: number, system: MeasurementSystem): MeasurementResult {
    switch (system) {
        case 'ropani':
            return sqmToRopani(sqm);
        case 'bigha':
            return sqmToBigha(sqm);
        default:
            return sqmToInternational(sqm);
    }
}

const quickLinks = [
    {
        title: 'Floor Plan Designer',
        description: 'Create precise floor plans with professional-grade tools. Smart snapping, layers, and measurements.',
        href: '/floor-plan',
        emoji: '📐',
        gradient: 'from-blue-50 to-blue-100/50',
    },
    {
        title: 'Home Design',
        description: 'Design beautiful interiors with furniture, color palettes, lighting, and mood boards.',
        href: '/design-home',
        emoji: '🏠',
        gradient: 'from-purple-50 to-purple-100/50',
    },
    {
        title: 'Interior Design',
        description: 'Complete interior styling with materials, lighting, and furnishings.',
        href: '/interior-design',
        emoji: '🏡',
        gradient: 'from-orange-50 to-orange-100/50',
    },
];

const measurementOptions = [
    { value: 'ropani' as const, label: 'Ropani', region: 'Nepal Hills', icon: '🏔️' },
    { value: 'bigha' as const, label: 'Bigha', region: 'Nepal Terai', icon: '🌾' },
    { value: 'international' as const, label: 'International', region: 'Global', icon: '🌍' },
];

// Floor Plan Project interface
interface FloorPlanProject {
    id: number;
    name: string;
    description?: string;
    requirements?: {
        plotWidth: number;
        plotDepth: number;
        bedrooms: { id: string }[];
        bathrooms: { id: string }[];
    };
    updated_at: string;
}

// Furniture interface
interface Furniture {
    id: number;
    name: string;
    slug: string;
    description: string;
    category: string;
    room: string;
    price: number;
    image: string | null;
    dimensions: { width?: number; height?: number; depth?: number } | null;
    material: string | null;
    color: string | null;
    is_featured: boolean;
}

// Interior Design Project interface
interface InteriorDesignProject {
    id: number;
    name: string;
    description: string | null;
    thumbnail: string | null;
    updated_at: string;
}

interface FeaturedHomeDesign {
    id: number;
    name: string;
    style: string | null;
    total_area_sqft: number | null;
    bedrooms: number;
    bathrooms: number;
    cover_image_url: string | null;
}

interface FeaturedInteriorDesign {
    id: number;
    name: string;
    room_type: string;
    style: string | null;
    cover_image_url: string | null;
}

interface LandingProps {
    canRegister: boolean;
    featuredHomeDesigns: FeaturedHomeDesign[];
    featuredInteriorDesigns: FeaturedInteriorDesign[];
}

export default function Landing({ featuredHomeDesigns = [], featuredInteriorDesigns = [] }: LandingProps) {
    const { showToast } = useToast();
    const page = usePage<SharedData>();
    const auth = page.props.auth;
    const isAuthenticated = !!(auth && auth.user);

    const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>('ropani');

    // Floor Plan Projects state
    const [showFloorPlanProjects, setShowFloorPlanProjects] = useState(false);
    const [floorPlanProjects, setFloorPlanProjects] = useState<FloorPlanProject[]>([]);
    const [loadingProjects, setLoadingProjects] = useState(false);

    // Interior Design state
    const [interiorDesignSearch, setInteriorDesignSearch] = useState('');
    const [furnitureItems, setFurnitureItems] = useState<Furniture[]>([]);
    const [interiorProjects, setInteriorProjects] = useState<InteriorDesignProject[]>([]);
    const [loadingFurniture, setLoadingFurniture] = useState(true);
    const [showInteriorProjects, setShowInteriorProjects] = useState(false);
    const [loadingInteriorProjects, setLoadingInteriorProjects] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [savedFurnitureIds, setSavedFurnitureIds] = useState<number[]>([]);
    const [savingFurnitureId, setSavingFurnitureId] = useState<number | null>(null);
    const [cartFurnitureIds, setCartFurnitureIds] = useState<number[]>([]);
    const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

    // Load furniture items on mount
    useEffect(() => {
        const loadFurniture = async () => {
            try {
                const response = await axios.get('/api/furniture');
                setFurnitureItems(response.data.data || response.data);
            } catch (error) {
                console.error('Failed to load furniture:', error);
            } finally {
                setLoadingFurniture(false);
            }
        };
        loadFurniture();
    }, []);

    // Load saved furniture IDs if authenticated
    useEffect(() => {
        const loadSavedFurniture = async () => {
            if (!isAuthenticated) return;
            try {
                const response = await axios.get('/api/wishlist/furniture-ids');
                setSavedFurnitureIds(response.data.ids || []);
            } catch (error) {
                console.error('Failed to load saved furniture:', error);
            }
        };
        loadSavedFurniture();
    }, [isAuthenticated]);

    // Load cart furniture IDs if authenticated
    useEffect(() => {
        const loadCartFurniture = async () => {
            if (!isAuthenticated) return;
            try {
                const response = await axios.get('/api/cart/furniture-ids');
                setCartFurnitureIds(response.data.ids || []);
            } catch (error) {
                console.error('Failed to load cart furniture:', error);
            }
        };
        loadCartFurniture();
    }, [isAuthenticated]);

    // Add to cart function
    const addToCart = async (e: React.MouseEvent, furnitureId: number, furnitureName: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }
        
        setAddingToCartId(furnitureId);
        try {
            const isInCart = cartFurnitureIds.includes(furnitureId);
            
            if (isInCart) {
                await axios.post('/api/cart/remove', {
                    cartable_id: furnitureId,
                    cartable_type: 'App\\Models\\Furniture'
                });
                setCartFurnitureIds(prev => prev.filter(id => id !== furnitureId));
                showToast(`${furnitureName} removed from cart`, 'info');
            } else {
                await axios.post('/api/cart/add', {
                    cartable_id: furnitureId,
                    cartable_type: 'App\\Models\\Furniture'
                });
                setCartFurnitureIds(prev => [...prev, furnitureId]);
                showToast(`${furnitureName} added to cart`, 'success');
            }
        } catch (error) {
            console.error('Failed to update cart:', error);
            showToast('Failed to update cart', 'error');
        } finally {
            setAddingToCartId(null);
        }
    };

    // Toggle save furniture
    const toggleSaveFurniture = async (e: React.MouseEvent, furnitureId: number, furnitureName: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }
        
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

    // Load interior design projects
    const loadInteriorProjects = async () => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }
        setLoadingInteriorProjects(true);
        try {
            const response = await axios.get('/api/interior-design-projects');
            setInteriorProjects(response.data);
        } catch (error) {
            console.error('Failed to load interior projects:', error);
        } finally {
            setLoadingInteriorProjects(false);
        }
    };

    // Load floor plan projects
    const loadFloorPlanProjects = async () => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
            return;
        }
        setLoadingProjects(true);
        try {
            const response = await axios.get('/api/floor-plan-projects');
            setFloorPlanProjects(response.data);
        } catch (error) {
            console.error('Failed to load floor plan projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    // Handle delete project
    const handleDeleteProject = async (id: number) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        
        try {
            await axios.delete(`/api/floor-plan-projects/${id}`);
            setFloorPlanProjects(floorPlanProjects.filter(p => p.id !== id));
        } catch (error) {
            console.error('Failed to delete project:', error);
            alert('Failed to delete project');
        }
    };

    // Handle duplicate project
    const handleDuplicateProject = async (id: number) => {
        try {
            const response = await axios.post(`/api/floor-plan-projects/${id}/duplicate`);
            await loadFloorPlanProjects();
        } catch (error) {
            console.error('Failed to duplicate project:', error);
            alert('Failed to duplicate project');
        }
    };

    // Filter furniture based on search
    const filteredFurniture = furnitureItems.filter(item =>
        item.name.toLowerCase().includes(interiorDesignSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(interiorDesignSearch.toLowerCase()) ||
        item.room.toLowerCase().includes(interiorDesignSearch.toLowerCase())
    );

    // Handle locked feature click
    const handleLockedFeature = () => {
        if (!isAuthenticated) {
            setShowLoginPrompt(true);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Home Design - Create Stunning Floor Plans & Interior Designs">
                <meta name="description" content="Design your dream home with our professional floor plan and interior design tools. Perfect for homeowners and designers in Nepal." />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-orange-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                {/* Hero Section with Quick Actions */}
                <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
                    <div className="mx-auto max-w-7xl px-6 py-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                    {isAuthenticated ? 'My Projects' : 'Design Your Dream Home'}
                                </h1>
                                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                                    {isAuthenticated
                                        ? 'Create stunning floor plans and home designs'
                                        : 'Create stunning floor plans and home designs with professional tools'
                                    }
                                </p>
                            </div>

                            {/* Quick Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                {isAuthenticated ? (
                                    <>
                                        <Link
                                            href="/floor-plan"
                                            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-orange-500/40"
                                        >
                                            <Plus className="h-5 w-5" />
                                            New Project
                                        </Link>
                                        <button
                                            onClick={() => {
                                                loadFloorPlanProjects();
                                                setShowFloorPlanProjects(true);
                                            }}
                                            className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 font-medium text-zinc-700 transition-all hover:border-orange-300 hover:bg-orange-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:border-orange-500 dark:hover:bg-zinc-700"
                                        >
                                            <FolderOpen className="h-5 w-5" />
                                            Open Existing
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/register"
                                            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-orange-500/40"
                                        >
                                            <Plus className="h-5 w-5" />
                                            Get Started Free
                                        </Link>
                                        <button
                                            onClick={handleLockedFeature}
                                            className="flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 font-medium text-zinc-700 transition-all hover:border-orange-300 hover:bg-orange-50"
                                        >
                                            <Lock className="h-5 w-5" />
                                            Sign In to Access
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Quick Start Cards */}
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {quickLinks.map((card) => (
                                <div key={card.title} className="relative">
                                    {isAuthenticated ? (
                                        <Link
                                            href={card.href}
                                            className={`group relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br ${card.gradient} p-6 transition-all hover:scale-[1.02] hover:shadow-xl dark:border-zinc-800 dark:from-zinc-900/40 dark:to-zinc-900/20`}
                                        >
                                            <div className="mb-4 text-4xl" aria-hidden>
                                                {card.emoji}
                                            </div>
                                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{card.title}</h3>
                                            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                                {card.description}
                                            </p>
                                            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-orange-600 dark:text-orange-400">
                                                <span>Get Started</span>
                                                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </div>
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={handleLockedFeature}
                                            className={`group relative w-full text-left overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br ${card.gradient} p-6 transition-all hover:scale-[1.02] hover:shadow-xl`}
                                        >
                                            {/* Lock overlay */}
                                            <div className="absolute top-3 right-3 rounded-full bg-zinc-900/80 p-1.5">
                                                <Lock className="h-3.5 w-3.5 text-white" />
                                            </div>
                                            <div className="mb-4 text-4xl" aria-hidden>
                                                {card.emoji}
                                            </div>
                                            <h3 className="text-lg font-semibold text-zinc-900">{card.title}</h3>
                                            <p className="mt-2 text-sm text-zinc-600">
                                                {card.description}
                                            </p>
                                            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-orange-600">
                                                <span>Login to Access</span>
                                                <Lock className="h-4 w-4" />
                                            </div>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Projects Section */}
                <div className="mx-auto max-w-7xl px-6 py-8">
                    {/* Measurement System Selector */}
                    <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="flex items-center gap-3 mb-3">
                            <MapPin className="h-5 w-5 text-orange-500" />
                            <span className="font-semibold text-zinc-900 dark:text-white">Measurement System</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {measurementOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setMeasurementSystem(option.value)}
                                    className={`flex flex-col items-center gap-1 rounded-lg border-2 p-3 transition-all ${
                                        measurementSystem === option.value
                                            ? 'border-orange-500 bg-orange-50 dark:border-orange-400 dark:bg-orange-950/30'
                                            : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'
                                    }`}
                                >
                                    <span className="text-2xl">{option.icon}</span>
                                    <span className={`font-medium ${
                                        measurementSystem === option.value
                                            ? 'text-orange-600 dark:text-orange-400'
                                            : 'text-zinc-700 dark:text-zinc-300'
                                    }`}>
                                        {option.label}
                                    </span>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">{option.region}</span>
                                </button>
                            ))}
                        </div>
                        {/* Conversion Reference */}
                        <div className="mt-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                            <p className="text-xs text-zinc-600 dark:text-zinc-400">
                                {measurementSystem === 'ropani' && (
                                    <>
                                        <strong>Ropani System:</strong> 1 Ropani = 16 Anna = 64 Paisa = 256 Dam ≈ 508.72 m² ≈ 5,476 sq ft
                                    </>
                                )}
                                {measurementSystem === 'bigha' && (
                                    <>
                                        <strong>Bigha System:</strong> 1 Bigha = 20 Kattha = 400 Dhur ≈ 6,772 m² ≈ 72,900 sq ft ≈ 1.67 acres
                                    </>
                                )}
                                {measurementSystem === 'international' && (
                                    <>
                                        <strong>International:</strong> 1 m² = 10.76 sq ft • 1 acre = 4,047 m² ≈ 43,560 sq ft
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Featured Home Designs Section */}
                    {featuredHomeDesigns.length > 0 && (
                        <div className="mt-12">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 p-2.5">
                                        <Home className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Featured Home Designs</h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Professional architectural plans for your dream home</p>
                                    </div>
                                </div>
                                <Link
                                    href="/design-home"
                                    className="text-sm font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
                                >
                                    View All
                                </Link>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {featuredHomeDesigns.map((design) => (
                                    <Link
                                        key={design.id}
                                        href={`/design-home/${design.id}`}
                                        className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                            {design.cover_image_url ? (
                                                <img
                                                    src={design.cover_image_url}
                                                    alt={design.name}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Home className="h-12 w-12 text-zinc-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-zinc-900 dark:text-white truncate">{design.name}</h3>
                                            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                                <span className="flex items-center gap-1">
                                                    <Bed className="h-3 w-3" /> {design.bedrooms}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Bath className="h-3 w-3" /> {design.bathrooms}
                                                </span>
                                                {design.total_area_sqft && (
                                                    <span className="flex items-center gap-1">
                                                        <Ruler className="h-3 w-3" /> {design.total_area_sqft} sqft
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Featured Interior Designs Section */}
                    {featuredInteriorDesigns.length > 0 && (
                        <div className="mt-12">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5">
                                        <Palette className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Featured Interior Designs</h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Inspiration for every room in your house</p>
                                    </div>
                                </div>
                                <Link
                                    href="/gallery"
                                    className="text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400"
                                >
                                    View Gallery
                                </Link>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {featuredInteriorDesigns.map((design) => (
                                    <Link
                                        key={design.id}
                                        href={`/gallery/${design.id}`}
                                        className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                                            {design.cover_image_url ? (
                                                <img
                                                    src={design.cover_image_url}
                                                    alt={design.name}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Palette className="h-12 w-12 text-zinc-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-zinc-900 dark:text-white truncate">{design.name}</h3>
                                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                                                {design.room_type} • {design.style}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Interior Designs Section */}
                    <div className="mt-12">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-2.5">
                                    <Palette className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Interior Designs</h2>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Browse furniture & create your design</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                                    <input
                                        type="text"
                                        placeholder="Search furniture..."
                                        value={interiorDesignSearch}
                                        onChange={(e) => setInteriorDesignSearch(e.target.value)}
                                        className="w-full rounded-lg border border-zinc-300 bg-white py-2 pl-9 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
                                    />
                                </div>
                                {isAuthenticated ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                loadInteriorProjects();
                                                setShowInteriorProjects(true);
                                            }}
                                            className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                        >
                                            <FolderOpen className="h-4 w-4" />
                                            My Projects
                                        </button>
                                        <Link
                                            href="/interior-design"
                                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
                                        >
                                            <Plus className="h-4 w-4" />
                                            New Project
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleLockedFeature}
                                            className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                                        >
                                            <Lock className="h-4 w-4" />
                                            My Projects
                                        </button>
                                        <button
                                            onClick={handleLockedFeature}
                                            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all"
                                        >
                                            <Lock className="h-4 w-4" />
                                            New Project
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Furniture Grid */}
                        {loadingFurniture ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
                            </div>
                        ) : filteredFurniture.length === 0 ? (
                            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                                <Sofa className="h-12 w-12 text-zinc-400 mb-4" />
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    {interiorDesignSearch ? 'No furniture found' : 'No furniture available'}
                                </h3>
                                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                                    {interiorDesignSearch ? 'Try a different search term' : 'Check back later for new items'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredFurniture.slice(0, 8).map((item) => (
                                    <div key={item.id} className="relative">
                                        {isAuthenticated ? (
                                            <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                                                {/* Action buttons */}
                                                <div className="absolute top-2 right-2 z-10 flex gap-1.5">
                                                    {/* Cart button */}
                                                    <button
                                                        onClick={(e) => addToCart(e, item.id, item.name)}
                                                        disabled={addingToCartId === item.id}
                                                        className={`rounded-full p-1.5 shadow-sm transition-colors ${
                                                            cartFurnitureIds.includes(item.id)
                                                                ? 'bg-green-500 text-white'
                                                                : 'bg-white/90 dark:bg-zinc-800/90 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                                                        }`}
                                                        title={cartFurnitureIds.includes(item.id) ? 'Remove from cart' : 'Add to cart'}
                                                    >
                                                        {addingToCartId === item.id ? (
                                                            <RefreshCw className="h-4 w-4 animate-spin text-orange-600 dark:text-orange-400" />
                                                        ) : cartFurnitureIds.includes(item.id) ? (
                                                            <Check className="h-4 w-4" />
                                                        ) : (
                                                            <ShoppingCart className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                        )}
                                                    </button>
                                                    {/* Save/Bookmark button */}
                                                    <button
                                                        onClick={(e) => toggleSaveFurniture(e, item.id, item.name)}
                                                        disabled={savingFurnitureId === item.id}
                                                        className={`rounded-full p-1.5 shadow-sm transition-colors ${
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
                                                </div>

                                                {/* Image - wrapped in Link */}
                                                <Link href="/interior-design">
                                                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                                                        {item.image ? (
                                                            <img
                                                                src={item.image.startsWith('/storage') || item.image.startsWith('http') ? item.image : `/storage/${item.image}`}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full items-center justify-center">
                                                                <Sofa className="h-16 w-16 text-purple-300 dark:text-purple-700" />
                                                            </div>
                                                        )}
                                                        {item.is_featured && (
                                                            <div className="absolute top-2 left-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-xs font-semibold text-white">
                                                                Featured
                                                            </div>
                                                        )}
                                                        {/* Hover overlay */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                                                            <div className="absolute bottom-3 left-3 right-3">
                                                                <span className="block w-full rounded-lg bg-white/90 py-2 text-center text-sm font-medium text-zinc-900 backdrop-blur-sm">
                                                                    Use in Design
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>

                                                {/* Info */}
                                                <div className="p-3">
                                                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                                                        {item.name}
                                                    </h3>
                                                    <div className="mt-1 flex items-center justify-between">
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                                                            {item.category} • {item.room}
                                                        </span>
                                                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                                            Rs. {item.price.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="group relative w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                                                {/* Action buttons - prompts login */}
                                                <div className="absolute top-2 right-2 z-10 flex gap-1.5">
                                                    {/* Cart button */}
                                                    <button
                                                        onClick={(e) => addToCart(e, item.id, item.name)}
                                                        className="rounded-full bg-white/90 p-1.5 shadow-sm dark:bg-zinc-800/90 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                                                        title="Login to add to cart"
                                                    >
                                                        <ShoppingCart className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                                    </button>
                                                    {/* Save/Bookmark button */}
                                                    <button
                                                        onClick={(e) => toggleSaveFurniture(e, item.id, item.name)}
                                                        className="rounded-full bg-white/90 p-1.5 shadow-sm dark:bg-zinc-800/90 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                                                        title="Login to save"
                                                    >
                                                        <Bookmark className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                                    </button>
                                                </div>

                                                {/* Image */}
                                                <div 
                                                    onClick={handleLockedFeature}
                                                    className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 cursor-pointer"
                                                >
                                                    {item.image ? (
                                                        <img
                                                            src={item.image.startsWith('/storage') || item.image.startsWith('http') ? item.image : `/storage/${item.image}`}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <Sofa className="h-16 w-16 text-purple-300 dark:text-purple-700" />
                                                        </div>
                                                    )}
                                                    {item.is_featured && (
                                                        <div className="absolute top-2 left-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 text-xs font-semibold text-white">
                                                            Featured
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Info */}
                                                <div className="p-3">
                                                    <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                                                        {item.name}
                                                    </h3>
                                                    <div className="mt-1 flex items-center justify-between">
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                                                            {item.category} • {item.room}
                                                        </span>
                                                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                                            Rs. {item.price.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* View All Link */}
                        {filteredFurniture.length > 8 && (
                            <div className="mt-6 text-center">
                                {isAuthenticated ? (
                                    <Link
                                        href="/interior-design"
                                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium dark:text-purple-400 dark:hover:text-purple-300"
                                    >
                                        View all {filteredFurniture.length} items
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </Link>
                                ) : (
                                    <button
                                        onClick={handleLockedFeature}
                                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        Login to view all {filteredFurniture.length} items
                                        <Lock className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* CTA Section for non-authenticated users */}
                    {!isAuthenticated && (
                        <div className="mt-12 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-center text-white">
                            <h2 className="text-2xl font-bold">Ready to Design Your Dream Home?</h2>
                            <p className="mt-2 text-orange-100">
                                Create an account to access all features and save your designs
                            </p>
                            <div className="mt-6 flex flex-wrap justify-center gap-4">
                                <Link
                                    href="/register"
                                    className="rounded-xl bg-white px-8 py-3 font-semibold text-orange-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                                >
                                    Get Started Free
                                </Link>
                                <Link
                                    href="/login"
                                    className="rounded-xl border-2 border-white/30 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Floor Plan Projects Modal */}
            {showFloorPlanProjects && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
                        <div className="flex items-center justify-between border-b border-zinc-200 p-6 dark:border-zinc-800">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Floor Plan Projects</h2>
                            <button
                                onClick={() => setShowFloorPlanProjects(false)}
                                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                            {loadingProjects ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
                                </div>
                            ) : floorPlanProjects.length === 0 ? (
                                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                                    <FolderOpen className="h-12 w-12 text-zinc-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No projects yet</h3>
                                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">Create your first floor plan project</p>
                                    <Link
                                        href="/floor-plan"
                                        className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                                    >
                                        Create Project
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {floorPlanProjects.map((project) => (
                                        <div key={project.id} className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                            {/* Thumbnail */}
                                            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-amber-950/20">
                                                <div className="flex h-full items-center justify-center p-4">
                                                    <div className="relative h-full w-full">
                                                        <div className="absolute inset-0 border-4 border-amber-800/40 dark:border-amber-200/40">
                                                            <div className="absolute left-1/4 top-0 h-2 w-10 bg-amber-600/60 dark:bg-amber-400/60"></div>
                                                            <div className="absolute right-2 top-1/3 h-8 w-2 bg-blue-400/60 dark:bg-blue-500/60"></div>
                                                            <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 bg-amber-700/50 dark:bg-amber-300/50"></div>
                                                        </div>
                                                        <div className="absolute bottom-1 left-1 right-1">
                                                            <div className="rounded bg-black/70 px-2 py-1 text-center backdrop-blur-sm">
                                                                <div className="text-xs font-bold text-white">
                                                                    {project.requirements ? `${project.requirements.plotWidth}m × ${project.requirements.plotDepth}m` : 'Custom'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Project Info */}
                                            <div className="p-4">
                                                <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                                                    {project.name}
                                                </h3>
                                                {project.description && (
                                                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                                        {project.description}
                                                    </p>
                                                )}
                                                <div className="mt-3 flex items-center justify-between">
                                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                        {new Date(project.updated_at).toLocaleDateString()}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleDuplicateProject(project.id)}
                                                            className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                                                            title="Duplicate project"
                                                        >
                                                            <Copy className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProject(project.id)}
                                                            className="rounded p-1 text-zinc-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400"
                                                            title="Delete project"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Interior Design Projects Modal */}
            {showInteriorProjects && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-4xl max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-zinc-900">
                        <div className="flex items-center justify-between border-b border-zinc-200 p-6 dark:border-zinc-800">
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Interior Design Projects</h2>
                            <button
                                onClick={() => setShowInteriorProjects(false)}
                                className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
                            {loadingInteriorProjects ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
                                </div>
                            ) : interiorProjects.length === 0 ? (
                                <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                                    <Palette className="h-12 w-12 text-zinc-400 mb-4" />
                                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">No projects yet</h3>
                                    <p className="mt-1 text-zinc-600 dark:text-zinc-400">Create your first interior design project</p>
                                    <Link
                                        href="/interior-design"
                                        className="mt-4 rounded-lg bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600"
                                    >
                                        Create Project
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {interiorProjects.map((project) => (
                                        <div key={project.id} className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                            {/* Thumbnail */}
                                            <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-purple-100 via-pink-50 to-purple-50 dark:from-purple-950/20 dark:via-pink-950/10 dark:to-purple-950/20">
                                                {project.thumbnail ? (
                                                    <img
                                                        src={project.thumbnail}
                                                        alt={project.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center">
                                                        <Palette className="h-12 w-12 text-purple-300 dark:text-purple-700" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Project Info */}
                                            <div className="p-4">
                                                <h3 className="font-semibold text-zinc-900 dark:text-white truncate">
                                                    {project.name}
                                                </h3>
                                                {project.description && (
                                                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                                        {project.description}
                                                    </p>
                                                )}
                                                <div className="mt-3 flex items-center justify-between">
                                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                        {new Date(project.updated_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                                <Lock className="h-8 w-8 text-orange-600" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900">Login Required</h2>
                            <p className="mt-2 text-zinc-600">
                                Create a free account to access this feature and start designing your dream home.
                            </p>
                        </div>
                        <div className="mt-6 space-y-3">
                            <Link
                                href="/register"
                                className="block w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-center font-semibold text-white shadow-lg transition-all hover:scale-105"
                            >
                                Create Free Account
                            </Link>
                            <Link
                                href="/login"
                                className="block w-full rounded-xl border border-zinc-300 py-3 text-center font-medium text-zinc-700 transition-all hover:bg-zinc-50"
                            >
                                Sign In
                            </Link>
                            <button
                                onClick={() => setShowLoginPrompt(false)}
                                className="block w-full py-2 text-center text-sm text-zinc-500 hover:text-zinc-700"
                            >
                                Continue Browsing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { Copy, FolderOpen, MapPin, Palette, Plus, RefreshCw, Search, Sofa, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
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
    {
        title: 'My Wishlist',
        description: 'Access your favorite designs and floor plans. Keep track of inspirations and saved projects.',
        href: '/wishlist',
        emoji: '❤️',
        gradient: 'from-red-50 to-red-100/50',
    },
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

export default function Dashboard() {
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

    // Load interior design projects
    const loadInteriorProjects = async () => {
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

    // Filter furniture based on search
    const filteredFurniture = furnitureItems.filter(item =>
        item.name.toLowerCase().includes(interiorDesignSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(interiorDesignSearch.toLowerCase()) ||
        item.room.toLowerCase().includes(interiorDesignSearch.toLowerCase())
    );

    // Load floor plan projects
    const loadFloorPlanProjects = async () => {
        setLoadingProjects(true);
        try {
            const response = await axios.get('/api/floor-plan-projects');
            setFloorPlanProjects(response.data);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    // Delete a project
    const handleDeleteProject = async (projectId: number) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        
        try {
            await axios.delete(`/api/floor-plan-projects/${projectId}`);
            setFloorPlanProjects(prev => prev.filter(p => p.id !== projectId));
        } catch (error) {
            console.error('Failed to delete project:', error);
            alert('Failed to delete project. Please try again.');
        }
    };

    // Duplicate a project
    const handleDuplicateProject = async (projectId: number) => {
        try {
            const response = await axios.post(`/api/floor-plan-projects/${projectId}/duplicate`);
            setFloorPlanProjects(prev => [response.data, ...prev]);
        } catch (error) {
            console.error('Failed to duplicate project:', error);
            alert('Failed to duplicate project. Please try again.');
        }
    };

    // Measurement system options
    const measurementOptions: { value: MeasurementSystem; label: string; icon: string; region: string }[] = [
        { value: 'ropani', label: 'Ropani', icon: '🏔️', region: 'Nepal (Hill)' },
        { value: 'bigha', label: 'Bigha', icon: '🌾', region: 'Nepal (Terai)' },
        { value: 'international', label: 'International', icon: '🌍', region: 'm² / sq ft' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-orange-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
                {/* Hero Section with Quick Actions */}
                <div className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
                    <div className="mx-auto max-w-7xl px-6 py-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                                    My Projects
                                </h1>
                                <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                                    Create stunning floor plans and home designs
                                </p>
                            </div>
                            
                            {/* Quick Action Buttons */}
                            <div className="flex flex-wrap gap-3">
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
                            </div>
                        </div>

                        {/* Quick Start Cards */}
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {quickLinks.map((card) => (
                                <Link
                                    key={card.title}
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

                    {/* Interior Designs Section */}
                    <div className="mt-8">
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
                                    <Link
                                        key={item.id}
                                        href="/interior-design"
                                        className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                                    >
                                        {/* Image */}
                                        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                                            {item.image ? (
                                                <img
                                                    src={item.image.startsWith('http') ? item.image : `/storage/${item.image}`}
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
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* View All Link */}
                        {filteredFurniture.length > 8 && (
                            <div className="mt-6 text-center">
                                <Link
                                    href="/interior-design"
                                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                                >
                                    View all {filteredFurniture.length} items
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Interior Design Projects Modal */}
            {showInteriorProjects && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl bg-white shadow-xl flex flex-col dark:bg-zinc-900">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">My Interior Design Projects</h2>
                            <button
                                onClick={() => setShowInteriorProjects(false)}
                                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <X className="h-5 w-5 text-zinc-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingInteriorProjects ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
                                </div>
                            ) : interiorProjects.length === 0 ? (
                                <div className="text-center py-12">
                                    <Palette className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                                    <p className="text-zinc-500 dark:text-zinc-400">No saved projects yet</p>
                                    <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Create and save an interior design to see it here</p>
                                    <Link
                                        href="/interior-design"
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create New
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {interiorProjects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="rounded-xl border border-zinc-200 p-4 transition hover:shadow-md dark:border-zinc-700"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-zinc-900 dark:text-white">{project.name}</h3>
                                                    {project.description && (
                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{project.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                                                        <span>
                                                            Updated: {new Date(project.updated_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Link
                                                    href={`/interior-design/${project.id}`}
                                                    className="rounded-lg p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                                                    title="Open project"
                                                >
                                                    <FolderOpen className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                            <button
                                onClick={() => setShowInteriorProjects(false)}
                                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                Close
                            </button>
                            <Link
                                href="/interior-design"
                                className="flex-1 rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white text-center hover:bg-purple-600"
                            >
                                Create New Project
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Floor Plan Projects Modal */}
            {showFloorPlanProjects && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-2xl max-h-[80vh] rounded-2xl bg-white shadow-xl flex flex-col dark:bg-zinc-900">
                        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">My Floor Plan Projects</h2>
                            <button
                                onClick={() => setShowFloorPlanProjects(false)}
                                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <X className="h-5 w-5 text-zinc-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingProjects ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
                                </div>
                            ) : floorPlanProjects.length === 0 ? (
                                <div className="text-center py-12">
                                    <FolderOpen className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                                    <p className="text-zinc-500 dark:text-zinc-400">No saved projects yet</p>
                                    <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1">Create and save a floor plan to see it here</p>
                                    <Link
                                        href="/floor-plan"
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Create New
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {floorPlanProjects.map((project) => (
                                        <div
                                            key={project.id}
                                            className="rounded-xl border border-zinc-200 p-4 transition hover:shadow-md dark:border-zinc-700"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-zinc-900 dark:text-white">{project.name}</h3>
                                                    {project.description && (
                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{project.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                                                        <span>
                                                            {project.requirements?.plotWidth}m × {project.requirements?.plotDepth}m
                                                        </span>
                                                        <span>
                                                            {project.requirements?.bedrooms?.length || 0} bed, {project.requirements?.bathrooms?.length || 0} bath
                                                        </span>
                                                        <span>
                                                            Updated: {new Date(project.updated_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 ml-4">
                                                    <Link
                                                        href={`/floor-plan/${project.id}`}
                                                        className="rounded-lg p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                                                        title="Open project"
                                                    >
                                                        <FolderOpen className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDuplicateProject(project.id)}
                                                        className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                                                        title="Duplicate project"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProject(project.id)}
                                                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                                        title="Delete project"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
                            <button
                                onClick={() => setShowFloorPlanProjects(false)}
                                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            >
                                Close
                            </button>
                            <Link
                                href="/floor-plan"
                                className="flex-1 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white text-center hover:bg-orange-600"
                            >
                                Create New Project
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

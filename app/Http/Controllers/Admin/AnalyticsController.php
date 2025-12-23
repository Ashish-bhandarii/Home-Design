<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Furniture;
use App\Models\Material;
use App\Models\User;
use App\Models\InteriorDesign;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function index()
    {
        // Get counts
        $totalUsers = User::count();
        $totalFurniture = Furniture::count();
        $totalMaterials = Material::count();
        $totalDesigns = class_exists(InteriorDesign::class) ? InteriorDesign::count() : 0;

        // Active counts
        $activeFurniture = Furniture::where('is_active', true)->count();
        $activeMaterials = Material::where('is_active', true)->count();
        $featuredFurniture = Furniture::where('is_featured', true)->count();
        $featuredMaterials = Material::where('is_featured', true)->count();

        // Recent users (last 30 days)
        $recentUsers = User::where('created_at', '>=', Carbon::now()->subDays(30))->count();

        // User growth data (last 6 months)
        $userGrowth = User::select(
            DB::raw('MONTH(created_at) as month'),
            DB::raw('YEAR(created_at) as year'),
            DB::raw('COUNT(*) as count')
        )
            ->where('created_at', '>=', Carbon::now()->subMonths(6))
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::createFromDate($item->year, $item->month, 1)->format('M Y'),
                    'users' => $item->count,
                ];
            });

        // Furniture by category
        $furnitureByCategory = Furniture::select('category', DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->orderByDesc('count')
            ->get();

        // Furniture by room
        $furnitureByRoom = Furniture::select('room', DB::raw('COUNT(*) as count'))
            ->groupBy('room')
            ->orderByDesc('count')
            ->get();

        // Materials by category
        $materialsByCategory = Material::select('category', DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->orderByDesc('count')
            ->get();

        // Materials by type
        $materialsByType = Material::select('type', DB::raw('COUNT(*) as count'))
            ->groupBy('type')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        // Price ranges for furniture
        $furniturePriceRanges = [
            ['range' => 'Under NPR 10K', 'count' => Furniture::where('price', '<', 10000)->count()],
            ['range' => 'NPR 10K - 25K', 'count' => Furniture::whereBetween('price', [10000, 25000])->count()],
            ['range' => 'NPR 25K - 50K', 'count' => Furniture::whereBetween('price', [25000, 50000])->count()],
            ['range' => 'NPR 50K - 100K', 'count' => Furniture::whereBetween('price', [50000, 100000])->count()],
            ['range' => 'Over NPR 100K', 'count' => Furniture::where('price', '>', 100000)->count()],
        ];

        // Top priced furniture
        $topFurniture = Furniture::orderByDesc('price')
            ->limit(5)
            ->get(['id', 'name', 'category', 'price', 'is_active']);

        // Top priced materials
        $topMaterials = Material::orderByDesc('price_per_unit')
            ->limit(5)
            ->get(['id', 'name', 'category', 'price_per_unit', 'unit', 'is_active']);

        // Stock status
        $lowStockFurniture = Furniture::where('stock', '<', 10)->where('stock', '>', 0)->count();
        $outOfStockFurniture = Furniture::where('stock', 0)->count();

        // Recent items
        $recentFurniture = Furniture::latest()->limit(5)->get(['id', 'name', 'category', 'created_at']);
        $recentMaterials = Material::latest()->limit(5)->get(['id', 'name', 'category', 'created_at']);

        return Inertia::render('admin/analytics', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalFurniture' => $totalFurniture,
                'totalMaterials' => $totalMaterials,
                'totalDesigns' => $totalDesigns,
                'activeFurniture' => $activeFurniture,
                'activeMaterials' => $activeMaterials,
                'featuredFurniture' => $featuredFurniture,
                'featuredMaterials' => $featuredMaterials,
                'recentUsers' => $recentUsers,
                'lowStockFurniture' => $lowStockFurniture,
                'outOfStockFurniture' => $outOfStockFurniture,
            ],
            'userGrowth' => $userGrowth,
            'furnitureByCategory' => $furnitureByCategory,
            'furnitureByRoom' => $furnitureByRoom,
            'materialsByCategory' => $materialsByCategory,
            'materialsByType' => $materialsByType,
            'furniturePriceRanges' => $furniturePriceRanges,
            'topFurniture' => $topFurniture,
            'topMaterials' => $topMaterials,
            'recentFurniture' => $recentFurniture,
            'recentMaterials' => $recentMaterials,
        ]);
    }
}

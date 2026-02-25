<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\HomeDesign;
use App\Models\InteriorDesign;
use App\Models\Furniture;
use App\Models\Material;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'totalUsers' => User::count(),
            'totalDesigns' => HomeDesign::count() + InteriorDesign::count(),
            'totalHomeDesigns' => HomeDesign::count(),
            'totalInteriorDesigns' => InteriorDesign::count(),
            'totalFurniture' => Furniture::count(),
            'totalMaterials' => Material::count(),
            'usersChange' => $this->calculatePercentageChange(User::class),
            'designsChange' => $this->calculateDesignsChange(),
        ];

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
        ]);
    }

    private function calculatePercentageChange(string $model): float
    {
        $now = now();
        $thisMonth = $model::whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->count();
        
        $lastMonth = $model::whereMonth('created_at', $now->subMonth()->month)
            ->whereYear('created_at', $now->year)
            ->count();

        if ($lastMonth === 0) {
            return $thisMonth > 0 ? 100 : 0;
        }

        return round((($thisMonth - $lastMonth) / $lastMonth) * 100, 1);
    }

    private function calculateDesignsChange(): float
    {
        $now = now();
        
        $thisMonthHome = HomeDesign::whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->count();
        $thisMonthInterior = InteriorDesign::whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->count();
        $thisMonth = $thisMonthHome + $thisMonthInterior;

        $lastMonthNow = now()->subMonth();
        $lastMonthHome = HomeDesign::whereMonth('created_at', $lastMonthNow->month)
            ->whereYear('created_at', $lastMonthNow->year)
            ->count();
        $lastMonthInterior = InteriorDesign::whereMonth('created_at', $lastMonthNow->month)
            ->whereYear('created_at', $lastMonthNow->year)
            ->count();
        $lastMonth = $lastMonthHome + $lastMonthInterior;

        if ($lastMonth === 0) {
            return $thisMonth > 0 ? 100 : 0;
        }

        return round((($thisMonth - $lastMonth) / $lastMonth) * 100, 1);
    }
}

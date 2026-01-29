<?php

namespace App\Http\Controllers\Designer;

use App\Http\Controllers\Controller;
use App\Models\DesignerBooking;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the designer dashboard
     */
    public function index()
    {
        $designer = Auth::user();
        
        // Get booking statistics
        $todayBookings = DesignerBooking::where('designer_id', $designer->id)
            ->whereDate('booking_date', today())
            ->whereIn('status', ['pending', 'confirmed'])
            ->with('user:id,name,email')
            ->orderBy('booking_time')
            ->get();

        $upcomingBookings = DesignerBooking::where('designer_id', $designer->id)
            ->where('booking_date', '>', today())
            ->whereIn('status', ['pending', 'confirmed'])
            ->with('user:id,name,email')
            ->orderBy('booking_date')
            ->orderBy('booking_time')
            ->limit(5)
            ->get();

        $stats = [
            'total_bookings' => DesignerBooking::where('designer_id', $designer->id)->count(),
            'pending_bookings' => DesignerBooking::where('designer_id', $designer->id)->where('status', 'pending')->count(),
            'confirmed_bookings' => DesignerBooking::where('designer_id', $designer->id)->where('status', 'confirmed')->count(),
            'completed_bookings' => DesignerBooking::where('designer_id', $designer->id)->where('status', 'completed')->count(),
            'this_month_earnings' => DesignerBooking::where('designer_id', $designer->id)
                ->where('status', 'completed')
                ->whereMonth('booking_date', now()->month)
                ->whereYear('booking_date', now()->year)
                ->sum('price'),
            'total_earnings' => DesignerBooking::where('designer_id', $designer->id)
                ->where('status', 'completed')
                ->sum('price'),
        ];

        return Inertia::render('designer/dashboard', [
            'designer' => [
                'id' => $designer->id,
                'name' => $designer->name,
                'email' => $designer->email,
                'specialty' => $designer->specialty,
                'bio' => $designer->bio,
                'hourly_rate' => $designer->hourly_rate,
                'experience_years' => $designer->experience_years,
                'portfolio_url' => $designer->portfolio_url,
                'avatar' => $designer->avatar,
                'is_available' => $designer->is_available,
            ],
            'todayBookings' => $todayBookings,
            'upcomingBookings' => $upcomingBookings,
            'stats' => $stats,
        ]);
    }
}

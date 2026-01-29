<?php

namespace App\Http\Controllers\Designer;

use App\Http\Controllers\Controller;
use App\Models\DesignerBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    /**
     * Show the designer's profile
     */
    public function index()
    {
        $designer = Auth::user();

        // Get booking stats
        $totalBookings = DesignerBooking::where('designer_id', $designer->id)->count();
        $completedBookings = DesignerBooking::where('designer_id', $designer->id)
            ->where('status', 'completed')
            ->count();
        $totalEarnings = DesignerBooking::where('designer_id', $designer->id)
            ->where('status', 'completed')
            ->sum('price');

        return Inertia::render('designer/profile', [
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
                'work_start_time' => $designer->work_start_time ?? '09:00',
                'work_end_time' => $designer->work_end_time ?? '18:00',
                'slot_duration' => $designer->slot_duration ?? 60,
                'working_days' => $designer->working_days ?? [1, 2, 3, 4, 5],
                'rating' => $designer->rating,
                'total_reviews' => $designer->total_reviews,
                'created_at' => $designer->created_at,
            ],
            'stats' => [
                'total_bookings' => $totalBookings,
                'completed_bookings' => $completedBookings,
                'total_earnings' => $totalEarnings ?? 0,
            ],
        ]);
    }

    /**
     * Update the designer's profile
     */
    public function update(Request $request)
    {
        $designer = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'specialty' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'hourly_rate' => 'nullable|numeric|min:0',
            'experience_years' => 'nullable|integer|min:0',
            'portfolio_url' => 'nullable|url|max:255',
            'is_available' => 'boolean',
        ]);

        $designer->update($validated);

        return back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update availability settings (working hours, days, slot duration)
     */
    public function updateAvailability(Request $request)
    {
        $designer = Auth::user();

        $validated = $request->validate([
            'work_start_time' => 'required|date_format:H:i',
            'work_end_time' => 'required|date_format:H:i|after:work_start_time',
            'slot_duration' => 'required|integer|in:30,60,90,120',
            'working_days' => 'required|array|min:1',
            'working_days.*' => 'integer|between:0,6',
        ]);

        $designer->update($validated);

        return back()->with('success', 'Availability settings updated successfully.');
    }

    /**
     * Toggle availability status
     */
    public function toggleAvailability()
    {
        $designer = Auth::user();
        $designer->update(['is_available' => !$designer->is_available]);

        $status = $designer->is_available ? 'available' : 'unavailable';
        return back()->with('success', "You are now {$status} for bookings.");
    }

    /**
     * Upload avatar
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $designer = Auth::user();

        // Delete old avatar if exists
        if ($designer->avatar) {
            // Remove the /storage/ prefix to get the correct path
            $oldPath = str_replace('/storage/', '', $designer->avatar);
            Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $designer->update(['avatar' => '/storage/' . $path]);

        return back()->with('success', 'Avatar updated successfully.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\AdminNotification;
use App\Models\DesignerBooking;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DesignerBookingController extends Controller
{
    /**
     * Display list of designers available for hire
     */
    public function index()
    {
        $designers = User::role('designer')
            ->where('is_available', true)
            ->select(['id', 'name', 'email', 'specialty', 'bio', 'hourly_rate', 'experience_years', 'portfolio_url', 'avatar'])
            ->get();

        return Inertia::render('user/designers', [
            'designers' => $designers,
        ]);
    }

    /**
     * Show booking form for a specific designer
     */
    public function show(User $designer)
    {
        if (!$designer->hasRole('designer')) {
            abort(404);
        }

        // Get booked slots for the next 30 days (confirmed OR pending - both are unavailable)
        $bookedSlots = DesignerBooking::where('designer_id', $designer->id)
            ->where('booking_date', '>=', now()->toDateString())
            ->where('booking_date', '<=', now()->addDays(30)->toDateString())
            ->whereIn('status', ['confirmed', 'pending'])
            ->get(['booking_date', 'booking_time'])
            ->groupBy(fn($booking) => $booking->booking_date->format('Y-m-d'))
            ->map(fn($bookings) => $bookings->pluck('booking_time')->map(fn($t) => Carbon::parse($t)->format('H:i'))->toArray())
            ->toArray();

        return Inertia::render('user/designers/book', [
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
                'work_start_time' => $designer->work_start_time ?? '09:00',
                'work_end_time' => $designer->work_end_time ?? '18:00',
                'slot_duration' => $designer->slot_duration ?? 60,
                'working_days' => $designer->working_days ?? [1, 2, 3, 4, 5],
            ],
            'bookedSlots' => $bookedSlots,
        ]);
    }

    /**
     * Store a new booking
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'designer_id' => 'required|exists:users,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'booking_time' => 'required|date_format:H:i',
            'consultation_type' => 'required|in:online,in-person',
            'project_type' => 'required|string|max:100',
            'description' => 'required|string|max:1000',
            'duration_minutes' => 'nullable|integer|in:30,60,90,120',
        ]);

        // Check if the designer exists and is a designer
        $designer = User::findOrFail($validated['designer_id']);
        if (!$designer->hasRole('designer')) {
            return back()->with('error', 'Invalid designer selected.');
        }

        // Validate booking date is not in the past
        $bookingDateTime = Carbon::parse($validated['booking_date'] . ' ' . $validated['booking_time']);
        if ($bookingDateTime->isPast()) {
            return back()->with('error', 'Cannot book a time slot in the past.');
        }

        // Validate booking is within designer's working hours
        $workStartTime = $designer->work_start_time ?? '09:00';
        $workEndTime = $designer->work_end_time ?? '18:00';
        $workingDays = $designer->working_days ?? [1, 2, 3, 4, 5];
        
        $bookingTime = Carbon::parse($validated['booking_time']);
        $startTime = Carbon::parse($workStartTime);
        $endTime = Carbon::parse($workEndTime);
        
        if ($bookingTime->lt($startTime) || $bookingTime->gte($endTime)) {
            return back()->with('error', 'Booking time must be within designer\'s working hours (' . $startTime->format('g:i A') . ' - ' . $endTime->format('g:i A') . ').');
        }

        // Validate booking is on a working day
        $bookingDayOfWeek = Carbon::parse($validated['booking_date'])->dayOfWeek;
        if (!in_array($bookingDayOfWeek, $workingDays)) {
            return back()->with('error', 'The designer does not work on this day.');
        }

        // Check if slot already has a booking (confirmed or pending)
        $existingBooking = DesignerBooking::where('designer_id', $validated['designer_id'])
            ->where('booking_date', $validated['booking_date'])
            ->where('booking_time', $validated['booking_time'])
            ->whereIn('status', ['pending', 'confirmed'])
            ->first();

        if ($existingBooking) {
            if ($existingBooking->status === 'confirmed') {
                return back()->with('error', 'This time slot is already confirmed. Please choose another time.');
            }
            return back()->with('error', 'This time slot already has a pending booking. Please choose another time or wait for it to be processed.');
        }

        // Calculate price based on designer's hourly rate
        $durationMinutes = $validated['duration_minutes'] ?? 60;
        $price = $designer->hourly_rate ? ($designer->hourly_rate * $durationMinutes / 60) : null;

        // Create the booking
        $booking = DesignerBooking::create([
            'user_id' => Auth::id(),
            'designer_id' => $validated['designer_id'],
            'booking_date' => $validated['booking_date'],
            'booking_time' => $validated['booking_time'],
            'duration_minutes' => $durationMinutes,
            'consultation_type' => $validated['consultation_type'],
            'project_type' => $validated['project_type'],
            'description' => $validated['description'],
            'status' => 'pending',
            'price' => $price,
        ]);

        // Create notification for admin
        AdminNotification::create([
            'type' => 'booking',
            'title' => 'New Designer Booking',
            'message' => Auth::user()->name . ' has booked a consultation with ' . $designer->name . ' on ' . Carbon::parse($validated['booking_date'])->format('M d, Y') . ' at ' . $validated['booking_time'],
            'icon' => 'User',
            'color' => 'purple',
            'link' => '/admin/bookings/' . $booking->id,
            'data' => [
                'booking_id' => $booking->id,
                'user_name' => Auth::user()->name,
                'designer_name' => $designer->name,
            ],
        ]);

        return redirect()->route('my-bookings')->with('success', 'Booking request submitted successfully! The designer will confirm your appointment.');
    }

    /**
     * Show user's bookings
     */
    public function myBookings(Request $request)
    {
        $filter = $request->get('filter', 'all');
        
        $query = DesignerBooking::where('user_id', Auth::id())
            ->with(['designer:id,name,email,specialty,avatar']);

        // Apply filters
        if ($filter === 'upcoming') {
            $query->where('booking_date', '>=', now()->toDateString())
                  ->whereIn('status', ['pending', 'confirmed']);
        } elseif (in_array($filter, ['pending', 'confirmed', 'completed', 'cancelled'])) {
            $query->where('status', $filter);
        }

        $bookings = $query->orderBy('booking_date', 'desc')
            ->orderBy('booking_time', 'desc')
            ->paginate(10);

        return Inertia::render('user/my-bookings', [
            'bookings' => $bookings,
            'filter' => $filter,
        ]);
    }

    /**
     * Cancel a booking
     */
    public function cancel(DesignerBooking $booking)
    {
        if ($booking->user_id !== Auth::id()) {
            abort(403);
        }

        if (!$booking->canBeCancelled()) {
            return back()->with('error', 'This booking cannot be cancelled.');
        }

        // Check if booking is at least 24 hours away
        $bookingDateTime = Carbon::parse($booking->booking_date->format('Y-m-d') . ' ' . $booking->booking_time);
        if ($bookingDateTime->diffInHours(now()) < 24) {
            return back()->with('error', 'Bookings can only be cancelled at least 24 hours in advance.');
        }

        $booking->update(['status' => 'cancelled']);

        return back()->with('success', 'Booking cancelled successfully.');
    }
}

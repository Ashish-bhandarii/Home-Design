<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DesignerBooking;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display all bookings
     */
    public function index(Request $request)
    {
        $query = DesignerBooking::with(['user:id,name,email', 'designer:id,name,email,specialty']);

        // Filter by status
        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        // Filter by designer
        if ($designerId = $request->input('designer_id')) {
            $query->where('designer_id', $designerId);
        }

        // Search
        if ($search = $request->string('search')->toString()) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })->orWhereHas('designer', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            });
        }

        $bookings = $query->orderByDesc('booking_date')
            ->orderByDesc('booking_time')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/bookings/index', [
            'bookings' => $bookings,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show a specific booking
     */
    public function show(DesignerBooking $booking)
    {
        $booking->load(['user', 'designer']);

        return Inertia::render('admin/bookings/show', [
            'booking' => $booking,
        ]);
    }

    /**
     * Update booking status
     */
    public function updateStatus(Request $request, DesignerBooking $booking)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,completed,cancelled',
            'notes' => 'nullable|string|max:1000',
            'meeting_link' => 'nullable|url|max:255',
        ]);

        // If confirming a booking, cancel any other pending bookings for the same slot
        if ($validated['status'] === 'confirmed') {
            // Use getRawOriginal to avoid cast issues with booking_time
            $bookingTime = $booking->getRawOriginal('booking_time');
            
            // Check if there's already a confirmed booking for this slot
            $existingConfirmed = DesignerBooking::where('designer_id', $booking->designer_id)
                ->where('booking_date', $booking->booking_date)
                ->where('booking_time', $bookingTime)
                ->where('status', 'confirmed')
                ->where('id', '!=', $booking->id)
                ->exists();

            if ($existingConfirmed) {
                return back()->with('error', 'This time slot already has a confirmed booking. Cannot confirm.');
            }

            // Cancel all other pending bookings for the same date/time
            DesignerBooking::where('designer_id', $booking->designer_id)
                ->where('booking_date', $booking->booking_date)
                ->where('booking_time', $bookingTime)
                ->where('status', 'pending')
                ->where('id', '!=', $booking->id)
                ->update([
                    'status' => 'cancelled',
                    'notes' => 'Automatically cancelled: Another booking was confirmed for this time slot.',
                ]);
        }

        $booking->update($validated);

        return back()->with('success', 'Booking status updated successfully.');
    }

    /**
     * Delete a booking
     */
    public function destroy(DesignerBooking $booking)
    {
        $booking->delete();

        return back()->with('success', 'Booking deleted successfully.');
    }
}


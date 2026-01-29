<?php

namespace App\Http\Controllers\Designer;

use App\Http\Controllers\Controller;
use App\Mail\BookingConfirmed;
use App\Models\DesignerBooking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Display all bookings for the designer
     */
    public function index(Request $request)
    {
        $designer = Auth::user();
        $filter = $request->get('filter', 'all');

        $query = DesignerBooking::where('designer_id', $designer->id)
            ->with('user:id,name,email');

        // Apply filters
        if ($filter === 'upcoming') {
            $query->where('booking_date', '>=', now()->toDateString())
                  ->whereIn('status', ['pending', 'confirmed']);
        } elseif ($filter === 'today') {
            $query->whereDate('booking_date', today());
        } elseif (in_array($filter, ['pending', 'confirmed', 'completed', 'cancelled'])) {
            $query->where('status', $filter);
        }

        $bookings = $query->orderBy('booking_date', 'desc')
            ->orderBy('booking_time', 'desc')
            ->paginate(15);

        return Inertia::render('designer/bookings', [
            'bookings' => $bookings,
            'filter' => $filter,
        ]);
    }

    /**
     * Show a specific booking
     */
    public function show(DesignerBooking $booking)
    {
        // Ensure the booking belongs to this designer
        if ($booking->designer_id !== Auth::id()) {
            abort(403);
        }

        $booking->load('user');

        return Inertia::render('designer/booking-details', [
            'booking' => $booking,
        ]);
    }

    /**
     * Confirm a booking
     */
    public function confirm(Request $request, DesignerBooking $booking)
    {
        if ($booking->designer_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'meeting_link' => 'nullable|url|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        // Check if there's already a confirmed booking for this slot
        // Use getRawOriginal to avoid cast issues with booking_time
        $bookingTime = $booking->getRawOriginal('booking_time');
        
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

        $booking->update([
            'status' => 'confirmed',
            'meeting_link' => $validated['meeting_link'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Load booking with relations and send confirmation email
        $booking->load(['user', 'designer']);
        
        // Send confirmation email (wrapped in try-catch to not block the confirmation)
        try {
            if ($booking->user && $booking->user->email) {
                Mail::to($booking->user->email)->send(new BookingConfirmed($booking));
            }
        } catch (\Exception $e) {
            // Log the error but don't fail the confirmation
            \Log::error('Failed to send booking confirmation email: ' . $e->getMessage());
        }

        return back()->with('success', 'Booking confirmed successfully.');
    }

    /**
     * Complete a booking
     */
    public function complete(Request $request, DesignerBooking $booking)
    {
        if ($booking->designer_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $booking->update([
            'status' => 'completed',
            'notes' => $validated['notes'] ?? $booking->notes,
        ]);

        return back()->with('success', 'Booking marked as completed.');
    }

    /**
     * Cancel a booking
     */
    public function cancel(Request $request, DesignerBooking $booking)
    {
        if ($booking->designer_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $booking->update([
            'status' => 'cancelled',
            'notes' => $validated['notes'] ?? 'Cancelled by designer.',
        ]);

        return back()->with('success', 'Booking cancelled successfully.');
    }

    /**
     * Update booking notes
     */
    public function updateNotes(Request $request, DesignerBooking $booking)
    {
        if ($booking->designer_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'notes' => 'required|string|max:1000',
        ]);

        $booking->update(['notes' => $validated['notes']]);

        return back()->with('success', 'Notes updated successfully.');
    }
}

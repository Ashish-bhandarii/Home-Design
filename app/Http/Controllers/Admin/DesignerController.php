<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DesignerBooking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class DesignerController extends Controller
{
    /**
     * Display all designers
     */
    public function index(Request $request)
    {
        $query = User::role('designer');

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('specialty', 'like', "%{$search}%");
            });
        }

        $designers = $query->orderByDesc('id')->paginate(15)->withQueryString();

        return Inertia::render('admin/designers/index', [
            'designers' => $designers,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Show form to create a new designer
     */
    public function create()
    {
        return Inertia::render('admin/designers/create');
    }

    /**
     * Store a new designer
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'specialty' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'hourly_rate' => 'nullable|numeric|min:0',
            'experience_years' => 'nullable|integer|min:0',
            'portfolio_url' => 'nullable|url|max:255',
            'is_available' => 'boolean',
        ]);

        $designer = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'designer',
            'specialty' => $validated['specialty'],
            'bio' => $validated['bio'] ?? null,
            'hourly_rate' => $validated['hourly_rate'] ?? null,
            'experience_years' => $validated['experience_years'] ?? null,
            'portfolio_url' => $validated['portfolio_url'] ?? null,
            'is_available' => $validated['is_available'] ?? true,
            'email_verified_at' => now(), // Auto-verify designer accounts created by admin
        ]);

        // Assign the designer role
        $designer->assignRole('designer');

        return redirect()->route('admin.designers.index')->with('success', 'Designer created successfully.');
    }

    /**
     * Show form to edit a designer
     */
    public function edit(User $designer)
    {
        if (!$designer->hasRole('designer')) {
            abort(404);
        }

        return Inertia::render('admin/designers/edit', [
            'designer' => $designer,
        ]);
    }

    /**
     * Update a designer
     */
    public function update(Request $request, User $designer)
    {
        if (!$designer->hasRole('designer')) {
            abort(404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $designer->id,
            'specialty' => 'required|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'hourly_rate' => 'nullable|numeric|min:0',
            'experience_years' => 'nullable|integer|min:0',
            'portfolio_url' => 'nullable|url|max:255',
            'is_available' => 'boolean',
        ]);

        $designer->update($validated);

        return redirect()->route('admin.designers.index')->with('success', 'Designer updated successfully.');
    }

    /**
     * Delete a designer
     */
    public function destroy(User $designer)
    {
        if (!$designer->hasRole('designer')) {
            abort(404);
        }

        $designer->delete();

        return back()->with('success', 'Designer deleted successfully.');
    }

    /**
     * Toggle designer availability
     */
    public function toggleAvailability(User $designer)
    {
        if (!$designer->hasRole('designer')) {
            abort(404);
        }

        $designer->update(['is_available' => !$designer->is_available]);

        return back()->with('success', 'Designer availability updated.');
    }

    /**
     * Upload designer avatar
     */
    public function uploadAvatar(Request $request, User $designer)
    {
        if (!$designer->hasRole('designer')) {
            abort(404);
        }

        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Delete old avatar if exists
        if ($designer->avatar) {
            $oldPath = str_replace('/storage/', '', $designer->avatar);
            Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $designer->update(['avatar' => '/storage/' . $path]);

        return back()->with('success', 'Avatar updated successfully.');
    }

    /**
     * Update designer availability settings
     */
    public function updateAvailability(Request $request, User $designer)
    {
        if (!$designer->hasRole('designer')) {
            abort(404);
        }

        $validated = $request->validate([
            'work_start_time' => 'required|date_format:H:i',
            'work_end_time' => 'required|date_format:H:i|after:work_start_time',
            'slot_duration' => 'required|integer|in:30,60,90,120',
            'working_days' => 'required|array|min:1',
            'working_days.*' => 'integer|min:0|max:6',
        ]);

        $designer->update($validated);

        return back()->with('success', 'Availability settings updated successfully.');
    }
}

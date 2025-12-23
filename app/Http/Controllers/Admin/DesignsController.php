<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Design;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DesignsController extends Controller
{
    /**
     * Display a listing of designs.
     */
    public function index(Request $request)
    {
        $query = Design::query();

        // Filter by type
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%")
                  ->orWhere('category', 'like', "%{$request->search}%");
            });
        }

        $designs = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('admin/designs/index', [
            'designs' => $designs,
            'filters' => $request->only(['type', 'status', 'search']),
        ]);
    }

    /**
     * Show the form for creating a new design.
     */
    public function create()
    {
        return Inertia::render('admin/designs/create');
    }

    /**
     * Store a newly created design.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:floor_plan,home_design,interior_design',
            'category' => 'nullable|string|max:100',
            'thumbnail' => 'nullable|image|max:2048',
            'images.*' => 'nullable|image|max:2048',
            'features' => 'nullable|array',
            'dimensions' => 'nullable|string|max:100',
            'rooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            $validated['thumbnail'] = $request->file('thumbnail')->store('designs/thumbnails', 'public');
        }

        // Handle multiple images upload
        if ($request->hasFile('images')) {
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('designs/images', 'public');
            }
            $validated['images'] = $imagePaths;
        }

        Design::create($validated);

        return redirect()->route('admin.designs.index')
            ->with('success', 'Design created successfully.');
    }

    /**
     * Show the form for editing a design.
     */
    public function edit(Design $design)
    {
        return Inertia::render('admin/designs/edit', [
            'design' => $design,
        ]);
    }

    /**
     * Update the specified design.
     */
    public function update(Request $request, Design $design)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:floor_plan,home_design,interior_design',
            'category' => 'nullable|string|max:100',
            'thumbnail' => 'nullable|image|max:2048',
            'images.*' => 'nullable|image|max:2048',
            'features' => 'nullable|array',
            'dimensions' => 'nullable|string|max:100',
            'rooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail
            if ($design->thumbnail) {
                Storage::disk('public')->delete($design->thumbnail);
            }
            $validated['thumbnail'] = $request->file('thumbnail')->store('designs/thumbnails', 'public');
        }

        // Handle multiple images upload
        if ($request->hasFile('images')) {
            // Delete old images
            if ($design->images) {
                foreach ($design->images as $oldImage) {
                    Storage::disk('public')->delete($oldImage);
                }
            }
            $imagePaths = [];
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('designs/images', 'public');
            }
            $validated['images'] = $imagePaths;
        }

        $design->update($validated);

        return redirect()->route('admin.designs.index')
            ->with('success', 'Design updated successfully.');
    }

    /**
     * Remove the specified design.
     */
    public function destroy(Design $design)
    {
        // Delete thumbnail
        if ($design->thumbnail) {
            Storage::disk('public')->delete($design->thumbnail);
        }

        // Delete images
        if ($design->images) {
            foreach ($design->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $design->delete();

        return redirect()->route('admin.designs.index')
            ->with('success', 'Design deleted successfully.');
    }

    /**
     * Toggle featured status.
     */
    public function toggleFeatured(Design $design)
    {
        $design->update(['is_featured' => !$design->is_featured]);

        return back()->with('success', 'Featured status updated.');
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(Design $design)
    {
        $design->update(['is_active' => !$design->is_active]);

        return back()->with('success', 'Active status updated.');
    }
}

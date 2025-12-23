<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DesignFile;
use App\Models\DesignImage;
use App\Models\InteriorDesign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InteriorDesignsController extends Controller
{
    /**
     * Display a listing of interior designs.
     */
    public function index(Request $request)
    {
        $query = InteriorDesign::query();

        // Filter by room type
        if ($request->filled('room_type')) {
            $query->where('room_type', $request->room_type);
        }

        // Filter by style
        if ($request->filled('style')) {
            $query->where('style', $request->style);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%")
                  ->orWhere('room_type', 'like', "%{$request->search}%");
            });
        }

        $designs = $query->latest()->paginate(12)->withQueryString();

        return Inertia::render('admin/interior-designs/index', [
            'designs' => $designs,
            'filters' => $request->only(['room_type', 'style', 'status', 'search']),
            'roomTypeOptions' => InteriorDesign::roomTypeOptions(),
            'styleOptions' => InteriorDesign::styleOptions(),
        ]);
    }

    /**
     * Show the form for creating a new interior design.
     */
    public function create()
    {
        return Inertia::render('admin/interior-designs/create', [
            'roomTypeOptions' => InteriorDesign::roomTypeOptions(),
            'styleOptions' => InteriorDesign::styleOptions(),
            'flooringTypeOptions' => InteriorDesign::flooringTypeOptions(),
            'ceilingTypeOptions' => InteriorDesign::ceilingTypeOptions(),
            'lightingTypeOptions' => InteriorDesign::lightingTypeOptions(),
            'primaryMaterialOptions' => InteriorDesign::primaryMaterialOptions(),
            'fileTypeOptions' => DesignFile::fileTypeOptions(),
        ]);
    }

    /**
     * Store a newly created interior design.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'room_type' => 'required|string|max:100',
            'style' => 'nullable|string|max:100',
            'room_width' => 'nullable|numeric|min:0',
            'room_length' => 'nullable|numeric|min:0',
            'room_height' => 'nullable|numeric|min:0',
            'area_sqft' => 'nullable|numeric|min:0',
            'color_scheme' => 'nullable|string|max:100',
            'primary_material' => 'nullable|string|max:100',
            'flooring_type' => 'nullable|string|max:100',
            'ceiling_type' => 'nullable|string|max:100',
            'lighting_type' => 'nullable|string|max:100',
            'estimated_cost_min' => 'nullable|numeric|min:0',
            'estimated_cost_max' => 'nullable|numeric|min:0',
            'cover_image' => 'nullable|image|max:5120',
            'furniture_items' => 'nullable|array',
            'color_palette' => 'nullable|array',
            'features' => 'nullable|array',
            'tags' => 'nullable|array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ]);

        DB::beginTransaction();

        try {
            // Handle cover image upload
            if ($request->hasFile('cover_image')) {
                $validated['cover_image'] = $request->file('cover_image')->store('interior-designs/covers', 'public');
            }

            // Create interior design
            $interiorDesign = InteriorDesign::create($validated);

            // Handle gallery images
            if ($request->hasFile('gallery_images')) {
                foreach ($request->file('gallery_images') as $index => $image) {
                    $path = $image->store('interior-designs/gallery', 'public');
                    $interiorDesign->images()->create([
                        'image_path' => $path,
                        'sort_order' => $index,
                    ]);
                }
            }

            // Handle design files
            if ($request->hasFile('design_files')) {
                foreach ($request->file('design_files') as $index => $file) {
                    $path = $file->store('interior-designs/files', 'public');
                    $interiorDesign->files()->create([
                        'file_type' => $request->input("design_files_types.{$index}", 'other'),
                        'title' => $request->input("design_files_titles.{$index}"),
                        'file_path' => $path,
                        'file_extension' => $file->getClientOriginalExtension(),
                        'file_size' => $file->getSize(),
                        'sort_order' => $index,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('admin.interior-designs.index')
                ->with('success', 'Interior design created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create interior design: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing an interior design.
     */
    public function edit(InteriorDesign $interiorDesign)
    {
        $interiorDesign->load(['files', 'images']);

        return Inertia::render('admin/interior-designs/edit', [
            'interiorDesign' => $interiorDesign,
            'roomTypeOptions' => InteriorDesign::roomTypeOptions(),
            'styleOptions' => InteriorDesign::styleOptions(),
            'flooringTypeOptions' => InteriorDesign::flooringTypeOptions(),
            'ceilingTypeOptions' => InteriorDesign::ceilingTypeOptions(),
            'lightingTypeOptions' => InteriorDesign::lightingTypeOptions(),
            'primaryMaterialOptions' => InteriorDesign::primaryMaterialOptions(),
            'fileTypeOptions' => DesignFile::fileTypeOptions(),
        ]);
    }

    /**
     * Update the specified interior design.
     */
    public function update(Request $request, InteriorDesign $interiorDesign)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'room_type' => 'required|string|max:100',
            'style' => 'nullable|string|max:100',
            'room_width' => 'nullable|numeric|min:0',
            'room_length' => 'nullable|numeric|min:0',
            'room_height' => 'nullable|numeric|min:0',
            'area_sqft' => 'nullable|numeric|min:0',
            'color_scheme' => 'nullable|string|max:100',
            'primary_material' => 'nullable|string|max:100',
            'flooring_type' => 'nullable|string|max:100',
            'ceiling_type' => 'nullable|string|max:100',
            'lighting_type' => 'nullable|string|max:100',
            'estimated_cost_min' => 'nullable|numeric|min:0',
            'estimated_cost_max' => 'nullable|numeric|min:0',
            'cover_image' => 'nullable|image|max:5120',
            'furniture_items' => 'nullable|array',
            'color_palette' => 'nullable|array',
            'features' => 'nullable|array',
            'tags' => 'nullable|array',
            'is_featured' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
        ]);

        DB::beginTransaction();

        try {
            // Handle cover image upload
            if ($request->hasFile('cover_image')) {
                if ($interiorDesign->cover_image) {
                    Storage::disk('public')->delete($interiorDesign->cover_image);
                }
                $validated['cover_image'] = $request->file('cover_image')->store('interior-designs/covers', 'public');
            }

            // Update interior design
            $interiorDesign->update($validated);

            // Handle new gallery images
            if ($request->hasFile('gallery_images')) {
                $maxOrder = $interiorDesign->images()->max('sort_order') ?? -1;
                foreach ($request->file('gallery_images') as $index => $image) {
                    $path = $image->store('interior-designs/gallery', 'public');
                    $interiorDesign->images()->create([
                        'image_path' => $path,
                        'sort_order' => $maxOrder + $index + 1,
                    ]);
                }
            }

            // Handle new design files
            if ($request->hasFile('design_files')) {
                $maxOrder = $interiorDesign->files()->max('sort_order') ?? -1;
                foreach ($request->file('design_files') as $index => $file) {
                    $path = $file->store('interior-designs/files', 'public');
                    $interiorDesign->files()->create([
                        'file_type' => $request->input("design_files_types.{$index}", 'other'),
                        'title' => $request->input("design_files_titles.{$index}"),
                        'file_path' => $path,
                        'file_extension' => $file->getClientOriginalExtension(),
                        'file_size' => $file->getSize(),
                        'sort_order' => $maxOrder + $index + 1,
                    ]);
                }
            }

            DB::commit();

            return redirect()->route('admin.interior-designs.index')
                ->with('success', 'Interior design updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update interior design: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified interior design.
     */
    public function destroy(InteriorDesign $interiorDesign)
    {
        // Delete cover image
        if ($interiorDesign->cover_image) {
            Storage::disk('public')->delete($interiorDesign->cover_image);
        }

        // Delete gallery images
        foreach ($interiorDesign->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        // Delete files
        foreach ($interiorDesign->files as $file) {
            Storage::disk('public')->delete($file->file_path);
        }

        $interiorDesign->delete();

        return redirect()->route('admin.interior-designs.index')
            ->with('success', 'Interior design deleted successfully.');
    }

    /**
     * Toggle featured status.
     */
    public function toggleFeatured(InteriorDesign $interiorDesign)
    {
        $interiorDesign->update(['is_featured' => !$interiorDesign->is_featured]);

        return back()->with('success', 'Featured status updated.');
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(InteriorDesign $interiorDesign)
    {
        $interiorDesign->update(['is_active' => !$interiorDesign->is_active]);

        return back()->with('success', 'Active status updated.');
    }

    /**
     * Delete a gallery image.
     */
    public function deleteImage(InteriorDesign $interiorDesign, DesignImage $image)
    {
        if ($image->imageable_id === $interiorDesign->id) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        return back()->with('success', 'Image deleted successfully.');
    }

    /**
     * Delete a design file.
     */
    public function deleteFile(InteriorDesign $interiorDesign, DesignFile $file)
    {
        if ($file->designable_id === $interiorDesign->id) {
            Storage::disk('public')->delete($file->file_path);
            $file->delete();
        }

        return back()->with('success', 'File deleted successfully.');
    }
}

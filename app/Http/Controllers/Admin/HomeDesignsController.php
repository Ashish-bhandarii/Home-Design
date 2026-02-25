<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DesignFile;
use App\Models\DesignImage;
use App\Models\FloorDesign;
use App\Models\HomeDesign;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HomeDesignsController extends Controller
{
    /**
     * Display a listing of home designs.
     */
    public function index(Request $request)
    {
        $query = HomeDesign::query()->withCount('floorDesigns');

        // Filter by style
        if ($request->filled('style')) {
            $query->where('style', $request->style);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('is_active', $request->status === 'active');
        }

        // Filter by bedrooms
        if ($request->filled('bedrooms')) {
            $query->where('bedrooms', $request->bedrooms);
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%")
                  ->orWhere('style', 'like', "%{$request->search}%");
            });
        }

        $designs = $query->latest()->paginate(12)->withQueryString()->through(function ($design) {
            return [
                'id' => $design->id,
                'name' => $design->name,
                'description' => $design->description,
                'style' => $design->style,
                'total_floors' => $design->total_floors,
                'total_area_sqft' => $design->total_area_sqft,
                'bedrooms' => $design->bedrooms,
                'bathrooms' => $design->bathrooms,
                'cover_image' => $design->cover_image,
                'cover_image_url' => $design->cover_image
                    ? url(Storage::url($design->cover_image))
                    : null,
                'is_featured' => $design->is_featured,
                'is_active' => $design->is_active,
                'views' => $design->views,
                'downloads' => $design->downloads,
                'floor_designs_count' => $design->floor_designs_count,
                'created_at' => $design->created_at,
            ];
        });

        return Inertia::render('admin/home-designs/index', [
            'designs' => $designs,
            'filters' => $request->only(['style', 'status', 'search', 'bedrooms']),
            'styleOptions' => HomeDesign::styleOptions(),
        ]);
    }

    /**
     * Show the form for creating a new home design.
     */
    public function create()
    {
        return Inertia::render('admin/home-designs/create', [
            'styleOptions' => HomeDesign::styleOptions(),
            'constructionTypeOptions' => HomeDesign::constructionTypeOptions(),
            'facingDirectionOptions' => HomeDesign::facingDirectionOptions(),
            'floorNumberOptions' => FloorDesign::floorNumberOptions(),
            'roomTypeOptions' => Room::roomTypeOptions(),
            'ventilationOptions' => Room::ventilationOptions(),
            'fileTypeOptions' => DesignFile::fileTypeOptions(),
        ]);
    }

    /**
     * Store a newly created home design.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'style' => 'nullable|string|max:100',
            'total_floors' => 'required|integer|min:1|max:10',
            'total_area_sqft' => 'nullable|numeric|min:0',
            'plot_width' => 'nullable|numeric|min:0',
            'plot_length' => 'nullable|numeric|min:0',
            'bedrooms' => 'required|integer|min:0',
            'bathrooms' => 'required|integer|min:0',
            'kitchens' => 'required|integer|min:0',
            'living_rooms' => 'required|integer|min:0',
            'dining_rooms' => 'nullable|integer|min:0',
            'balconies' => 'nullable|integer|min:0',
            'garages' => 'nullable|integer|min:0',
            'has_basement' => 'sometimes|boolean',
            'has_terrace' => 'sometimes|boolean',
            'has_garden' => 'sometimes|boolean',
            'has_swimming_pool' => 'sometimes|boolean',
            'construction_type' => 'nullable|string|max:100',
            'facing_direction' => 'nullable|string|max:50',
            'estimated_cost_min' => 'nullable|numeric|min:0',
            'estimated_cost_max' => 'nullable|numeric|min:0',
            'cover_image' => 'nullable|image|max:5120',
            'gallery_images.*' => 'nullable|image|max:5120',
            'design_files.*' => 'nullable|file|max:51200',
            'features' => 'nullable|array',
            'tags' => 'nullable|array',
            'is_featured' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
            // Floor designs
            'floors' => 'nullable|array',
            'floors.*.name' => 'required|string|max:255',
            'floors.*.description' => 'nullable|string',
            'floors.*.floor_number' => 'required|integer',
            'floors.*.width' => 'nullable|numeric|min:0',
            'floors.*.length' => 'nullable|numeric|min:0',
            'floors.*.floor_area_sqft' => 'nullable|numeric|min:0',
            'floors.*.carpet_area_sqft' => 'nullable|numeric|min:0',
            'floors.*.bedrooms' => 'nullable|integer|min:0',
            'floors.*.bathrooms' => 'nullable|integer|min:0',
            'floors.*.kitchens' => 'nullable|integer|min:0',
            'floors.*.living_rooms' => 'nullable|integer|min:0',
            'floors.*.dining_rooms' => 'nullable|integer|min:0',
            'floors.*.balconies' => 'nullable|integer|min:0',
            'floors.*.has_stairs' => 'sometimes|boolean',
            'floors.*.has_lift' => 'sometimes|boolean',
            'floors.*.has_puja_room' => 'sometimes|boolean',
            'floors.*.has_store_room' => 'sometimes|boolean',
            'floors.*.has_servant_room' => 'sometimes|boolean',
            'floors.*.rooms' => 'nullable|array',
        ]);

        // Set booleans properly
        $validated['has_basement'] = $request->boolean('has_basement');
        $validated['has_terrace'] = $request->boolean('has_terrace');
        $validated['has_garden'] = $request->boolean('has_garden');
        $validated['has_swimming_pool'] = $request->boolean('has_swimming_pool');
        $validated['is_featured'] = $request->boolean('is_featured');
        $validated['is_active'] = $request->boolean('is_active');

        DB::beginTransaction();

        try {
            // Handle cover image upload
            if ($request->hasFile('cover_image')) {
                $validated['cover_image'] = $request->file('cover_image')->store('home-designs/covers', 'public');
            }

            // Create home design
            $homeDesign = HomeDesign::create(collect($validated)->except(['floors'])->toArray());

            // Create floor designs
            if (isset($validated['floors']) && is_array($validated['floors'])) {
                foreach ($validated['floors'] as $index => $floorData) {
                    // Handle floor cover image
                    if ($request->hasFile("floors.{$index}.cover_image")) {
                        $floorData['cover_image'] = $request->file("floors.{$index}.cover_image")
                            ->store('floor-designs/covers', 'public');
                    }

                    $rooms = $floorData['rooms'] ?? [];
                    unset($floorData['rooms']);

                    $floorDesign = $homeDesign->floorDesigns()->create($floorData);

                    // Create rooms for this floor
                    if (!empty($rooms)) {
                        foreach ($rooms as $roomData) {
                            $floorDesign->rooms()->create($roomData);
                        }
                    }
                }
            }

            // Handle gallery images
            if ($request->hasFile('gallery_images')) {
                foreach ($request->file('gallery_images') as $index => $image) {
                    $path = $image->store('home-designs/gallery', 'public');
                    $homeDesign->images()->create([
                        'image_path' => $path,
                        'sort_order' => $index,
                    ]);
                }
            }

            // Handle design files
            if ($request->hasFile('design_files')) {
                foreach ($request->file('design_files') as $index => $file) {
                    $path = $file->store('home-designs/files', 'public');
                    $homeDesign->files()->create([
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

            return redirect()->route('admin.home-designs.index')
                ->with('success', 'Home design created successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create home design: ' . $e->getMessage()]);
        }
    }

    /**
     * Show the form for editing a home design.
     */
    public function edit(HomeDesign $homeDesign)
    {
        $homeDesign->load(['floorDesigns.rooms', 'files', 'images']);

        return Inertia::render('admin/home-designs/edit', [
            'homeDesign' => [
                'id' => $homeDesign->id,
                'name' => $homeDesign->name,
                'description' => $homeDesign->description,
                'style' => $homeDesign->style,
                'total_floors' => $homeDesign->total_floors,
                'total_area_sqft' => $homeDesign->total_area_sqft,
                'plot_width' => $homeDesign->plot_width,
                'plot_length' => $homeDesign->plot_length,
                'bedrooms' => $homeDesign->bedrooms,
                'bathrooms' => $homeDesign->bathrooms,
                'kitchens' => $homeDesign->kitchens,
                'living_rooms' => $homeDesign->living_rooms,
                'dining_rooms' => $homeDesign->dining_rooms,
                'balconies' => $homeDesign->balconies,
                'garages' => $homeDesign->garages,
                'has_basement' => $homeDesign->has_basement,
                'has_terrace' => $homeDesign->has_terrace,
                'has_garden' => $homeDesign->has_garden,
                'has_swimming_pool' => $homeDesign->has_swimming_pool,
                'construction_type' => $homeDesign->construction_type,
                'facing_direction' => $homeDesign->facing_direction,
                'estimated_cost_min' => $homeDesign->estimated_cost_min,
                'estimated_cost_max' => $homeDesign->estimated_cost_max,
                'features' => $homeDesign->features,
                'tags' => $homeDesign->tags,
                'is_featured' => $homeDesign->is_featured,
                'is_active' => $homeDesign->is_active,
                'cover_image' => $homeDesign->cover_image,
                'cover_image_url' => $homeDesign->cover_image
                    ? url(Storage::url($homeDesign->cover_image))
                    : null,
                'images' => $homeDesign->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'image_path' => $image->image_path,
                        'image_url' => $image->image_path
                            ? url(Storage::url($image->image_path))
                            : null,
                        'sort_order' => $image->sort_order,
                    ];
                })->values(),
                'files' => $homeDesign->files->map(function ($file) {
                    return [
                        'id' => $file->id,
                        'title' => $file->title,
                        'file_type' => $file->file_type,
                        'file_path' => $file->file_path,
                        'file_extension' => $file->file_extension,
                        'file_size' => $file->file_size ? number_format($file->file_size / 1024 / 1024, 2) . ' MB' : null,
                    ];
                })->values(),
            ],
            'styleOptions' => HomeDesign::styleOptions(),
            'constructionTypeOptions' => HomeDesign::constructionTypeOptions(),
            'facingDirectionOptions' => HomeDesign::facingDirectionOptions(),
            'floorNumberOptions' => FloorDesign::floorNumberOptions(),
            'roomTypeOptions' => Room::roomTypeOptions(),
            'ventilationOptions' => Room::ventilationOptions(),
            'fileTypeOptions' => DesignFile::fileTypeOptions(),
        ]);
    }

    /**
     * Update the specified home design.
     */
    public function update(Request $request, HomeDesign $homeDesign)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'style' => 'nullable|string|max:100',
            'total_floors' => 'required|integer|min:1|max:10',
            'total_area_sqft' => 'nullable|numeric|min:0',
            'plot_width' => 'nullable|numeric|min:0',
            'plot_length' => 'nullable|numeric|min:0',
            'bedrooms' => 'required|integer|min:0',
            'bathrooms' => 'required|integer|min:0',
            'kitchens' => 'required|integer|min:0',
            'living_rooms' => 'required|integer|min:0',
            'dining_rooms' => 'nullable|integer|min:0',
            'balconies' => 'nullable|integer|min:0',
            'garages' => 'nullable|integer|min:0',
            'has_basement' => 'sometimes|boolean',
            'has_terrace' => 'sometimes|boolean',
            'has_garden' => 'sometimes|boolean',
            'has_swimming_pool' => 'sometimes|boolean',
            'construction_type' => 'nullable|string|max:100',
            'facing_direction' => 'nullable|string|max:50',
            'estimated_cost_min' => 'nullable|numeric|min:0',
            'estimated_cost_max' => 'nullable|numeric|min:0',
            'cover_image' => 'nullable|image|max:5120',
            'gallery_images.*' => 'nullable|image|max:5120',
            'design_files.*' => 'nullable|file|max:51200',
            'features' => 'nullable|array',
            'tags' => 'nullable|array',
            'is_featured' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
            'floors' => 'nullable|array',
        ]);

        // Set booleans properly
        $validated['has_basement'] = $request->boolean('has_basement');
        $validated['has_terrace'] = $request->boolean('has_terrace');
        $validated['has_garden'] = $request->boolean('has_garden');
        $validated['has_swimming_pool'] = $request->boolean('has_swimming_pool');
        $validated['is_featured'] = $request->boolean('is_featured');
        $validated['is_active'] = $request->boolean('is_active');

        DB::beginTransaction();

        try {
            // Handle cover image upload
            if ($request->hasFile('cover_image')) {
                if ($homeDesign->cover_image) {
                    Storage::disk('public')->delete($homeDesign->cover_image);
                }
                $validated['cover_image'] = $request->file('cover_image')->store('home-designs/covers', 'public');
            }

            // Update home design
            $homeDesign->update(collect($validated)->except(['floors'])->toArray());

            // Update floor designs
            if (isset($validated['floors']) && is_array($validated['floors'])) {
                $existingFloorIds = [];
                
                foreach ($validated['floors'] as $index => $floorData) {
                    // Handle floor cover image
                    if ($request->hasFile("floors.{$index}.cover_image")) {
                        $floorData['cover_image'] = $request->file("floors.{$index}.cover_image")
                            ->store('floor-designs/covers', 'public');
                    }

                    $rooms = $floorData['rooms'] ?? [];
                    unset($floorData['rooms']);

                    if (isset($floorData['id'])) {
                        // Update existing floor
                        $floorDesign = FloorDesign::find($floorData['id']);
                        if ($floorDesign) {
                            $floorDesign->update($floorData);
                            $existingFloorIds[] = $floorDesign->id;
                        }
                    } else {
                        // Create new floor
                        $floorDesign = $homeDesign->floorDesigns()->create($floorData);
                        $existingFloorIds[] = $floorDesign->id;
                    }

                    // Update rooms
                    if ($floorDesign && !empty($rooms)) {
                        $existingRoomIds = [];
                        foreach ($rooms as $roomData) {
                            if (isset($roomData['id'])) {
                                $room = Room::find($roomData['id']);
                                if ($room) {
                                    $room->update($roomData);
                                    $existingRoomIds[] = $room->id;
                                }
                            } else {
                                $room = $floorDesign->rooms()->create($roomData);
                                $existingRoomIds[] = $room->id;
                            }
                        }
                        // Delete removed rooms
                        $floorDesign->rooms()->whereNotIn('id', $existingRoomIds)->delete();
                    }
                }

                // Delete removed floors
                $homeDesign->floorDesigns()->whereNotIn('id', $existingFloorIds)->delete();
            }

            // Handle new gallery images
            if ($request->hasFile('gallery_images')) {
                $maxOrder = $homeDesign->images()->max('sort_order') ?? -1;
                foreach ($request->file('gallery_images') as $index => $image) {
                    $path = $image->store('home-designs/gallery', 'public');
                    $homeDesign->images()->create([
                        'image_path' => $path,
                        'sort_order' => $maxOrder + $index + 1,
                    ]);
                }
            }

            // Handle new design files
            if ($request->hasFile('design_files')) {
                $maxOrder = $homeDesign->files()->max('sort_order') ?? -1;
                foreach ($request->file('design_files') as $index => $file) {
                    $path = $file->store('home-designs/files', 'public');
                    $homeDesign->files()->create([
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

            return redirect()->route('admin.home-designs.index')
                ->with('success', 'Home design updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update home design: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified home design.
     */
    public function destroy(HomeDesign $homeDesign)
    {
        // Delete cover image
        if ($homeDesign->cover_image) {
            Storage::disk('public')->delete($homeDesign->cover_image);
        }

        // Delete gallery images
        foreach ($homeDesign->images as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        // Delete files
        foreach ($homeDesign->files as $file) {
            Storage::disk('public')->delete($file->file_path);
        }

        // Delete floor cover images
        foreach ($homeDesign->floorDesigns as $floor) {
            if ($floor->cover_image) {
                Storage::disk('public')->delete($floor->cover_image);
            }
        }

        $homeDesign->delete();

        return redirect()->route('admin.home-designs.index')
            ->with('success', 'Home design deleted successfully.');
    }

    /**
     * Toggle featured status.
     */
    public function toggleFeatured(HomeDesign $homeDesign)
    {
        $homeDesign->update(['is_featured' => !$homeDesign->is_featured]);

        return back()->with('success', 'Featured status updated.');
    }

    /**
     * Toggle active status.
     */
    public function toggleActive(HomeDesign $homeDesign)
    {
        $homeDesign->update(['is_active' => !$homeDesign->is_active]);

        return back()->with('success', 'Active status updated.');
    }

    /**
     * Delete a gallery image.
     */
    public function deleteImage(HomeDesign $homeDesign, DesignImage $image)
    {
        if ($image->imageable_id === $homeDesign->id) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        return back()->with('success', 'Image deleted successfully.');
    }

    /**
     * Delete a design file.
     */
    public function deleteFile(HomeDesign $homeDesign, DesignFile $file)
    {
        if ($file->designable_id === $homeDesign->id) {
            Storage::disk('public')->delete($file->file_path);
            $file->delete();
        }

        return back()->with('success', 'File deleted successfully.');
    }
}

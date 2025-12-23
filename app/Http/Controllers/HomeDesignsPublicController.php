<?php

namespace App\Http\Controllers;

use App\Models\HomeDesign;
use App\Models\DesignImage;
use App\Models\DesignFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class HomeDesignsPublicController extends Controller
{
    /**
     * Display a listing of active home designs for users.
     */
    public function index(Request $request)
    {
        $styleOptions = HomeDesign::styleOptions();

        $query = HomeDesign::query()
            ->where('is_active', true)
            ->with(['images', 'floorDesigns']);

        // Filter by style
        if ($request->filled('style')) {
            $query->where('style', $request->style);
        }

        // Filter by bedrooms
        if ($request->filled('bedrooms')) {
            $query->where('bedrooms', $request->bedrooms);
        }

        // Filter by price range
        if ($request->filled('min_price')) {
            $query->where('estimated_cost_min', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('estimated_cost_max', '<=', $request->max_price);
        }

        // Search
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('description', 'like', "%{$request->search}%")
                  ->orWhere('style', 'like', "%{$request->search}%");
            });
        }

        $designs = $query
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->paginate(12)
            ->through(function (HomeDesign $design) use ($styleOptions) {
                $coverImageUrl = $design->cover_image 
                    ? Storage::disk('public')->url($design->cover_image) 
                    : null;

                $galleryImages = $design->images
                    ->sortBy('sort_order')
                    ->values()
                    ->take(4)
                    ->map(function (DesignImage $image) {
                        if (!$image->image_path) {
                            return null;
                        }
                        return [
                            'id' => $image->id,
                            'url' => Storage::disk('public')->url($image->image_path),
                            'caption' => $image->caption,
                        ];
                    })
                    ->filter()
                    ->values()
                    ->all();

                return [
                    'id' => $design->id,
                    'name' => $design->name,
                    'description' => $design->description,
                    'style' => $design->style,
                    'style_label' => $styleOptions[$design->style] ?? $design->style,
                    'total_floors' => $design->total_floors,
                    'total_area_sqft' => $design->total_area_sqft,
                    'bedrooms' => $design->bedrooms,
                    'bathrooms' => $design->bathrooms,
                    'kitchens' => $design->kitchens,
                    'garages' => $design->garages,
                    'has_basement' => $design->has_basement,
                    'has_terrace' => $design->has_terrace,
                    'has_garden' => $design->has_garden,
                    'has_swimming_pool' => $design->has_swimming_pool,
                    'estimated_cost_min' => $design->estimated_cost_min,
                    'estimated_cost_max' => $design->estimated_cost_max,
                    'cover_image_url' => $coverImageUrl,
                    'gallery_images' => $galleryImages,
                    'floor_count' => $design->floorDesigns->count(),
                    'views' => $design->views ?? 0,
                    'is_featured' => $design->is_featured,
                ];
            });

        return Inertia::render('user/design-home', [
            'designs' => $designs,
            'filters' => $request->only(['style', 'bedrooms', 'min_price', 'max_price', 'search']),
            'styleOptions' => $styleOptions,
        ]);
    }

    /**
     * Display a single home design with full details.
     */
    public function show(HomeDesign $homeDesign)
    {
        // Only show active designs
        if (!$homeDesign->is_active) {
            abort(404);
        }

        // Increment view count
        $homeDesign->increment('views');

        $homeDesign->load(['images', 'floorDesigns.rooms', 'files']);

        $styleOptions = HomeDesign::styleOptions();
        $constructionTypeOptions = HomeDesign::constructionTypeOptions();
        $facingDirectionOptions = HomeDesign::facingDirectionOptions();

        $coverImageUrl = $homeDesign->cover_image 
            ? Storage::disk('public')->url($homeDesign->cover_image) 
            : null;

        $galleryImages = $homeDesign->images
            ->sortBy('sort_order')
            ->values()
            ->map(function (DesignImage $image) {
                if (!$image->image_path) {
                    return null;
                }
                return [
                    'id' => $image->id,
                    'url' => Storage::disk('public')->url($image->image_path),
                    'caption' => $image->caption,
                ];
            })
            ->filter()
            ->values()
            ->all(); 

        $floorDesigns = $homeDesign->floorDesigns->map(function ($floor) {
            return [
                'id' => $floor->id,
                'floor_number' => $floor->floor_number,
                'name' => $floor->name,
                'area_sqft' => $floor->area_sqft,
                'cover_image_url' => $floor->cover_image 
                    ? Storage::disk('public')->url($floor->cover_image) 
                    : null,
                'rooms' => $floor->rooms->map(function ($room) {
                    return [
                        'id' => $room->id,
                        'name' => $room->name,
                        'room_type' => $room->room_type,
                        'area_sqft' => $room->area_sqft,
                        'width' => $room->width,
                        'length' => $room->length,
                    ];
                })->all(),
            ];
        })->all();

        $fileTypeOptions = DesignFile::fileTypeOptions();
        $designFiles = $homeDesign->files->map(function ($file) use ($fileTypeOptions) {
            return [
                'id' => $file->id,
                'title' => $file->title,
                'file_type' => $file->file_type,
                'file_type_label' => $fileTypeOptions[$file->file_type] ?? $file->file_type,
                'file_extension' => $file->file_extension,
                'file_size_formatted' => $file->file_size_formatted,
            ];
        })->all();

        $isWishlisted = false;
        if (auth()->check()) {
            $isWishlisted = \App\Models\Wishlist::where('user_id', auth()->id())
                ->where('wishlistable_type', HomeDesign::class)
                ->where('wishlistable_id', $homeDesign->id)
                ->exists();
        }

        $designData = [
            'id' => $homeDesign->id,
            'name' => $homeDesign->name,
            'description' => $homeDesign->description, 
            'style' => $homeDesign->style,
            'style_label' => $styleOptions[$homeDesign->style] ?? $homeDesign->style,
            'construction_type' => $homeDesign->construction_type,
            'construction_type_label' => $constructionTypeOptions[$homeDesign->construction_type] ?? $homeDesign->construction_type,
            'facing_direction' => $homeDesign->facing_direction,
            'facing_direction_label' => $facingDirectionOptions[$homeDesign->facing_direction] ?? $homeDesign->facing_direction,
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
            'estimated_cost_min' => $homeDesign->estimated_cost_min,
            'estimated_cost_max' => $homeDesign->estimated_cost_max,
            'features' => $homeDesign->features ?? [],
            'tags' => $homeDesign->tags ?? [],
            'cover_image_url' => $coverImageUrl,
            'gallery_images' => $galleryImages,
            'floor_designs' => $floorDesigns,
            'design_files' => $designFiles,
            'views' => $homeDesign->views,
            'downloads' => $homeDesign->downloads ?? 0,
            'is_featured' => $homeDesign->is_featured,
            'is_wishlisted' => $isWishlisted,
            'created_at' => $homeDesign->created_at->format('M d, Y'),
        ];

        return Inertia::render('user/design-home-show', [
            'design' => $designData,
        ]);
    }

    /**
     * Download design files as a ZIP archive.
     */
    public function download(HomeDesign $homeDesign)
    {
        // Only allow downloading active designs
        if (!$homeDesign->is_active) {
            abort(404);
        }

        // Load all design files
        $homeDesign->load(['files', 'floorDesigns.files']);

        // Collect all files
        $files = collect();
        
        // Add home design files
        foreach ($homeDesign->files as $file) {
            if ($file->file_path && Storage::disk('public')->exists($file->file_path)) {
                $files->push([
                    'path' => Storage::disk('public')->path($file->file_path),
                    'name' => $file->title ?? basename($file->file_path),
                    'extension' => $file->file_extension,
                ]);
            }
        }

        // Add floor design files
        foreach ($homeDesign->floorDesigns as $floor) {
            foreach ($floor->files as $file) {
                if ($file->file_path && Storage::disk('public')->exists($file->file_path)) {
                    $files->push([
                        'path' => Storage::disk('public')->path($file->file_path),
                        'name' => "Floor_{$floor->floor_number}_{$file->title}" ?? basename($file->file_path),
                        'extension' => $file->file_extension,
                    ]);
                }
            }
        }

        // Check if there are any files to download
        if ($files->isEmpty()) {
            return back()->with('error', 'No downloadable files available for this design.');
        }

        // Increment downloads counter
        $homeDesign->increment('downloads');

        // Create a temporary ZIP file
        $zipFileName = str_replace(' ', '_', $homeDesign->name) . '_Plans.zip';
        $zipPath = storage_path('app/temp/' . $zipFileName);
        
        // Ensure temp directory exists
        if (!file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        // Create ZIP archive
        $zip = new \ZipArchive();
        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {
            foreach ($files as $file) {
                if (file_exists($file['path'])) {
                    $zip->addFile($file['path'], $file['name'] . '.' . $file['extension']);
                }
            }
            $zip->close();
        } else {
            return back()->with('error', 'Failed to create download archive.');
        }

        // Return download response and delete temp file after sending
        return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
    }
}

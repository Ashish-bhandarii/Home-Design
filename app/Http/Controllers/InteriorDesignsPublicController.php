<?php

namespace App\Http\Controllers;

use App\Models\InteriorDesign;
use App\Models\DesignImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InteriorDesignsPublicController extends Controller
{
    /**
     * Display a single interior design with full details.
     */
    public function show(InteriorDesign $interiorDesign)
    {
        // Only show active designs
        if (!$interiorDesign->is_active) {
            abort(404);
        }

        // Increment view count
        $interiorDesign->increment('views');

        $interiorDesign->load(['images', 'files']);

        $roomTypeOptions = InteriorDesign::roomTypeOptions();
        $styleOptions = InteriorDesign::styleOptions();
        $flooringTypeOptions = InteriorDesign::flooringTypeOptions();
        $ceilingTypeOptions = InteriorDesign::ceilingTypeOptions();
        $lightingTypeOptions = InteriorDesign::lightingTypeOptions();
        $primaryMaterialOptions = InteriorDesign::primaryMaterialOptions();

        $coverImageUrl = $interiorDesign->cover_image 
            ? Storage::disk('public')->url($interiorDesign->cover_image) 
            : null;

        $galleryImages = $interiorDesign->images
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

        $isWishlisted = false;
        if (auth()->check()) {
            $isWishlisted = \App\Models\Wishlist::where('user_id', auth()->id())
                ->where('wishlistable_type', InteriorDesign::class)
                ->where('wishlistable_id', $interiorDesign->id)
                ->exists();
        }

        $designData = [
            'id' => $interiorDesign->id,
            'name' => $interiorDesign->name,
            'description' => $interiorDesign->description,
            'room_type' => $interiorDesign->room_type,
            'room_type_label' => $roomTypeOptions[$interiorDesign->room_type] ?? $interiorDesign->room_type,
            'style' => $interiorDesign->style,
            'style_label' => $styleOptions[$interiorDesign->style] ?? $interiorDesign->style,
            'color_scheme' => $interiorDesign->color_scheme,
            'color_palette' => $interiorDesign->color_palette ?? [],
            'flooring_type' => $interiorDesign->flooring_type,
            'flooring_type_label' => $flooringTypeOptions[$interiorDesign->flooring_type] ?? $interiorDesign->flooring_type,
            'ceiling_type' => $interiorDesign->ceiling_type,
            'ceiling_type_label' => $ceilingTypeOptions[$interiorDesign->ceiling_type] ?? $interiorDesign->ceiling_type,
            'lighting_type' => $interiorDesign->lighting_type,
            'lighting_type_label' => $lightingTypeOptions[$interiorDesign->lighting_type] ?? $interiorDesign->lighting_type,
            'primary_material' => $interiorDesign->primary_material,
            'primary_material_label' => $primaryMaterialOptions[$interiorDesign->primary_material] ?? $interiorDesign->primary_material,
            'room_width' => $interiorDesign->room_width,
            'room_length' => $interiorDesign->room_length,
            'room_height' => $interiorDesign->room_height,
            'area_sqft' => $interiorDesign->area_sqft,
            'estimated_cost_min' => $interiorDesign->estimated_cost_min,
            'estimated_cost_max' => $interiorDesign->estimated_cost_max,
            'features' => $interiorDesign->features ?? [],
            'furniture_items' => $interiorDesign->furniture_items ?? [],
            'tags' => $interiorDesign->tags ?? [],
            'cover_image_url' => $coverImageUrl,
            'gallery_images' => $galleryImages,
            'views' => $interiorDesign->views,
            'downloads' => $interiorDesign->downloads ?? 0,
            'is_featured' => $interiorDesign->is_featured,
            'is_wishlisted' => $isWishlisted,
            'created_at' => $interiorDesign->created_at->format('M d, Y'),
        ];

        return Inertia::render('user/gallery-show', [
            'design' => $designData,
        ]);
    }

    /**
     * Download design files as a ZIP archive.
     */
    public function download(InteriorDesign $interiorDesign)
    {
        // Only allow downloading active designs
        if (!$interiorDesign->is_active) {
            abort(404);
        }

        // Load all design files
        $interiorDesign->load(['files']);

        // Collect all files
        $files = collect();
        
        // Add interior design files
        foreach ($interiorDesign->files as $file) {
            if ($file->file_path && Storage::disk('public')->exists($file->file_path)) {
                $files->push([
                    'path' => Storage::disk('public')->path($file->file_path),
                    'name' => $file->title ?? basename($file->file_path),
                    'extension' => $file->file_extension,
                ]);
            }
        }

        // Check if there are any files to download
        if ($files->isEmpty()) {
            return back()->with('error', 'No downloadable files available for this design.');
        }

        // Increment downloads counter
        $interiorDesign->increment('downloads');

        // Create a temporary ZIP file
        $zipFileName = str_replace(' ', '_', $interiorDesign->name) . '_Interior_Design.zip';
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

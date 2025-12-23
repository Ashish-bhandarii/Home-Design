<?php

namespace App\Http\Controllers;

use App\Models\DesignImage;
use App\Models\InteriorDesign;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class GalleryController extends Controller
{
    public function index()
    {
        $roomTypeLabels = InteriorDesign::roomTypeOptions();
        $styleLabels = InteriorDesign::styleOptions();

        $designs = InteriorDesign::query()
            ->where('is_active', true)
            ->with(['images'])
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->limit(16)
            ->get()
            ->map(function (InteriorDesign $design) use ($roomTypeLabels, $styleLabels) {
                $coverImageUrl = $design->cover_image ? Storage::disk('public')->url($design->cover_image) : null;

                $galleryImages = $design->images
                    ->sortBy('sort_order')
                    ->values()
                    ->take(3)
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
                    'room_type' => $roomTypeLabels[$design->room_type] ?? $design->room_type,
                    'style' => $design->style ? ($styleLabels[$design->style] ?? $design->style) : null,
                    'cover_image_url' => $coverImageUrl,
                    'gallery_images' => $galleryImages,
                    'views' => $design->views ?? 0,
                    'downloads' => $design->downloads ?? 0,
                    'featured' => (bool) $design->is_featured,
                ];
            })
            ->values()
            ->all();

        return Inertia::render('user/gallery', [
            'designs' => $designs,
        ]);
    }
}

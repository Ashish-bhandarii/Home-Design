<?php

namespace App\Http\Controllers;

use App\Models\HomeDesign;
use App\Models\InteriorDesign;
use App\Models\DesignImage;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class LandingController extends Controller
{
    public function index()
    {
        // Fetch featured home designs
        $featuredHomeDesigns = HomeDesign::where('is_active', true)
            ->where('is_featured', true)
            ->latest()
            ->take(4)
            ->get()
            ->map(function (HomeDesign $design) {
                return [
                    'id' => $design->id,
                    'name' => $design->name,
                    'style' => $design->style,
                    'total_area_sqft' => $design->total_area_sqft,
                    'bedrooms' => $design->bedrooms,
                    'bathrooms' => $design->bathrooms,
                    'cover_image_url' => $design->cover_image ? Storage::disk('public')->url($design->cover_image) : null,
                ];
            });

        // Fetch featured interior designs
        $featuredInteriorDesigns = InteriorDesign::where('is_active', true)
            ->where('is_featured', true)
            ->latest()
            ->take(4)
            ->get()
            ->map(function (InteriorDesign $design) {
                return [
                    'id' => $design->id,
                    'name' => $design->name,
                    'room_type' => $design->room_type,
                    'style' => $design->style,
                    'cover_image_url' => $design->cover_image ? Storage::disk('public')->url($design->cover_image) : null,
                ];
            });

        // Landing page now loads furniture via API on the frontend
        // Only pass the canRegister flag for registration feature toggle
        return Inertia::render('Landing', [
            'canRegister' => Features::enabled(Features::registration()),
            'featuredHomeDesigns' => $featuredHomeDesigns,
            'featuredInteriorDesigns' => $featuredInteriorDesigns,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Furniture;

class FurnitureController extends Controller
{
    /**
     * Get all furniture items
     */
    public function index()
    {
        $furniture = Furniture::active()
            ->orderBy('is_featured', 'desc')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(function ($item) {
                // Handle both external URLs and local storage paths
                $image = null;
                if ($item->image) {
                    if (str_starts_with($item->image, 'http')) {
                        $image = $item->image;
                    } else {
                        $image = '/storage/' . $item->image;
                    }
                }
                
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'slug' => $item->slug,
                    'description' => $item->description,
                    'category' => $item->category,
                    'room' => $item->room,
                    'price' => $item->price,
                    'image' => $image,
                    'dimensions' => $item->dimensions,
                    'material' => $item->material,
                    'color' => $item->color,
                    'stock' => $item->stock,
                    'availability' => $item->computed_availability,
                    'is_featured' => $item->is_featured,
                ];
            });

        return response()->json([
            'data' => $furniture
        ]);
    }
}

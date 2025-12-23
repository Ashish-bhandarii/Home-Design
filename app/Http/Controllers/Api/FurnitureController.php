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
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'slug' => $item->slug,
                    'description' => $item->description,
                    'category' => $item->category,
                    'room' => $item->room,
                    'price' => $item->price,
                    'image' => $item->image ? '/storage/' . $item->image : null,
                    'dimensions' => $item->dimensions,
                    'material' => $item->material,
                    'color' => $item->color,
                    'stock' => $item->stock,
                    'is_featured' => $item->is_featured,
                ];
            });

        return response()->json([
            'data' => $furniture
        ]);
    }
}

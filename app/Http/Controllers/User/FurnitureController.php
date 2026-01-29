<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Furniture;
use Inertia\Inertia;

class FurnitureController extends Controller
{
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

        return Inertia::render('user/furniture-library', [
            'furniture' => $furniture,
            'categories' => Furniture::categories(),
            'rooms' => Furniture::rooms(),
        ]);
    }

    public function show(Furniture $furniture)
    {
        if (!$furniture->is_active) {
            abort(404);
        }

        return Inertia::render('user/furniture-detail', [
            'item' => $furniture,
        ]);
    }
}

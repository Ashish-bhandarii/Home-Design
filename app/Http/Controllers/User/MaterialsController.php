<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Inertia\Inertia;

class MaterialsController extends Controller
{
    public function index()
    {
        $materials = Material::active()
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
                    'type' => $item->type,
                    'price_per_unit' => $item->price_per_unit,
                    'unit' => $item->unit,
                    'image' => $item->image,
                    'color' => $item->color,
                    'brand' => $item->brand,
                    'specifications' => $item->specifications,
                    'availability' => $item->availability,
                    'stock' => $item->stock,
                    'is_featured' => $item->is_featured,
                ];
            });

        return Inertia::render('user/materials', [
            'materials' => $materials,
            'categories' => Material::categories(),
            'types' => Material::types(),
        ]);
    }

    public function show(Material $material)
    {
        if (!$material->is_active) {
            abort(404);
        }

        return Inertia::render('user/material-detail', [
            'item' => $material,
        ]);
    }
}

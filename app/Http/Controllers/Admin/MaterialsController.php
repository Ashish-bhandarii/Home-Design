<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MaterialsController extends Controller
{
    public function index(Request $request)
    {
        $query = Material::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        if ($request->filled('type') && $request->type !== 'All') {
            $query->where('type', $request->type);
        }

        $materials = $query->orderBy('sort_order')->orderBy('created_at', 'desc')->get();

        return Inertia::render('admin/materials/index', [
            'materials' => $materials->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'slug' => $item->slug,
                    'description' => $item->description,
                    'category' => $item->category,
                    'type' => $item->type,
                    'pricePerUnit' => $item->price_per_unit,
                    'unit' => $item->unit,
                    'image' => $item->image,
                    'color' => $item->color,
                    'brand' => $item->brand,
                    'specifications' => $item->specifications,
                    'availability' => $item->availability,
                    'isActive' => $item->is_active,
                    'isFeatured' => $item->is_featured,
                    'createdAt' => $item->created_at->format('Y-m-d'),
                ];
            }),
            'categories' => Material::categories(),
            'types' => Material::types(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/materials/create', [
            'categories' => Material::categories(),
            'types' => Material::types(),
            'units' => Material::units(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'type' => 'required|string',
            'price_per_unit' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'color' => 'nullable|string',
            'brand' => 'nullable|string',
            'specifications' => 'nullable|string',
            'availability' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('materials', 'public');
        }

        Material::create($validated);

        return redirect()->route('admin.materials.index')->with('success', 'Material created successfully.');
    }

    public function edit(Material $material)
    {
        return Inertia::render('admin/materials/edit', [
            'material' => [
                'id' => $material->id,
                'name' => $material->name,
                'slug' => $material->slug,
                'description' => $material->description,
                'category' => $material->category,
                'type' => $material->type,
                'price_per_unit' => $material->price_per_unit,
                'unit' => $material->unit,
                'image' => $material->image,
                'color' => $material->color,
                'brand' => $material->brand,
                'specifications' => $material->specifications,
                'availability' => $material->availability,
                'is_active' => $material->is_active,
                'is_featured' => $material->is_featured,
            ],
            'categories' => Material::categories(),
            'types' => Material::types(),
            'units' => Material::units(),
        ]);
    }

    public function update(Request $request, Material $material)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'type' => 'required|string',
            'price_per_unit' => 'required|numeric|min:0',
            'unit' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'color' => 'nullable|string',
            'brand' => 'nullable|string',
            'specifications' => 'nullable|string',
            'availability' => 'nullable|string',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($material->image) {
                Storage::disk('public')->delete($material->image);
            }
            $validated['image'] = $request->file('image')->store('materials', 'public');
        }

        $material->update($validated);

        return redirect()->route('admin.materials.index')->with('success', 'Material updated successfully.');
    }

    public function destroy(Material $material)
    {
        if ($material->image) {
            Storage::disk('public')->delete($material->image);
        }

        $material->delete();

        return redirect()->route('admin.materials.index')->with('success', 'Material deleted successfully.');
    }

    public function toggleActive(Material $material)
    {
        $material->update(['is_active' => !$material->is_active]);

        return back()->with('success', 'Material status updated.');
    }

    public function toggleFeatured(Material $material)
    {
        $material->update(['is_featured' => !$material->is_featured]);

        return back()->with('success', 'Material featured status updated.');
    }
}

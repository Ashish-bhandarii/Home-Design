<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Furniture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FurnitureController extends Controller
{
    public function index(Request $request)
    {
        $query = Furniture::query();

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        if ($request->filled('room') && $request->room !== 'All') {
            $query->where('room', $request->room);
        }

        $furniture = $query->orderBy('sort_order')->orderBy('created_at', 'desc')->get();

        return Inertia::render('admin/furniture/index', [
            'furniture' => $furniture->map(function ($item) {
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'slug' => $item->slug,
                    'description' => $item->description,
                    'category' => $item->category,
                    'room' => $item->room,
                    'price' => $item->price,
                    'image' => $item->image,
                    'dimensions' => $item->dimensions,
                    'material' => $item->material,
                    'color' => $item->color,
                    'stock' => $item->stock,
                    'isActive' => $item->is_active,
                    'isFeatured' => $item->is_featured,
                    'createdAt' => $item->created_at->format('Y-m-d'),
                ];
            }),
            'categories' => Furniture::categories(),
            'rooms' => Furniture::rooms(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/furniture/create', [
            'categories' => Furniture::categories(),
            'rooms' => Furniture::rooms(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'room' => 'required|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'dimensions' => 'nullable|array',
            'material' => 'nullable|string',
            'color' => 'nullable|string',
            'stock' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('furniture', 'public');
        }

        Furniture::create($validated);

        return redirect()->route('admin.furniture.index')->with('success', 'Furniture created successfully.');
    }

    public function edit(Furniture $furniture)
    {
        return Inertia::render('admin/furniture/edit', [
            'furniture' => [
                'id' => $furniture->id,
                'name' => $furniture->name,
                'slug' => $furniture->slug,
                'description' => $furniture->description,
                'category' => $furniture->category,
                'room' => $furniture->room,
                'price' => $furniture->price,
                'image' => $furniture->image,
                'dimensions' => $furniture->dimensions,
                'material' => $furniture->material,
                'color' => $furniture->color,
                'stock' => $furniture->stock,
                'is_active' => $furniture->is_active,
                'is_featured' => $furniture->is_featured,
            ],
            'categories' => Furniture::categories(),
            'rooms' => Furniture::rooms(),
        ]);
    }

    public function update(Request $request, Furniture $furniture)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string',
            'room' => 'required|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'dimensions' => 'nullable|array',
            'material' => 'nullable|string',
            'color' => 'nullable|string',
            'stock' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image
            if ($furniture->image) {
                Storage::disk('public')->delete($furniture->image);
            }
            $validated['image'] = $request->file('image')->store('furniture', 'public');
        }

        $furniture->update($validated);

        return redirect()->route('admin.furniture.index')->with('success', 'Furniture updated successfully.');
    }

    public function destroy(Furniture $furniture)
    {
        if ($furniture->image) {
            Storage::disk('public')->delete($furniture->image);
        }

        $furniture->delete();

        return redirect()->route('admin.furniture.index')->with('success', 'Furniture deleted successfully.');
    }

    public function toggleActive(Furniture $furniture)
    {
        $furniture->update(['is_active' => !$furniture->is_active]);

        return back()->with('success', 'Furniture status updated.');
    }

    public function toggleFeatured(Furniture $furniture)
    {
        $furniture->update(['is_featured' => !$furniture->is_featured]);

        return back()->with('success', 'Furniture featured status updated.');
    }
}

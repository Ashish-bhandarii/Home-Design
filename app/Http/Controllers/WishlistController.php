<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Furniture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class WishlistController extends Controller
{
    public function index()
    {
        $wishlistItems = Wishlist::where('user_id', Auth::id())
            ->with('wishlistable')
            ->latest()
            ->get()
            ->map(function ($item) {
                $wishlistable = $item->wishlistable;
                
                // For furniture items, include all relevant fields
                if ($item->wishlistable_type === 'App\\Models\\Furniture' && $wishlistable) {
                    return [
                        'id' => $item->id,
                        'wishlistable_id' => $item->wishlistable_id,
                        'wishlistable_type' => $item->wishlistable_type,
                        'item' => [
                            'id' => $wishlistable->id,
                            'name' => $wishlistable->name,
                            'description' => $wishlistable->description,
                            'image' => $wishlistable->image ? '/storage/' . $wishlistable->image : null,
                            'category' => $wishlistable->category,
                            'room' => $wishlistable->room,
                            'price' => $wishlistable->price,
                            'material' => $wishlistable->material,
                            'color' => $wishlistable->color,
                            'dimensions' => $wishlistable->dimensions,
                            'updated_at' => $wishlistable->updated_at,
                        ],
                        'created_at' => $item->created_at,
                    ];
                }
                
                // For material items, include all relevant fields
                if ($item->wishlistable_type === 'App\\Models\\Material' && $wishlistable) {
                    return [
                        'id' => $item->id,
                        'wishlistable_id' => $item->wishlistable_id,
                        'wishlistable_type' => $item->wishlistable_type,
                        'item' => [
                            'id' => $wishlistable->id,
                            'name' => $wishlistable->name,
                            'description' => $wishlistable->description,
                            'image' => $wishlistable->image ? '/storage/' . $wishlistable->image : null,
                            'category' => $wishlistable->category,
                            'type' => $wishlistable->type,
                            'price' => $wishlistable->price_per_unit,
                            'unit' => $wishlistable->unit,
                            'color' => $wishlistable->color,
                            'brand' => $wishlistable->brand,
                            'updated_at' => $wishlistable->updated_at,
                        ],
                        'created_at' => $item->created_at,
                    ];
                }
                
                // For other items (designs, floor plans)
                return [
                    'id' => $item->id,
                    'wishlistable_id' => $item->wishlistable_id,
                    'wishlistable_type' => $item->wishlistable_type,
                    'item' => $wishlistable,
                    'created_at' => $item->created_at,
                ];
            });

        return Inertia::render('user/wishlist', [
            'wishlistItems' => $wishlistItems
        ]);
    }

    public function toggle(Request $request)
    {
        $validated = $request->validate([
            'wishlistable_id' => 'required|integer',
            'wishlistable_type' => 'required|string',
        ]);

        $userId = Auth::id();
        
        $wishlist = Wishlist::where('user_id', $userId)
            ->where('wishlistable_id', $validated['wishlistable_id'])
            ->where('wishlistable_type', $validated['wishlistable_type'])
            ->first();

        if ($wishlist) {
            $wishlist->delete();
            return back()->with('success', 'Removed from wishlist');
        }

        Wishlist::create([
            'user_id' => $userId,
            'wishlistable_id' => $validated['wishlistable_id'],
            'wishlistable_type' => $validated['wishlistable_type'],
        ]);

        return back()->with('success', 'Added to wishlist');
    }

    public function check(Request $request)
    {
        $validated = $request->validate([
            'wishlistable_id' => 'required|integer',
            'wishlistable_type' => 'required|string',
        ]);

        $exists = Wishlist::where('user_id', Auth::id())
            ->where('wishlistable_id', $validated['wishlistable_id'])
            ->where('wishlistable_type', $validated['wishlistable_type'])
            ->exists();

        return response()->json(['exists' => $exists]);
    }

    /**
     * API endpoint to toggle wishlist item
     */
    public function toggleApi(Request $request)
    {
        $validated = $request->validate([
            'wishlistable_id' => 'required|integer',
            'wishlistable_type' => 'required|string',
        ]);

        $userId = Auth::id();
        
        $wishlist = Wishlist::where('user_id', $userId)
            ->where('wishlistable_id', $validated['wishlistable_id'])
            ->where('wishlistable_type', $validated['wishlistable_type'])
            ->first();

        if ($wishlist) {
            $wishlist->delete();
            return response()->json([
                'saved' => false,
                'message' => 'Removed from wishlist'
            ]);
        }

        Wishlist::create([
            'user_id' => $userId,
            'wishlistable_id' => $validated['wishlistable_id'],
            'wishlistable_type' => $validated['wishlistable_type'],
        ]);

        return response()->json([
            'saved' => true,
            'message' => 'Added to wishlist'
        ]);
    }

    /**
     * API endpoint to check if item is in wishlist
     */
    public function checkApi(Request $request)
    {
        $validated = $request->validate([
            'wishlistable_id' => 'required|integer',
            'wishlistable_type' => 'required|string',
        ]);

        $exists = Wishlist::where('user_id', Auth::id())
            ->where('wishlistable_id', $validated['wishlistable_id'])
            ->where('wishlistable_type', $validated['wishlistable_type'])
            ->exists();

        return response()->json(['saved' => $exists]);
    }

    /**
     * Get all saved furniture IDs for the current user
     */
    public function getFurnitureIds()
    {
        $ids = Wishlist::where('user_id', Auth::id())
            ->where('wishlistable_type', 'App\\Models\\Furniture')
            ->pluck('wishlistable_id')
            ->toArray();

        return response()->json(['ids' => $ids]);
    }

    /**
     * Get all saved material IDs for the current user
     */
    public function getMaterialIds()
    {
        $ids = Wishlist::where('user_id', Auth::id())
            ->where('wishlistable_type', 'App\\Models\\Material')
            ->pluck('wishlistable_id')
            ->toArray();

        return response()->json(['ids' => $ids]);
    }
}

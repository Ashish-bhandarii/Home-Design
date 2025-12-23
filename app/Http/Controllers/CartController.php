<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Furniture;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Display the cart page
     */
    public function index()
    {
        $cartItems = Cart::where('user_id', Auth::id())
            ->with('cartable')
            ->latest()
            ->get()
            ->map(function ($item) {
                $cartable = $item->cartable;
                
                if ($item->cartable_type === 'App\\Models\\Furniture' && $cartable) {
                    return [
                        'id' => $item->id,
                        'cartable_id' => $item->cartable_id,
                        'cartable_type' => $item->cartable_type,
                        'quantity' => $item->quantity,
                        'item' => [
                            'id' => $cartable->id,
                            'name' => $cartable->name,
                            'description' => $cartable->description,
                            'image' => $cartable->image ? '/storage/' . $cartable->image : null,
                            'category' => $cartable->category,
                            'room' => $cartable->room,
                            'price' => $cartable->price,
                            'material' => $cartable->material,
                            'color' => $cartable->color,
                            'dimensions' => $cartable->dimensions,
                            'stock' => $cartable->stock,
                            'availability' => $cartable->availability ?? 'In Stock',
                        ],
                        'created_at' => $item->created_at,
                    ];
                }
                
                if ($item->cartable_type === 'App\\Models\\Material' && $cartable) {
                    return [
                        'id' => $item->id,
                        'cartable_id' => $item->cartable_id,
                        'cartable_type' => $item->cartable_type,
                        'quantity' => $item->quantity,
                        'item' => [
                            'id' => $cartable->id,
                            'name' => $cartable->name,
                            'description' => $cartable->description,
                            'image' => $cartable->image ? '/storage/' . $cartable->image : null,
                            'category' => $cartable->category,
                            'type' => $cartable->type,
                            'price' => $cartable->price_per_unit,
                            'unit' => $cartable->unit,
                            'color' => $cartable->color,
                            'brand' => $cartable->brand,
                            'stock' => $cartable->stock,
                            'availability' => $cartable->availability ?? 'In Stock',
                        ],
                        'created_at' => $item->created_at,
                    ];
                }
                
                return null;
            })
            ->filter();

        return Inertia::render('user/cart', [
            'cartItems' => $cartItems->values()
        ]);
    }

    /**
     * Add item to cart (API endpoint)
     */
    public function addToCart(Request $request)
    {
        $validated = $request->validate([
            'cartable_id' => 'required|integer',
            'cartable_type' => 'required|string',
            'quantity' => 'integer|min:1',
        ]);

        $userId = Auth::id();
        $quantity = $validated['quantity'] ?? 1;
        
        // Check stock availability
        $item = null;
        $availableStock = 0;
        
        if ($validated['cartable_type'] === 'App\\Models\\Furniture') {
            $item = Furniture::find($validated['cartable_id']);
            $availableStock = $item ? $item->stock : 0;
            $availability = $item ? $item->availability : null;
        } elseif ($validated['cartable_type'] === 'App\\Models\\Material') {
            $item = Material::find($validated['cartable_id']);
            $availableStock = $item ? $item->stock : 0;
            $availability = $item ? $item->availability : null;
        }
        
        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found',
            ], 404);
        }
        
        // Check if item already in cart
        $existingItem = Cart::where('user_id', $userId)
            ->where('cartable_id', $validated['cartable_id'])
            ->where('cartable_type', $validated['cartable_type'])
            ->first();
            
        $currentCartQty = $existingItem ? $existingItem->quantity : 0;
        $totalRequestedQty = $currentCartQty + $quantity;
        
        // Check if item is Made to Order or In Stock/Limited Stock (skip stock number check)
        $isMadeToOrder = $availability === 'Made to Order';
        $isInStock = $availability === 'In Stock' || $availability === 'Limited Stock';
        
        // Validate stock - only block if explicitly "Out of Stock"
        // For "In Stock" and "Limited Stock", the availability status takes priority over stock number
        if ($availability === 'Out of Stock') {
            return response()->json([
                'success' => false,
                'message' => 'This item is out of stock',
                'out_of_stock' => true,
            ], 400);
        }
        
        // Only check numeric stock for items that have stock tracking enabled (not Made to Order, and stock > 0)
        if (!$isMadeToOrder && !$isInStock && $availableStock <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'This item is out of stock',
                'out_of_stock' => true,
            ], 400);
        }
        
        // Only limit quantity if stock tracking is active and availability is not set to ignore stock
        if (!$isMadeToOrder && $availableStock > 0 && $totalRequestedQty > $availableStock) {
            return response()->json([
                'success' => false,
                'message' => "Only {$availableStock} items available in stock",
                'available_stock' => $availableStock,
            ], 400);
        }

        if ($existingItem) {
            $existingItem->quantity += $quantity;
            $existingItem->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Quantity updated in cart',
                'quantity' => $existingItem->quantity,
                'in_cart' => true,
            ]);
        }

        Cart::create([
            'user_id' => $userId,
            'cartable_id' => $validated['cartable_id'],
            'cartable_type' => $validated['cartable_type'],
            'quantity' => $quantity,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Added to cart',
            'in_cart' => true,
        ]);
    }

    /**
     * Remove item from cart (API endpoint)
     */
    public function removeFromCart(Request $request)
    {
        $validated = $request->validate([
            'cartable_id' => 'required|integer',
            'cartable_type' => 'required|string',
        ]);

        $userId = Auth::id();
        
        Cart::where('user_id', $userId)
            ->where('cartable_id', $validated['cartable_id'])
            ->where('cartable_type', $validated['cartable_type'])
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Removed from cart',
            'in_cart' => false,
        ]);
    }

    /**
     * Update quantity (API endpoint)
     */
    public function updateQuantity(Request $request)
    {
        $validated = $request->validate([
            'cart_id' => 'nullable|integer',
            'cartable_id' => 'nullable|integer',
            'cartable_type' => 'nullable|string',
            'quantity' => 'required|integer|min:1|max:99',
        ]);

        $userId = Auth::id();
        
        // Find by cart_id or by cartable_id + cartable_type
        if (!empty($validated['cart_id'])) {
            $cartItem = Cart::where('user_id', $userId)
                ->where('id', $validated['cart_id'])
                ->first();
        } else {
            $cartItem = Cart::where('user_id', $userId)
                ->where('cartable_id', $validated['cartable_id'])
                ->where('cartable_type', $validated['cartable_type'])
                ->first();
        }

        if (!$cartItem) {
            return response()->json([
                'success' => false,
                'message' => 'Item not found',
            ], 404);
        }

        // Check stock availability for new quantity
        $availableStock = 0;
        $availability = null;
        if ($cartItem->cartable_type === 'App\\Models\\Furniture') {
            $item = Furniture::find($cartItem->cartable_id);
            $availableStock = $item ? $item->stock : 0;
            $availability = $item ? $item->availability : null;
        } elseif ($cartItem->cartable_type === 'App\\Models\\Material') {
            $item = Material::find($cartItem->cartable_id);
            $availableStock = $item ? $item->stock : 0;
            $availability = $item ? $item->availability : null;
        }
        
        // Skip stock check for Made to Order items and items with availability set to In Stock/Limited Stock
        $isMadeToOrder = $availability === 'Made to Order';
        $isInStock = $availability === 'In Stock' || $availability === 'Limited Stock';
        
        // Only limit quantity if stock tracking is active (stock > 0) and not overridden by availability
        if (!$isMadeToOrder && !$isInStock && $availableStock > 0 && $validated['quantity'] > $availableStock) {
            return response()->json([
                'success' => false,
                'message' => "Only {$availableStock} items available in stock",
                'available_stock' => $availableStock,
            ], 400);
        }

        $cartItem->quantity = $validated['quantity'];
        $cartItem->save();

        return response()->json([
            'success' => true,
            'message' => 'Quantity updated',
            'quantity' => $cartItem->quantity,
        ]);
    }

    /**
     * Get cart item IDs for furniture
     */
    public function getFurnitureIds()
    {
        $ids = Cart::where('user_id', Auth::id())
            ->where('cartable_type', 'App\\Models\\Furniture')
            ->pluck('cartable_id')
            ->toArray();

        return response()->json(['ids' => $ids]);
    }

    /**
     * Get cart item IDs for materials
     */
    public function getMaterialIds()
    {
        $ids = Cart::where('user_id', Auth::id())
            ->where('cartable_type', 'App\\Models\\Material')
            ->pluck('cartable_id')
            ->toArray();

        return response()->json(['ids' => $ids]);
    }

    /**
     * Get cart count
     */
    public function getCount()
    {
        $count = Cart::where('user_id', Auth::id())->sum('quantity');

        return response()->json(['count' => $count]);
    }

    /**
     * Clear entire cart
     */
    public function clearCart()
    {
        Cart::where('user_id', Auth::id())->delete();

        return response()->json([
            'success' => true,
            'message' => 'Cart cleared',
        ]);
    }
}

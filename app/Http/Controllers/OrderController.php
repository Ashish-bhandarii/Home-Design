<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display the checkout page
     */
    public function checkout()
    {
        $user = Auth::user();
        $cartItems = Cart::where('user_id', $user->id)
            ->with('cartable')
            ->get()
            ->map(function ($item) {
                $cartable = $item->cartable;
                
                if (!$cartable) return null;

                $price = 0;
                $name = '';
                $image = null;

                if ($item->cartable_type === 'App\\Models\\Furniture') {
                    $price = $cartable->price ?? 0;
                    $name = $cartable->name;
                    $image = $cartable->image ? '/storage/' . $cartable->image : null;
                } elseif ($item->cartable_type === 'App\\Models\\Material') {
                    $price = $cartable->price_per_unit ?? 0;
                    $name = $cartable->name;
                    $image = $cartable->image ? '/storage/' . $cartable->image : null;
                }

                return [
                    'id' => $item->id,
                    'cartable_id' => $item->cartable_id,
                    'cartable_type' => $item->cartable_type,
                    'quantity' => $item->quantity,
                    'name' => $name,
                    'price' => $price,
                    'image' => $image,
                    'total' => $price * $item->quantity,
                ];
            })
            ->filter()
            ->values();

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart')->with('error', 'Your cart is empty');
        }

        $subtotal = $cartItems->sum('total');
        $tax = $subtotal * 0.13; // 13% VAT for Nepal
        $shipping = $subtotal >= 10000 ? 0 : 500; // Free shipping over Rs. 10,000
        $total = $subtotal + $tax + $shipping;

        return Inertia::render('user/checkout', [
            'cartItems' => $cartItems,
            'subtotal' => round($subtotal, 2),
            'tax' => round($tax, 2),
            'shipping' => round($shipping, 2),
            'total' => round($total, 2),
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    /**
     * Process the order
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'shipping_name' => 'required|string|max:255',
            'shipping_email' => 'required|email|max:255',
            'shipping_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string|max:500',
            'shipping_city' => 'required|string|max:100',
            'shipping_state' => 'nullable|string|max:100',
            'shipping_zip' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:1000',
            'payment_method' => 'required|in:cod,bank_transfer',
        ]);

        $user = Auth::user();
        $cartItems = Cart::where('user_id', $user->id)
            ->with('cartable')
            ->get();

        if ($cartItems->isEmpty()) {
            return back()->with('error', 'Your cart is empty');
        }

        try {
            DB::beginTransaction();

            // Calculate totals
            $subtotal = 0;
            $orderItems = [];

            foreach ($cartItems as $item) {
                $cartable = $item->cartable;
                if (!$cartable) continue;

                $price = 0;
                $name = '';
                $description = '';
                $image = null;

                if ($item->cartable_type === 'App\\Models\\Furniture') {
                    $price = $cartable->price ?? 0;
                    $name = $cartable->name;
                    $description = $cartable->description;
                    $image = $cartable->image;
                } elseif ($item->cartable_type === 'App\\Models\\Material') {
                    $price = $cartable->price_per_unit ?? 0;
                    $name = $cartable->name;
                    $description = $cartable->description;
                    $image = $cartable->image;
                }

                $itemTotal = $price * $item->quantity;
                $subtotal += $itemTotal;

                $orderItems[] = [
                    'orderable_id' => $item->cartable_id,
                    'orderable_type' => $item->cartable_type,
                    'name' => $name,
                    'description' => $description,
                    'image' => $image,
                    'price' => $price,
                    'quantity' => $item->quantity,
                    'total' => $itemTotal,
                ];
            }

            $tax = $subtotal * 0.13;
            $shipping = $subtotal >= 10000 ? 0 : 500;
            $total = $subtotal + $tax + $shipping;

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => Order::generateOrderNumber(),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'tax' => $tax,
                'shipping' => $shipping,
                'total' => $total,
                'shipping_name' => $validated['shipping_name'],
                'shipping_email' => $validated['shipping_email'],
                'shipping_phone' => $validated['shipping_phone'],
                'shipping_address' => $validated['shipping_address'],
                'shipping_city' => $validated['shipping_city'],
                'shipping_state' => $validated['shipping_state'],
                'shipping_zip' => $validated['shipping_zip'],
                'notes' => $validated['notes'],
                'payment_method' => $validated['payment_method'],
                'payment_status' => 'pending',
            ]);

            // Create order items
            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            // Clear cart
            Cart::where('user_id', $user->id)->delete();

            DB::commit();

            return redirect()->route('orders.success', $order->id);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Failed to process order. Please try again.');
        }
    }

    /**
     * Display order success page
     */
    public function success(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        $order->load('items');

        return Inertia::render('user/order-success', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'subtotal' => $order->subtotal,
                'tax' => $order->tax,
                'shipping' => $order->shipping,
                'total' => $order->total,
                'shipping_name' => $order->shipping_name,
                'shipping_email' => $order->shipping_email,
                'shipping_phone' => $order->shipping_phone,
                'shipping_address' => $order->shipping_address,
                'shipping_city' => $order->shipping_city,
                'payment_method' => $order->payment_method,
                'created_at' => $order->created_at->format('M d, Y h:i A'),
                'items' => $order->items->map(fn($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'image' => $item->image ? '/storage/' . $item->image : null,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'total' => $item->total,
                ]),
            ],
        ]);
    }

    /**
     * Display user's orders
     */
    public function index()
    {
        $orders = Order::where('user_id', Auth::id())
            ->with('items')
            ->latest()
            ->paginate(10);

        return Inertia::render('user/orders', [
            'orders' => $orders->through(fn($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'total' => $order->total,
                'items_count' => $order->items->count(),
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'created_at' => $order->created_at->format('M d, Y'),
            ]),
        ]);
    }

    /**
     * Display single order
     */
    public function show(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        $order->load('items');

        return Inertia::render('user/order-show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status,
                'subtotal' => $order->subtotal,
                'tax' => $order->tax,
                'shipping' => $order->shipping,
                'total' => $order->total,
                'shipping_name' => $order->shipping_name,
                'shipping_email' => $order->shipping_email,
                'shipping_phone' => $order->shipping_phone,
                'shipping_address' => $order->shipping_address,
                'shipping_city' => $order->shipping_city,
                'shipping_state' => $order->shipping_state,
                'shipping_zip' => $order->shipping_zip,
                'notes' => $order->notes,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'created_at' => $order->created_at->format('M d, Y h:i A'),
                'items' => $order->items->map(fn($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'description' => $item->description,
                    'image' => $item->image ? '/storage/' . $item->image : null,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'total' => $item->total,
                    'type' => str_contains($item->orderable_type, 'Furniture') ? 'furniture' : 'material',
                ]),
            ],
        ]);
    }

    /**
     * Cancel an order (only allowed for pending or confirmed status)
     */
    public function cancel(Order $order)
    {
        if ($order->user_id !== Auth::id()) {
            abort(403);
        }

        // Only allow cancellation for pending or confirmed orders
        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return back()->with('error', 'This order cannot be cancelled as it is already being processed.');
        }

        $order->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'Order has been cancelled successfully.');
    }
}

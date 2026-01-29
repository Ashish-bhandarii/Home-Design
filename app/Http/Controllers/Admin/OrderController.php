<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Furniture;
use App\Models\Material;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display list of all orders
     */
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items'])
            ->latest();

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by payment status
        if ($request->has('payment_status') && $request->payment_status !== 'all') {
            $query->where('payment_status', $request->payment_status);
        }

        // Search by order number or customer name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('shipping_name', 'like', "%{$search}%")
                  ->orWhere('shipping_email', 'like', "%{$search}%")
                  ->orWhere('shipping_phone', 'like', "%{$search}%");
            });
        }

        $orders = $query->paginate(15)->withQueryString();

        // Get counts for status tabs
        $statusCounts = [
            'all' => Order::count(),
            'pending' => Order::where('status', 'pending')->count(),
            'confirmed' => Order::where('status', 'confirmed')->count(),
            'processing' => Order::where('status', 'processing')->count(),
            'shipped' => Order::where('status', 'shipped')->count(),
            'delivered' => Order::where('status', 'delivered')->count(),
            'cancelled' => Order::where('status', 'cancelled')->count(),
        ];

        return Inertia::render('admin/orders/index', [
            'orders' => $orders->through(fn($order) => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->shipping_name,
                'customer_email' => $order->shipping_email,
                'customer_phone' => $order->shipping_phone,
                'items_count' => $order->items->count(),
                'total' => $order->total,
                'status' => $order->status,
                'payment_method' => $order->payment_method,
                'payment_status' => $order->payment_status,
                'created_at' => $order->created_at->format('M d, Y h:i A'),
            ]),
            'statusCounts' => $statusCounts,
            'filters' => [
                'status' => $request->status ?? 'all',
                'payment_status' => $request->payment_status ?? 'all',
                'search' => $request->search ?? '',
            ],
        ]);
    }

    /**
     * Display single order details
     */
    public function show(Order $order)
    {
        $order->load(['user', 'items']);

        return Inertia::render('admin/orders/show', [
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
                'paid_at' => $order->paid_at?->format('M d, Y h:i A'),
                'created_at' => $order->created_at->format('M d, Y h:i A'),
                'updated_at' => $order->updated_at->format('M d, Y h:i A'),
                'user' => $order->user ? [
                    'id' => $order->user->id,
                    'name' => $order->user->name,
                    'email' => $order->user->email,
                ] : null,
                'items' => $order->items->map(fn($item) => [
                    'id' => $item->id,
                    'name' => $item->name,
                    'description' => $item->description,
                    'image' => $item->image ? (str_starts_with($item->image, 'http') ? $item->image : '/storage/' . $item->image) : null,
                    'price' => $item->price,
                    'quantity' => $item->quantity,
                    'total' => $item->total,
                    'type' => str_contains($item->orderable_type, 'Furniture') ? 'furniture' : 'material',
                ]),
            ],
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled',
        ]);

        $previousStatus = $order->status;
        $newStatus = $validated['status'];

        // If order is being cancelled and was not already cancelled, restore stock
        if ($newStatus === 'cancelled' && $previousStatus !== 'cancelled') {
            $order->load('items');
            foreach ($order->items as $item) {
                if ($item->orderable_type === 'App\\Models\\Furniture') {
                    $furniture = Furniture::find($item->orderable_id);
                    if ($furniture && $furniture->stock !== null) {
                        $furniture->stock += $item->quantity;
                        $furniture->save();
                    }
                } elseif ($item->orderable_type === 'App\\Models\\Material') {
                    $material = Material::find($item->orderable_id);
                    if ($material && $material->stock !== null) {
                        $material->stock += $item->quantity;
                        $material->save();
                    }
                }
            }
        }

        // If order was cancelled and is now being restored to another status, decrement stock again
        if ($previousStatus === 'cancelled' && $newStatus !== 'cancelled') {
            $order->load('items');
            foreach ($order->items as $item) {
                if ($item->orderable_type === 'App\\Models\\Furniture') {
                    $furniture = Furniture::find($item->orderable_id);
                    if ($furniture && $furniture->stock !== null) {
                        // Check if there's enough stock
                        if ($furniture->stock < $item->quantity) {
                            return back()->with('error', "Cannot restore order. Insufficient stock for {$item->name}.");
                        }
                        $furniture->stock = max(0, $furniture->stock - $item->quantity);
                        $furniture->save();
                    }
                } elseif ($item->orderable_type === 'App\\Models\\Material') {
                    $material = Material::find($item->orderable_id);
                    if ($material && $material->stock !== null) {
                        // Check if there's enough stock
                        if ($material->stock < $item->quantity) {
                            return back()->with('error', "Cannot restore order. Insufficient stock for {$item->name}.");
                        }
                        $material->stock = max(0, $material->stock - $item->quantity);
                        $material->save();
                    }
                }
            }
        }

        $order->status = $newStatus;
        $order->save();

        return back()->with('success', 'Order status updated successfully');
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'payment_status' => 'required|in:pending,paid,failed,refunded',
        ]);

        $order->payment_status = $validated['payment_status'];
        
        if ($validated['payment_status'] === 'paid' && !$order->paid_at) {
            $order->paid_at = now();
        }
        
        $order->save();

        return back()->with('success', 'Payment status updated successfully');
    }

    /**
     * Delete an order
     */
    public function destroy(Order $order)
    {
        // Restore stock if order was not already cancelled
        if ($order->status !== 'cancelled') {
            $order->load('items');
            foreach ($order->items as $item) {
                if ($item->orderable_type === 'App\\Models\\Furniture') {
                    $furniture = Furniture::find($item->orderable_id);
                    if ($furniture) {
                        $furniture->stock += $item->quantity;
                        if ($furniture->stock > 5) {
                            $furniture->availability = 'In Stock';
                        } elseif ($furniture->stock > 0) {
                            $furniture->availability = 'Low Stock';
                        }
                        $furniture->save();
                    }
                } elseif ($item->orderable_type === 'App\\Models\\Material') {
                    $material = Material::find($item->orderable_id);
                    if ($material) {
                        $material->stock += $item->quantity;
                        if ($material->stock > 5) {
                            $material->availability = 'In Stock';
                        } elseif ($material->stock > 0) {
                            $material->availability = 'Low Stock';
                        }
                        $material->save();
                    }
                }
            }
        }

        $order->items()->delete();
        $order->delete();

        return redirect()->route('admin.orders.index')->with('success', 'Order deleted successfully');
    }
}

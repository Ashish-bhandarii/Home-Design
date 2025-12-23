import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { ArrowRight, Minus, Package, Plus, ShoppingBag, ShoppingCart, Sofa, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cart', href: '/cart' },
];

interface CartItem {
    id: number;
    cartable_id: number;
    cartable_type: string;
    quantity: number;
    item: {
        id: number;
        name: string;
        description?: string;
        image?: string;
        category?: string;
        room?: string;
        price: number;
        material?: string;
        color?: string;
        brand?: string;
        unit?: string;
        type?: string;
        stock?: number;
        availability?: string;
        dimensions?: {
            width?: number;
            height?: number;
            depth?: number;
        };
    };
    created_at: string;
}

interface Props {
    cartItems: CartItem[];
}

export default function Cart({ cartItems: initialCartItems }: Props) {
    const { showToast } = useToast();
    const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const [removingId, setRemovingId] = useState<number | null>(null);

    const isFurniture = (item: CartItem) => item.cartable_type.includes('Furniture');

    const updateQuantity = async (item: CartItem, newQuantity: number) => {
        if (newQuantity < 1) return;
        if (newQuantity > 99) return;
        
        // Check stock limit (skip for Made to Order items)
        const stock = item.item.stock;
        const isMadeToOrder = item.item.availability === 'Made to Order';
        if (!isMadeToOrder && stock !== undefined && newQuantity > stock) {
            showToast(`Only ${stock} items available in stock`, 'error');
            return;
        }

        setUpdatingId(item.id);
        try {
            await axios.post('/api/cart/update-quantity', {
                cartable_id: item.cartable_id,
                cartable_type: item.cartable_type,
                quantity: newQuantity,
            });
            setCartItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, quantity: newQuantity } : i))
            );
        } catch (error: any) {
            console.error('Failed to update quantity:', error);
            const message = error.response?.data?.message || 'Failed to update quantity';
            showToast(message, 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const removeItem = async (item: CartItem) => {
        setRemovingId(item.id);
        try {
            await axios.post('/api/cart/remove', {
                cartable_id: item.cartable_id,
                cartable_type: item.cartable_type,
            });
            setCartItems((prev) => prev.filter((i) => i.id !== item.id));
            showToast(`${item.item.name} removed from cart`, 'info');
        } catch (error) {
            console.error('Failed to remove item:', error);
            showToast('Failed to remove item', 'error');
        } finally {
            setRemovingId(null);
        }
    };

    const clearCart = async () => {
        try {
            await axios.post('/api/cart/clear');
            setCartItems([]);
            showToast('Cart cleared', 'info');
        } catch (error) {
            console.error('Failed to clear cart:', error);
            showToast('Failed to clear cart', 'error');
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.item.price * item.quantity, 0);
    const tax = subtotal * 0.13; // 13% VAT
    const shipping = subtotal >= 10000 ? 0 : 500; // Free shipping over Rs. 10,000
    const total = subtotal + tax + shipping;

    const furnitureItems = cartItems.filter(isFurniture);
    const materialItems = cartItems.filter((item) => !isFurniture(item));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Cart" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Shopping Cart</h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                            </p>
                        </div>
                    </div>
                    {cartItems.length > 0 && (
                        <button
                            onClick={clearCart}
                            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-950"
                        >
                            <Trash2 className="h-4 w-4" />
                            Clear Cart
                        </button>
                    )}
                </div>

                {cartItems.length === 0 ? (
                    /* Empty Cart */
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <ShoppingBag className="h-10 w-10 text-zinc-400" />
                        </div>
                        <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">Your cart is empty</h2>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            Start adding furniture and materials to your cart
                        </p>
                        <div className="mt-6 flex gap-4">
                            <Link
                                href="/library/furniture"
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                            >
                                <Sofa className="h-4 w-4" />
                                Browse Furniture
                            </Link>
                            <Link
                                href="/library/materials"
                                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-6 py-3 text-sm font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                            >
                                <Package className="h-4 w-4" />
                                Browse Materials
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Furniture Section */}
                            {furnitureItems.length > 0 && (
                                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="mb-4 flex items-center gap-2">
                                        <Sofa className="h-5 w-5 text-purple-500" />
                                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                            Furniture ({furnitureItems.length})
                                        </h2>
                                    </div>
                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {furnitureItems.map((item) => (
                                            <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                                {/* Image */}
                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                                                    {item.item.image ? (
                                                        <img
                                                            src={item.item.image}
                                                            alt={item.item.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <Sofa className="h-8 w-8 text-zinc-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                                                            {item.item.name}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                                            {item.item.category} • {item.item.room}
                                                        </p>
                                                        {/* Stock Warning */}
                                                        {item.item.availability === 'Made to Order' ? (
                                                            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                                                Made to order • 2-4 weeks delivery
                                                            </p>
                                                        ) : item.item.availability === 'Out of Stock' || (item.item.stock !== undefined && item.item.stock <= 0) ? (
                                                            <p className="mt-1 text-xs font-medium text-red-500">
                                                                Out of Stock - Please remove this item
                                                            </p>
                                                        ) : item.item.availability === 'Limited Stock' || (item.item.stock !== undefined && item.item.stock > 0 && item.item.stock <= 5) ? (
                                                            <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                                                                {item.item.availability === 'Limited Stock' ? 'Limited Stock' : `Only ${item.item.stock} left in stock`}
                                                            </p>
                                                        ) : null}
                                                        {item.item.availability !== 'Made to Order' && item.item.stock !== undefined && item.quantity > item.item.stock && (
                                                            <p className="mt-1 text-xs font-medium text-red-500">
                                                                Quantity exceeds available stock ({item.item.stock})
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => updateQuantity(item, item.quantity - 1)}
                                                                disabled={updatingId === item.id || item.quantity <= 1}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </button>
                                                            <span className="w-12 text-center font-medium text-zinc-900 dark:text-white">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item, item.quantity + 1)}
                                                                disabled={updatingId === item.id || (item.item.availability !== 'Made to Order' && item.item.stock !== undefined && item.quantity >= item.item.stock)}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                                Rs. {(item.item.price * item.quantity).toLocaleString()}
                                                            </span>
                                                            <button
                                                                onClick={() => removeItem(item)}
                                                                disabled={removingId === item.id}
                                                                className="text-red-500 transition-colors hover:text-red-600"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Materials Section */}
                            {materialItems.length > 0 && (
                                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <div className="mb-4 flex items-center gap-2">
                                        <Package className="h-5 w-5 text-blue-500" />
                                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                            Materials ({materialItems.length})
                                        </h2>
                                    </div>
                                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {materialItems.map((item) => (
                                            <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                                {/* Image */}
                                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                                                    {item.item.image ? (
                                                        <img
                                                            src={item.item.image}
                                                            alt={item.item.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <Package className="h-8 w-8 text-zinc-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex flex-1 flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-zinc-900 dark:text-white">
                                                            {item.item.name}
                                                        </h3>
                                                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                                            {item.item.category} • {item.item.brand}
                                                            {item.item.unit && ` • per ${item.item.unit}`}
                                                        </p>
                                                        {/* Stock Warning */}
                                                        {item.item.availability === 'Made to Order' ? (
                                                            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                                                                Made to order • 2-4 weeks delivery
                                                            </p>
                                                        ) : item.item.availability === 'Out of Stock' || (item.item.stock !== undefined && item.item.stock <= 0) ? (
                                                            <p className="mt-1 text-xs font-medium text-red-500">
                                                                Out of Stock - Please remove this item
                                                            </p>
                                                        ) : item.item.availability === 'Limited Stock' || (item.item.stock !== undefined && item.item.stock > 0 && item.item.stock <= 5) ? (
                                                            <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                                                                {item.item.availability === 'Limited Stock' ? 'Limited Stock' : `Only ${item.item.stock} left in stock`}
                                                            </p>
                                                        ) : null}
                                                        {item.item.availability !== 'Made to Order' && item.item.stock !== undefined && item.quantity > item.item.stock && (
                                                            <p className="mt-1 text-xs font-medium text-red-500">
                                                                Quantity exceeds available stock ({item.item.stock})
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => updateQuantity(item, item.quantity - 1)}
                                                                disabled={updatingId === item.id || item.quantity <= 1}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                                            >
                                                                <Minus className="h-4 w-4" />
                                                            </button>
                                                            <span className="w-12 text-center font-medium text-zinc-900 dark:text-white">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item, item.quantity + 1)}
                                                                disabled={updatingId === item.id || (item.item.availability !== 'Made to Order' && item.item.stock !== undefined && item.quantity >= item.item.stock)}
                                                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                                                            >
                                                                <Plus className="h-4 w-4" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                                                Rs. {(item.item.price * item.quantity).toLocaleString()}
                                                            </span>
                                                            <button
                                                                onClick={() => removeItem(item)}
                                                                disabled={removingId === item.id}
                                                                className="text-red-500 transition-colors hover:text-red-600"
                                                            >
                                                                <Trash2 className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Order Summary</h2>

                                <div className="mt-6 space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            Rs. {subtotal.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">VAT (13%)</span>
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            Rs. {tax.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">Shipping</span>
                                        <span className="font-medium text-zinc-900 dark:text-white">
                                            {shipping === 0 ? (
                                                <span className="text-green-600">Free</span>
                                            ) : (
                                                `Rs. ${shipping.toLocaleString()}`
                                            )}
                                        </span>
                                    </div>
                                    {subtotal < 10000 && (
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                            Add Rs. {(10000 - subtotal).toLocaleString()} more for free shipping
                                        </p>
                                    )}
                                    <div className="border-t border-zinc-200 pt-4 dark:border-zinc-700">
                                        <div className="flex justify-between">
                                            <span className="text-base font-semibold text-zinc-900 dark:text-white">
                                                Total
                                            </span>
                                            <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                                Rs. {total.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="h-5 w-5" />
                                </Link>

                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                        />
                                    </svg>
                                    Secure checkout
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

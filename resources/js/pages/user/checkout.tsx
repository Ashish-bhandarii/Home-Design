import { useToast } from '@/hooks/use-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CreditCard, MapPin, Package, ShoppingBag, Truck, User } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cart', href: '/cart' },
    { title: 'Checkout', href: '/checkout' },
];

interface CartItem {
    id: number;
    cartable_id: number;
    cartable_type: string;
    quantity: number;
    name: string;
    price: number;
    image?: string;
    total: number;
}

interface Props {
    cartItems: CartItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    user: {
        name: string;
        email: string;
    };
}

export default function Checkout({ cartItems, subtotal, tax, shipping, total, user }: Props) {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, errors, processing } = useForm({
        shipping_name: user.name || '',
        shipping_email: user.email || '',
        shipping_phone: '',
        shipping_address: '',
        shipping_city: '',
        shipping_state: '',
        shipping_zip: '',
        notes: '',
        payment_method: 'cod',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        post('/orders', {
            onError: () => {
                showToast('Failed to place order. Please try again.', 'error');
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Checkout" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.visit('/cart')}
                        className="mb-4 flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Cart
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg">
                            <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Checkout</h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Complete your order
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Checkout Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Contact Information */}
                            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <User className="h-5 w-5 text-purple-500" />
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        Contact Information
                                    </h2>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.shipping_name}
                                            onChange={(e) => setData('shipping_name', e.target.value)}
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                            placeholder="John Doe"
                                            required
                                        />
                                        {errors.shipping_name && (
                                            <p className="mt-1 text-sm text-red-500">{errors.shipping_name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={data.shipping_email}
                                            onChange={(e) => setData('shipping_email', e.target.value)}
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                            placeholder="john@example.com"
                                            required
                                        />
                                        {errors.shipping_email && (
                                            <p className="mt-1 text-sm text-red-500">{errors.shipping_email}</p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.shipping_phone}
                                            onChange={(e) => setData('shipping_phone', e.target.value)}
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                            placeholder="+977 98XXXXXXXX"
                                            required
                                        />
                                        {errors.shipping_phone && (
                                            <p className="mt-1 text-sm text-red-500">{errors.shipping_phone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-blue-500" />
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        Shipping Address
                                    </h2>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Street Address *
                                        </label>
                                        <textarea
                                            value={data.shipping_address}
                                            onChange={(e) => setData('shipping_address', e.target.value)}
                                            rows={2}
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                            placeholder="House No., Street Name, Tole"
                                            required
                                        />
                                        {errors.shipping_address && (
                                            <p className="mt-1 text-sm text-red-500">{errors.shipping_address}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.shipping_city}
                                            onChange={(e) => setData('shipping_city', e.target.value)}
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                            placeholder="Kathmandu"
                                            required
                                        />
                                        {errors.shipping_city && (
                                            <p className="mt-1 text-sm text-red-500">{errors.shipping_city}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            State/Province
                                        </label>
                                        <select
                                            value={data.shipping_state}
                                            onChange={(e) => setData('shipping_state', e.target.value)}
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                        >
                                            <option value="">Select Province</option>
                                            <option value="Province 1">Province 1 (Koshi)</option>
                                            <option value="Madhesh">Madhesh Province</option>
                                            <option value="Bagmati">Bagmati Province</option>
                                            <option value="Gandaki">Gandaki Province</option>
                                            <option value="Lumbini">Lumbini Province</option>
                                            <option value="Karnali">Karnali Province</option>
                                            <option value="Sudurpashchim">Sudurpashchim Province</option>
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Postal Code
                                        </label>
                                        <input
                                            type="text"
                                            value={data.shipping_zip}
                                            onChange={(e) => setData('shipping_zip', e.target.value)}
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                            placeholder="44600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-green-500" />
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        Payment Method
                                    </h2>
                                </div>
                                <div className="space-y-3">
                                    <label className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-colors ${data.payment_method === 'cod' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'}`}>
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="cod"
                                            checked={data.payment_method === 'cod'}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="h-5 w-5 border-zinc-300 text-orange-500 focus:ring-orange-500"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Truck className="h-5 w-5 text-orange-500" />
                                                <span className="font-medium text-zinc-900 dark:text-white">
                                                    Cash on Delivery
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                                Pay when your order arrives
                                            </p>
                                        </div>
                                    </label>
                                    <label className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-colors ${data.payment_method === 'bank_transfer' ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600'}`}>
                                        <input
                                            type="radio"
                                            name="payment_method"
                                            value="bank_transfer"
                                            checked={data.payment_method === 'bank_transfer'}
                                            onChange={(e) => setData('payment_method', e.target.value)}
                                            className="h-5 w-5 border-zinc-300 text-orange-500 focus:ring-orange-500"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="h-5 w-5 text-blue-500" />
                                                <span className="font-medium text-zinc-900 dark:text-white">
                                                    Bank Transfer
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                                Transfer to our bank account
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Order Notes */}
                            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="mb-4 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-pink-500" />
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        Order Notes (Optional)
                                    </h2>
                                </div>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                                    placeholder="Special instructions for delivery, preferred delivery time, etc."
                                />
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        Order Summary
                                    </h2>

                                    {/* Items */}
                                    <div className="mt-4 max-h-64 space-y-3 overflow-y-auto">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex items-center gap-3">
                                                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center">
                                                            <ShoppingBag className="h-6 w-6 text-zinc-400" />
                                                        </div>
                                                    )}
                                                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-medium text-white">
                                                        {item.quantity}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                        Rs. {item.price.toLocaleString()} × {item.quantity}
                                                    </p>
                                                </div>
                                                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                                                    Rs. {item.total.toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-6 space-y-3 border-t border-zinc-200 pt-4 dark:border-zinc-700">
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
                                        <div className="border-t border-zinc-200 pt-3 dark:border-zinc-700">
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
                                </div>

                                <button
                                    type="submit"
                                    disabled={processing || isSubmitting}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 py-4 font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {processing || isSubmitting ? (
                                        <>
                                            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            Place Order
                                            <ShoppingBag className="h-5 w-5" />
                                        </>
                                    )}
                                </button>

                                <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                                    By placing your order, you agree to our Terms of Service and Privacy Policy
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

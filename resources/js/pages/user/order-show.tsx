import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CreditCard, MapPin, Package, Truck, User, XCircle } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
    id: number;
    name: string;
    description?: string;
    image?: string;
    price: number;
    quantity: number;
    total: number;
    type: 'furniture' | 'material';
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    shipping_name: string;
    shipping_email: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state?: string;
    shipping_zip?: string;
    notes?: string;
    payment_method: string;
    payment_status: string;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    order: Order;
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', dot: 'bg-yellow-500' },
    confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400', dot: 'bg-blue-500' },
    processing: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-400', dot: 'bg-indigo-500' },
    shipped: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-400', dot: 'bg-purple-500' },
    delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', dot: 'bg-green-500' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', dot: 'bg-red-500' },
};

export default function OrderShow({ order }: Props) {
    const [cancelling, setCancelling] = useState(false);
    
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Orders', href: '/orders' },
        { title: order.order_number, href: `/orders/${order.id}` },
    ];

    const statusStyle = statusColors[order.status] || statusColors.pending;
    
    // Check if order can be cancelled (only pending or confirmed)
    const canCancel = ['pending', 'confirmed'].includes(order.status);

    const handleCancelOrder = () => {
        if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) return;
        
        setCancelling(true);
        router.post(`/orders/${order.id}/cancel`, {}, {
            onFinish: () => setCancelling(false),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />

            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    href="/orders"
                    className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Orders
                </Link>

                {/* Header */}
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{order.order_number}</h1>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Placed on {order.created_at}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`}></span>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        {canCancel && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelling}
                                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50"
                            >
                                <XCircle className="h-4 w-4" />
                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="mb-4 flex items-center gap-2">
                                <Package className="h-5 w-5 text-purple-500" />
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    Order Items ({order.items.length})
                                </h2>
                            </div>
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center">
                                                    <Package className="h-8 w-8 text-zinc-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                                                        {item.name}
                                                    </h3>
                                                    <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                                                        <span className="capitalize">{item.type}</span> • Qty: {item.quantity}
                                                    </p>
                                                    {item.description && (
                                                        <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-zinc-900 dark:text-white">
                                                        Rs. {item.total.toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                        Rs. {item.price.toLocaleString()} each
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
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
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                        <User className="h-4 w-4" />
                                        Contact
                                    </div>
                                    <p className="mt-1 font-medium text-zinc-900 dark:text-white">{order.shipping_name}</p>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{order.shipping_email}</p>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{order.shipping_phone}</p>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                        <Truck className="h-4 w-4" />
                                        Delivery Address
                                    </div>
                                    <p className="mt-1 font-medium text-zinc-900 dark:text-white">{order.shipping_address}</p>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        {order.shipping_city}
                                        {order.shipping_state && `, ${order.shipping_state}`}
                                        {order.shipping_zip && ` - ${order.shipping_zip}`}
                                    </p>
                                </div>
                            </div>
                            {order.notes && (
                                <div className="mt-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Order Notes:</p>
                                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{order.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* Order Summary */}
                            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Order Summary</h2>
                                <div className="mt-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
                                        <span className="text-zinc-900 dark:text-white">Rs. {order.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">VAT (13%)</span>
                                        <span className="text-zinc-900 dark:text-white">Rs. {order.tax.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">Shipping</span>
                                        <span className="text-zinc-900 dark:text-white">
                                            {order.shipping === 0 ? 'Free' : `Rs. ${order.shipping.toLocaleString()}`}
                                        </span>
                                    </div>
                                    <div className="border-t border-zinc-200 pt-3 dark:border-zinc-700">
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-zinc-900 dark:text-white">Total</span>
                                            <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                                Rs. {order.total.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-green-500" />
                                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Payment</h2>
                                </div>
                                <div className="mt-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">Method</span>
                                        <span className="text-zinc-900 dark:text-white">
                                            {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">Status</span>
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                                            order.payment_status === 'paid' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                        }`}>
                                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Need Help */}
                            <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 p-6 dark:from-orange-950/20 dark:to-pink-950/20">
                                <h3 className="font-semibold text-zinc-900 dark:text-white">Need Help?</h3>
                                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                    If you have any questions about your order, please contact our support team.
                                </p>
                                <Link
                                    href="/help"
                                    className="mt-4 inline-block text-sm font-medium text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                                >
                                    Contact Support →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

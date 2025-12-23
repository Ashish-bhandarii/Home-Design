import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Home, Package, ShoppingBag } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Order Confirmed', href: '#' },
];

interface OrderItem {
    id: number;
    name: string;
    image?: string;
    price: number;
    quantity: number;
    total: number;
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
    payment_method: string;
    created_at: string;
    items: OrderItem[];
}

interface Props {
    order: Order;
}

export default function OrderSuccess({ order }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Order Confirmed" />

            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                {/* Success Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Order Confirmed!</h1>
                    <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                        Thank you for your order. We'll send you a confirmation email shortly.
                    </p>
                </div>

                {/* Order Details Card */}
                <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-4 dark:border-zinc-700">
                        <div>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Order Number</p>
                            <p className="text-lg font-bold text-zinc-900 dark:text-white">{order.order_number}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">Order Date</p>
                            <p className="font-medium text-zinc-900 dark:text-white">{order.created_at}</p>
                        </div>
                    </div>

                    {/* Order Status */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                • {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                            </span>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="mb-6">
                        <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">Order Items</h3>
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center">
                                                <Package className="h-6 w-6 text-zinc-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-zinc-900 dark:text-white">{item.name}</p>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                            Rs. {item.price.toLocaleString()} × {item.quantity}
                                        </p>
                                    </div>
                                    <span className="font-semibold text-zinc-900 dark:text-white">
                                        Rs. {item.total.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mb-6 space-y-2 border-t border-zinc-200 pt-4 dark:border-zinc-700">
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
                        <div className="flex justify-between border-t border-zinc-200 pt-2 dark:border-zinc-700">
                            <span className="font-semibold text-zinc-900 dark:text-white">Total</span>
                            <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                Rs. {order.total.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                        <h4 className="mb-2 font-semibold text-zinc-900 dark:text-white">Shipping Address</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {order.shipping_name}<br />
                            {order.shipping_address}<br />
                            {order.shipping_city}<br />
                            Phone: {order.shipping_phone}<br />
                            Email: {order.shipping_email}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                    <Link
                        href="/orders"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-3 font-semibold text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
                    >
                        <ShoppingBag className="h-5 w-5" />
                        View All Orders
                    </Link>
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                    >
                        <Home className="h-5 w-5" />
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Package, ShoppingBag } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Orders', href: '/orders' },
];

interface Order {
    id: number;
    order_number: string;
    status: string;
    total: number;
    items_count: number;
    payment_method: string;
    payment_status: string;
    created_at: string;
}

interface Props {
    orders: {
        data: Order[];
        links: any[];
        current_page: number;
        last_page: number;
    };
}

const statusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400' },
    confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400' },
    processing: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-400' },
    shipped: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-400' },
    delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400' },
};

const paymentStatusColors: Record<string, { bg: string; text: string }> = {
    pending: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-400' },
    paid: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400' },
    failed: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400' },
    refunded: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-400' },
};

export default function Orders({ orders }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Orders" />

            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg">
                        <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Orders</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Track and manage your orders
                        </p>
                    </div>
                </div>

                {orders.data.length === 0 ? (
                    /* Empty State */
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <Package className="h-10 w-10 text-zinc-400" />
                        </div>
                        <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-white">No orders yet</h2>
                        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                            Your orders will appear here once you make a purchase
                        </p>
                        <Link
                            href="/library/furniture"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.data.map((order) => {
                            const statusStyle = statusColors[order.status] || statusColors.pending;
                            const paymentStyle = paymentStatusColors[order.payment_status] || paymentStatusColors.pending;

                            return (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="group block rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-orange-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-orange-900"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                                    {order.order_number}
                                                </h3>
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                                                {order.created_at} • {order.items_count} {order.items_count === 1 ? 'item' : 'items'}
                                            </p>
                                            <div className="mt-3 flex flex-wrap items-center gap-3">
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStyle.bg} ${paymentStyle.text}`}>
                                                    Payment: {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                                </span>
                                                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">Total</p>
                                                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                                    Rs. {order.total.toLocaleString()}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-orange-500" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="flex justify-center gap-2 pt-6">
                                {orders.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                            link.active
                                                ? 'bg-orange-500 text-white'
                                                : link.url
                                                ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                                                : 'cursor-not-allowed bg-zinc-50 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

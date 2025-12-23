import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    Package,
    Search,
    ShoppingBag,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Admin', href: '/admin' },
    { title: 'Orders', href: '/admin/orders' },
];

interface Order {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    items_count: number;
    total: number;
    status: string;
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
        total: number;
    };
    statusCounts: {
        all: number;
        pending: number;
        confirmed: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
    filters: {
        status: string;
        payment_status: string;
        search: string;
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

export default function AdminOrders({ orders, statusCounts, filters }: Props) {
    const [search, setSearch] = useState(filters.search);
    const [deleting, setDeleting] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/orders', { ...filters, search }, { preserveState: true });
    };

    const handleStatusFilter = (status: string) => {
        router.get('/admin/orders', { ...filters, status, search }, { preserveState: true });
    };

    const handleDelete = (orderId: number) => {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
        setDeleting(orderId);
        router.delete(`/admin/orders/${orderId}`, {
            onFinish: () => setDeleting(null),
        });
    };

    const statusTabs = [
        { key: 'all', label: 'All Orders', count: statusCounts.all },
        { key: 'pending', label: 'Pending', count: statusCounts.pending },
        { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed },
        { key: 'processing', label: 'Processing', count: statusCounts.processing },
        { key: 'shipped', label: 'Shipped', count: statusCounts.shipped },
        { key: 'delivered', label: 'Delivered', count: statusCounts.delivered },
        { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Orders" />

            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 text-white shadow-lg">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Order Management</h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {orders.total} total orders
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Tabs */}
                <div className="mb-6 flex flex-wrap gap-2">
                    {statusTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleStatusFilter(tab.key)}
                            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                filters.status === tab.key
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                            }`}
                        >
                            {tab.label}
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs ${
                                    filters.status === tab.key
                                        ? 'bg-white/20 text-white'
                                        : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                                }`}
                            >
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by order #, name, email, or phone..."
                            className="w-full rounded-lg border border-zinc-300 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 transition-colors focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                        />
                    </div>
                </form>

                {/* Orders Table */}
                {orders.data.length === 0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900/50">
                        <Package className="h-12 w-12 text-zinc-400" />
                        <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-white">No orders found</h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {filters.search ? 'Try a different search term' : 'Orders will appear here when customers place them'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                                <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                            Order
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                            Payment
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                    {orders.data.map((order) => {
                                        const statusStyle = statusColors[order.status] || statusColors.pending;
                                        const paymentStyle = paymentStatusColors[order.payment_status] || paymentStatusColors.pending;

                                        return (
                                            <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className="font-mono text-sm font-medium text-zinc-900 dark:text-white">
                                                        {order.order_number}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-zinc-900 dark:text-white">
                                                            {order.customer_name}
                                                        </p>
                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                            {order.customer_email}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">
                                                    {order.items_count} {order.items_count === 1 ? 'item' : 'items'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className="font-semibold text-zinc-900 dark:text-white">
                                                        Rs. {order.total.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                                                    >
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStyle.bg} ${paymentStyle.text}`}
                                                    >
                                                        {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                                                    {order.created_at}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/admin/orders/${order.id}`}
                                                            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(order.id)}
                                                            disabled={deleting === order.id}
                                                            className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:hover:bg-red-950/50"
                                                            title="Delete Order"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {orders.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-6 py-3 dark:border-zinc-800 dark:bg-zinc-800/50">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Showing page {orders.current_page} of {orders.last_page}
                                </p>
                                <div className="flex gap-2">
                                    {orders.links.map((link, index) => {
                                        if (link.label.includes('Previous')) {
                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`rounded-lg p-2 ${
                                                        link.url
                                                            ? 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
                                                            : 'cursor-not-allowed text-zinc-300 dark:text-zinc-600'
                                                    }`}
                                                >
                                                    <ChevronLeft className="h-5 w-5" />
                                                </Link>
                                            );
                                        }
                                        if (link.label.includes('Next')) {
                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`rounded-lg p-2 ${
                                                        link.url
                                                            ? 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700'
                                                            : 'cursor-not-allowed text-zinc-300 dark:text-zinc-600'
                                                    }`}
                                                >
                                                    <ChevronRight className="h-5 w-5" />
                                                </Link>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

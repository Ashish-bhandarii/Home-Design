import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    CreditCard,
    MapPin,
    Package,
    Printer,
    Trash2,
    Truck,
    User,
} from 'lucide-react';
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
    paid_at?: string;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    items: OrderItem[];
}

interface Props {
    order: Order;
}

const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'processing', label: 'Processing', color: 'indigo' },
    { value: 'shipped', label: 'Shipped', color: 'purple' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
];

const paymentStatusOptions = [
    { value: 'pending', label: 'Pending', color: 'orange' },
    { value: 'paid', label: 'Paid', color: 'green' },
    { value: 'failed', label: 'Failed', color: 'red' },
    { value: 'refunded', label: 'Refunded', color: 'gray' },
];

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', border: 'border-yellow-500' },
    confirmed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-400', border: 'border-blue-500' },
    processing: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-400', border: 'border-indigo-500' },
    shipped: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-400', border: 'border-purple-500' },
    delivered: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', border: 'border-green-500' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', border: 'border-red-500' },
};

export default function AdminOrderShow({ order }: Props) {
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingPayment, setUpdatingPayment] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Orders', href: '/admin/orders' },
        { title: order.order_number, href: `/admin/orders/${order.id}` },
    ];

    const handleStatusChange = (newStatus: string) => {
        setUpdatingStatus(true);
        router.patch(
            `/admin/orders/${order.id}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingStatus(false),
            }
        );
    };

    const handlePaymentStatusChange = (newStatus: string) => {
        setUpdatingPayment(true);
        router.patch(
            `/admin/orders/${order.id}/payment-status`,
            { payment_status: newStatus },
            {
                preserveScroll: true,
                onFinish: () => setUpdatingPayment(false),
            }
        );
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
        setDeleting(true);
        router.delete(`/admin/orders/${order.id}`);
    };

    const currentStatusStyle = statusColors[order.status] || statusColors.pending;

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Order ${order.order_number}`} />

            <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <Link
                            href="/admin/orders"
                            className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Orders
                        </Link>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                            {order.order_number}
                        </h1>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            Placed on {order.created_at}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                        >
                            <Printer className="h-4 w-4" />
                            Print
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Status Management */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
                                Order Status
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {/* Order Status */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Order Status
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {statusOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleStatusChange(option.value)}
                                                disabled={updatingStatus || order.status === option.value}
                                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                                    order.status === option.value
                                                        ? `${statusColors[option.value].bg} ${statusColors[option.value].text} ring-2 ring-offset-2 ${statusColors[option.value].border.replace('border', 'ring')}`
                                                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                                                } disabled:opacity-50`}
                                            >
                                                {order.status === option.value && (
                                                    <Check className="mr-1 inline h-3 w-3" />
                                                )}
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Status */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Payment Status
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {paymentStatusOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handlePaymentStatusChange(option.value)}
                                                disabled={updatingPayment || order.payment_status === option.value}
                                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                                                    order.payment_status === option.value
                                                        ? 'bg-green-100 text-green-800 ring-2 ring-green-500 ring-offset-2 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                                                } disabled:opacity-50`}
                                            >
                                                {order.payment_status === option.value && (
                                                    <Check className="mr-1 inline h-3 w-3" />
                                                )}
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                    {order.paid_at && (
                                        <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                                            Paid on {order.paid_at}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

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

                        {/* Customer & Shipping */}
                        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                            <div className="mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-blue-500" />
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    Customer & Shipping
                                </h2>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                        <User className="h-4 w-4" />
                                        Customer Details
                                    </div>
                                    <p className="mt-2 font-medium text-zinc-900 dark:text-white">
                                        {order.shipping_name}
                                    </p>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{order.shipping_email}</p>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{order.shipping_phone}</p>
                                    {order.user && (
                                        <p className="mt-2 text-xs text-zinc-500">
                                            Account: {order.user.name} ({order.user.email})
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                                        <Truck className="h-4 w-4" />
                                        Shipping Address
                                    </div>
                                    <p className="mt-2 font-medium text-zinc-900 dark:text-white">
                                        {order.shipping_address}
                                    </p>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        {order.shipping_city}
                                        {order.shipping_state && `, ${order.shipping_state}`}
                                        {order.shipping_zip && ` - ${order.shipping_zip}`}
                                    </p>
                                </div>
                            </div>
                            {order.notes && (
                                <div className="mt-4 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                                    <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Customer Notes:
                                    </p>
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
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    Order Summary
                                </h2>
                                <div className="mt-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">Subtotal</span>
                                        <span className="text-zinc-900 dark:text-white">
                                            Rs. {order.subtotal.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-600 dark:text-zinc-400">VAT (13%)</span>
                                        <span className="text-zinc-900 dark:text-white">
                                            Rs. {order.tax.toLocaleString()}
                                        </span>
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
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                                order.payment_status === 'paid'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                            }`}
                                        >
                                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Timeline</h2>
                                <div className="mt-4 space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-zinc-600 dark:text-zinc-400">Created</span>
                                        <span className="text-zinc-900 dark:text-white">{order.created_at}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-zinc-600 dark:text-zinc-400">Last Updated</span>
                                        <span className="text-zinc-900 dark:text-white">{order.updated_at}</span>
                                    </div>
                                    {order.paid_at && (
                                        <div className="flex justify-between">
                                            <span className="text-zinc-600 dark:text-zinc-400">Payment Date</span>
                                            <span className="text-green-600 dark:text-green-400">{order.paid_at}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

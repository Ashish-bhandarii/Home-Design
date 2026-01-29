import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    Clock,
    MapPin,
    MoreHorizontal,
    RefreshCw,
    Video,
    X
} from 'lucide-react';
import { useState } from 'react';

interface Designer {
    id: number;
    name: string;
    email: string;
    specialty: string | null;
    avatar: string | null;
}

interface Booking {
    id: number;
    designer: Designer;
    booking_date: string;
    booking_time: string;
    duration_minutes: number;
    consultation_type: string;
    project_type: string;
    description: string | null;
    status: string;
    total_amount: number | null;
    meeting_link: string | null;
    notes: string | null;
    created_at: string;
}

interface Props {
    bookings: {
        data: Booking[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filter: string;
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
    confirmed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
    completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

export default function MyBookingsPage({ bookings, filter }: Props) {
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Bookings', href: '/my-bookings' },
    ];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const isUpcoming = (booking: Booking) => {
        const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
        return bookingDateTime > new Date() && booking.status !== 'cancelled';
    };

    const canCancel = (booking: Booking) => {
        if (booking.status === 'cancelled' || booking.status === 'completed') return false;
        const bookingDateTime = new Date(`${booking.booking_date}T${booking.booking_time}`);
        const now = new Date();
        const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursUntilBooking >= 24;
    };

    const handleCancel = (id: number) => {
        if (confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            setCancellingId(id);
            router.post(`/my-bookings/${id}/cancel`, {}, {
                onFinish: () => {
                    setCancellingId(null);
                    setActiveDropdown(null);
                },
            });
        }
    };

    const handleFilter = (newFilter: string) => {
        router.get('/my-bookings', { filter: newFilter }, { preserveState: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Bookings" />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            My Bookings
                        </h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            Manage your designer consultation appointments
                        </p>
                    </div>
                    <Link
                        href="/designers"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40"
                    >
                        <Calendar className="h-4 w-4" />
                        Book New Consultation
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                    {['all', 'upcoming', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleFilter(tab)}
                            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
                                filter === tab
                                    ? 'bg-indigo-500 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                        >
                            {tab === 'all' ? 'All Bookings' : tab}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {bookings.total}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Total Bookings</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {bookings.data.filter(b => b.status === 'pending').length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Pending</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {bookings.data.filter(b => b.status === 'confirmed').length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Confirmed</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {bookings.data.filter(b => b.status === 'completed').length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Completed</div>
                    </div>
                </div>

                {/* Bookings List */}
                {bookings.data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                            <Calendar className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                            No bookings found
                        </h3>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            {filter === 'all'
                                ? "You haven't booked any consultations yet."
                                : `No ${filter} bookings found.`}
                        </p>
                        <Link
                            href="/designers"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2 font-medium text-white transition-all hover:bg-indigo-600"
                        >
                            Browse Designers
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.data.map((booking) => (
                            <div
                                key={booking.id}
                                className={`relative rounded-2xl border bg-white transition-all dark:bg-slate-900 ${
                                    isUpcoming(booking)
                                        ? 'border-indigo-200 shadow-md shadow-indigo-500/10 dark:border-indigo-900'
                                        : 'border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                {/* Upcoming Badge */}
                                {isUpcoming(booking) && booking.status === 'confirmed' && (
                                    <div className="absolute -top-3 left-6">
                                        <span className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30">
                                            Upcoming
                                        </span>
                                    </div>
                                )}

                                <div className="p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                        {/* Designer Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
                                                {booking.designer.avatar ? (
                                                    <img
                                                        src={booking.designer.avatar}
                                                        alt={booking.designer.name}
                                                        className="h-full w-full rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    booking.designer.name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white">
                                                    {booking.designer.name}
                                                </h3>
                                                {booking.designer.specialty && (
                                                    <p className="text-sm text-indigo-600 dark:text-indigo-400">
                                                        {booking.designer.specialty}
                                                    </p>
                                                )}
                                                <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="flex items-center gap-1.5">
                                                        <Calendar className="h-4 w-4" />
                                                        {formatDate(booking.booking_date)}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4" />
                                                        {formatTime(booking.booking_time)} ({booking.duration_minutes} min)
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        {booking.consultation_type === 'online' ? (
                                                            <Video className="h-4 w-4" />
                                                        ) : (
                                                            <MapPin className="h-4 w-4" />
                                                        )}
                                                        <span className="capitalize">{booking.consultation_type}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status & Actions */}
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                                                statusColors[booking.status]?.bg || 'bg-slate-100'
                                            } ${statusColors[booking.status]?.text || 'text-slate-600'}`}>
                                                <span className={`h-1.5 w-1.5 rounded-full ${statusColors[booking.status]?.dot || 'bg-slate-500'}`} />
                                                <span className="capitalize">{booking.status}</span>
                                            </span>

                                            {/* Dropdown Menu */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveDropdown(activeDropdown === booking.id ? null : booking.id)}
                                                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                                >
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>
                                                {activeDropdown === booking.id && (
                                                    <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                                        {booking.meeting_link && booking.status === 'confirmed' && (
                                                            <a
                                                                href={booking.meeting_link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                                            >
                                                                <Video className="h-4 w-4" />
                                                                Join Meeting
                                                            </a>
                                                        )}
                                                        <Link
                                                            href={`/designers/${booking.designer.id}`}
                                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                            Book Again
                                                        </Link>
                                                        {canCancel(booking) && (
                                                            <button
                                                                onClick={() => handleCancel(booking.id)}
                                                                disabled={cancellingId === booking.id}
                                                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                            >
                                                                <X className="h-4 w-4" />
                                                                {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Project Details */}
                                    <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            {booking.project_type}
                                        </div>
                                        {booking.description && (
                                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                                {booking.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Notes from Designer */}
                                    {booking.notes && (
                                        <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
                                            <div className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                                                Note from Designer
                                            </div>
                                            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                                                {booking.notes}
                                            </p>
                                        </div>
                                    )}

                                    {/* Amount */}
                                    {booking.total_amount && (
                                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                                Consultation Fee
                                            </span>
                                            <span className="font-semibold text-slate-900 dark:text-white">
                                                Rs. {booking.total_amount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {bookings.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: bookings.last_page }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => router.get('/my-bookings', { page, filter }, { preserveState: true })}
                                className={`h-10 w-10 rounded-lg font-medium transition-all ${
                                    page === bookings.current_page
                                        ? 'bg-indigo-500 text-white'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

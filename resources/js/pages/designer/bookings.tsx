import DesignerLayout from '@/layouts/designer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    Mail,
    MapPin,
    MessageSquare,
    MoreHorizontal,
    Video,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Booking {
    id: number;
    user: User;
    booking_date: string;
    booking_time: string;
    duration_minutes: number;
    consultation_type: string;
    project_type: string | null;
    description: string | null;
    status: string;
    price: number | null;
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

export default function DesignerBookingsPage({ bookings, filter }: Props) {
    const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<Booking | null>(null);
    const [meetingLink, setMeetingLink] = useState('');
    const [notes, setNotes] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/designer' },
        { title: 'Bookings', href: '/designer/bookings' },
    ];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
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

    const handleFilter = (newFilter: string) => {
        router.get('/designer/bookings', { filter: newFilter }, { preserveState: true });
    };

    const handleConfirm = (booking: Booking) => {
        setConfirmModal(booking);
        setMeetingLink(booking.meeting_link || '');
        setNotes(booking.notes || '');
    };

    const submitConfirm = () => {
        if (confirmModal && !isConfirming) {
            setIsConfirming(true);
            router.post(`/designer/bookings/${confirmModal.id}/confirm`, {
                meeting_link: meetingLink,
                notes,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmModal(null);
                    setActiveDropdown(null);
                    setMeetingLink('');
                    setNotes('');
                    setIsConfirming(false);
                },
                onError: () => {
                    setIsConfirming(false);
                },
                onFinish: () => {
                    setIsConfirming(false);
                },
            });
        }
    };

    const handleComplete = (id: number) => {
        if (confirm('Mark this booking as completed?')) {
            router.post(`/designer/bookings/${id}/complete`, {}, {
                preserveScroll: true,
            });
            setActiveDropdown(null);
        }
    };

    const handleCancel = (id: number) => {
        if (confirm('Are you sure you want to cancel this booking?')) {
            router.post(`/designer/bookings/${id}/cancel`, {}, {
                preserveScroll: true,
            });
            setActiveDropdown(null);
        }
    };

    return (
        <DesignerLayout breadcrumbs={breadcrumbs}>
            <Head title="My Bookings" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        My Bookings
                    </h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">
                        Manage your consultation appointments
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                    {['all', 'today', 'upcoming', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleFilter(tab)}
                            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
                                filter === tab
                                    ? 'bg-purple-500 text-white'
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
                        <div className="text-sm text-slate-600 dark:text-slate-400">Total</div>
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
                                ? "You don't have any bookings yet."
                                : `No ${filter} bookings found.`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bookings.data.map((booking) => (
                            <div
                                key={booking.id}
                                className="rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    {/* Client Info */}
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-lg font-bold text-white">
                                            {booking.user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                {booking.user.name}
                                            </h3>
                                            <p className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                                                <Mail className="h-3.5 w-3.5" />
                                                {booking.user.email}
                                            </p>
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
                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                                                statusColors[booking.status]?.bg || 'bg-slate-100'
                                            } ${statusColors[booking.status]?.text || 'text-slate-600'}`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    statusColors[booking.status]?.dot || 'bg-slate-500'
                                                }`}
                                            />
                                            <span className="capitalize">{booking.status}</span>
                                        </span>

                                        {/* Actions Dropdown */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setActiveDropdown(activeDropdown === booking.id ? null : booking.id)}
                                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                            >
                                                <MoreHorizontal className="h-5 w-5" />
                                            </button>
                                            {activeDropdown === booking.id && (
                                                <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                                    {booking.status === 'pending' && (
                                                        <button
                                                            onClick={() => handleConfirm(booking)}
                                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                            Confirm Booking
                                                        </button>
                                                    )}
                                                    {booking.status === 'confirmed' && (
                                                        <button
                                                            onClick={() => handleComplete(booking.id)}
                                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                            Mark Completed
                                                        </button>
                                                    )}
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
                                                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                                                        <button
                                                            onClick={() => handleCancel(booking.id)}
                                                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                        >
                                                            <X className="h-4 w-4" />
                                                            Cancel Booking
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
                                        {booking.project_type || 'General Consultation'}
                                    </div>
                                    {booking.description && (
                                        <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                            {booking.description}
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                {booking.notes && (
                                    <div className="mt-4 flex items-start gap-2 text-sm">
                                        <MessageSquare className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                                        <p className="text-slate-600 dark:text-slate-400">{booking.notes}</p>
                                    </div>
                                )}

                                {/* Price */}
                                {booking.price && (
                                    <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-4 dark:border-slate-800">
                                        <span className="font-semibold text-slate-900 dark:text-white">
                                            Rs. {booking.price}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {bookings.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => router.get('/designer/bookings', { page: bookings.current_page - 1, filter }, { preserveState: true })}
                            disabled={bookings.current_page === 1}
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </button>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            Page {bookings.current_page} of {bookings.last_page}
                        </span>
                        <button
                            onClick={() => router.get('/designer/bookings', { page: bookings.current_page + 1, filter }, { preserveState: true })}
                            disabled={bookings.current_page === bookings.last_page}
                            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Confirm Booking Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Confirm Booking
                            </h2>
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                <div className="font-medium text-slate-900 dark:text-white">
                                    {confirmModal.user.name}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    {formatDate(confirmModal.booking_date)} at {formatTime(confirmModal.booking_time)}
                                </div>
                            </div>

                            {confirmModal.consultation_type === 'online' && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Meeting Link (optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                        placeholder="https://zoom.us/j/..."
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Notes for Client (optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Add any notes for the client..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setConfirmModal(null)}
                                    disabled={isConfirming}
                                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitConfirm}
                                    disabled={isConfirming}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-3 font-medium text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isConfirming ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Confirming...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="h-5 w-5" />
                                            Confirm Booking
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DesignerLayout>
    );
}

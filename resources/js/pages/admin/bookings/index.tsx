import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Calendar,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    MapPin,
    Search,
    Trash2,
    Video,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Designer {
    id: number;
    name: string;
    email: string;
    specialty: string | null;
}

interface Booking {
    id: number;
    user: User;
    designer: Designer;
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
    filters: {
        status: string;
        search: string;
    };
}

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
    pending: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
    confirmed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', dot: 'bg-green-500' },
    completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
    cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

export default function BookingsIndexPage({ bookings, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [newStatus, setNewStatus] = useState('');
    const [notes, setNotes] = useState('');
    const [meetingLink, setMeetingLink] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Bookings', href: '/admin/bookings' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/bookings', { search, status: filters.status }, { preserveState: true });
    };

    const handleStatusFilter = (status: string) => {
        router.get('/admin/bookings', { status, search: filters.search }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this booking?')) {
            router.delete(`/admin/bookings/${id}`);
        }
    };

    const handleUpdateStatus = (booking: Booking) => {
        setEditingBooking(booking);
        setNewStatus(booking.status);
        setNotes(booking.notes || '');
        setMeetingLink(booking.meeting_link || '');
    };

    const submitStatusUpdate = () => {
        if (editingBooking) {
            router.patch(`/admin/bookings/${editingBooking.id}/status`, {
                status: newStatus,
                notes,
                meeting_link: meetingLink,
            }, {
                onSuccess: () => setEditingBooking(null),
            });
        }
    };

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

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Bookings" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Designer Bookings
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                        Manage consultation bookings between users and designers
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by user or designer name..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>
                        <button
                            type="submit"
                            className="rounded-xl bg-slate-100 px-6 font-medium text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                    {['', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusFilter(status)}
                            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium capitalize transition-all ${
                                filters.status === status
                                    ? 'bg-indigo-500 text-white'
                                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                            }`}
                        >
                            {status || 'All'}
                        </button>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
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
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {bookings.data.filter(b => b.status === 'cancelled').length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Cancelled</div>
                    </div>
                </div>

                {/* Bookings Table */}
                <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    {bookings.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                                <Calendar className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                                No bookings found
                            </h3>
                            <p className="mt-1 text-slate-600 dark:text-slate-400">
                                {filters.search || filters.status
                                    ? 'Try adjusting your filters.'
                                    : 'Bookings will appear here when users book consultations.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-slate-200 dark:border-slate-700">
                                    <tr className="text-left">
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Booking</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Client</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Designer</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Type</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {bookings.data.map((booking) => (
                                        <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
                                                        <Calendar className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-white">
                                                            {formatDate(booking.booking_date)}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            {formatTime(booking.booking_time)} ({booking.duration_minutes} min)
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900 dark:text-white">
                                                    {booking.user.name}
                                                </div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                                    {booking.user.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900 dark:text-white">
                                                    {booking.designer.name}
                                                </div>
                                                <div className="text-sm text-slate-500 dark:text-slate-400">
                                                    {booking.designer.specialty || booking.designer.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                    {booking.consultation_type === 'online' ? (
                                                        <Video className="h-4 w-4" />
                                                    ) : (
                                                        <MapPin className="h-4 w-4" />
                                                    )}
                                                    <span className="capitalize">{booking.consultation_type}</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleUpdateStatus(booking)}
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all hover:opacity-80 ${
                                                        statusColors[booking.status]?.bg || 'bg-slate-100'
                                                    } ${statusColors[booking.status]?.text || 'text-slate-600'}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${statusColors[booking.status]?.dot || 'bg-slate-500'}`} />
                                                    <span className="capitalize">{booking.status}</span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(booking)}
                                                        className="rounded-lg p-2 text-indigo-600 transition-all hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                                                        title="Edit Status"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(booking.id)}
                                                        className="rounded-lg p-2 text-red-600 transition-all hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {bookings.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Page {bookings.current_page} of {bookings.last_page}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.get('/admin/bookings', { page: bookings.current_page - 1, ...filters }, { preserveState: true })}
                                    disabled={bookings.current_page === 1}
                                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </button>
                                <button
                                    onClick={() => router.get('/admin/bookings', { page: bookings.current_page + 1, ...filters }, { preserveState: true })}
                                    disabled={bookings.current_page === bookings.last_page}
                                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Status Modal */}
            {editingBooking && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Update Booking
                            </h2>
                            <button
                                onClick={() => setEditingBooking(null)}
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    {formatDate(editingBooking.booking_date)} at {formatTime(editingBooking.booking_time)}
                                </div>
                                <div className="mt-1 font-medium text-slate-900 dark:text-white">
                                    {editingBooking.user.name} → {editingBooking.designer.name}
                                </div>
                                {editingBooking.project_type && (
                                    <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                        {editingBooking.project_type}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Status
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            {newStatus === 'confirmed' && editingBooking.consultation_type === 'online' && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Meeting Link
                                    </label>
                                    <input
                                        type="url"
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                        placeholder="https://zoom.us/j/..."
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Notes (visible to client)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                    placeholder="Add any notes for the client..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setEditingBooking(null)}
                                    className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitStatusUpdate}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40"
                                >
                                    <Check className="h-5 w-5" />
                                    Update
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

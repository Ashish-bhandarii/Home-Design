import DesignerLayout from '@/layouts/designer-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Calendar,
    CheckCircle,
    Clock,
    Mail,
    MapPin,
    TrendingUp,
    Video
} from 'lucide-react';

interface UserInfo {
    id: number;
    name: string;
    email: string;
}

interface Booking {
    id: number;
    user: UserInfo;
    booking_date: string;
    booking_time: string;
    duration_minutes: number;
    consultation_type: string;
    project_type: string | null;
    description: string | null;
    status: string;
    price: number | null;
    meeting_link: string | null;
}

interface Designer {
    id: number;
    name: string;
    email: string;
    specialty: string | null;
    bio: string | null;
    hourly_rate: number | null;
    experience_years: number | null;
    portfolio_url: string | null;
    avatar: string | null;
    is_available: boolean;
}

interface Stats {
    total_bookings: number;
    pending_bookings: number;
    confirmed_bookings: number;
    completed_bookings: number;
    this_month_earnings: number;
    total_earnings: number;
}

interface Props {
    designer: Designer;
    todayBookings: Booking[];
    upcomingBookings: Booking[];
    stats: Stats;
}

export default function DesignerDashboard({
    designer,
    todayBookings,
    upcomingBookings,
    stats,
}: Props) {
    const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const toggleAvailability = () => {
        router.post('/designer/profile/toggle-availability');
    };

    return (
        <DesignerLayout>
            <Head title="Designer Dashboard" />

            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Welcome back, {designer.name}!
                        </h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            {designer.specialty || 'Professional Designer'}
                        </p>
                    </div>
                    <button
                        onClick={toggleAvailability}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all ${
                            designer.is_available
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                    >
                        <span className={`h-2 w-2 rounded-full ${designer.is_available ? 'bg-green-500' : 'bg-slate-400'}`} />
                        {designer.is_available ? 'Available for Bookings' : 'Not Available'}
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                                <Calendar className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.total_bookings}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    Total Bookings
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.pending_bookings}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    Pending
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.completed_bookings}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    Completed
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    Rs. {stats.this_month_earnings || 0}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    This Month
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Today's Schedule */}
                    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="border-b border-slate-200 p-6 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Today's Schedule
                            </h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        <div className="p-6">
                            {todayBookings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                                        <Calendar className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <p className="mt-3 text-slate-600 dark:text-slate-400">
                                        No bookings scheduled for today
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {todayBookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-start gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50"
                                        >
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-sm font-bold text-white">
                                                {booking.user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-medium text-slate-900 dark:text-white">
                                                    {booking.user.name}
                                                </div>
                                                <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        {formatTime(booking.booking_time)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        {booking.consultation_type === 'online' ? (
                                                            <Video className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <MapPin className="h-3.5 w-3.5" />
                                                        )}
                                                        {booking.consultation_type}
                                                    </span>
                                                </div>
                                                {booking.project_type && (
                                                    <div className="mt-1 text-sm text-slate-500 dark:text-slate-500">
                                                        {booking.project_type}
                                                    </div>
                                                )}
                                                {/* Online meeting notification */}
                                                {booking.consultation_type === 'online' && (
                                                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                                                        <Mail className="h-3.5 w-3.5" />
                                                        <span>Send meeting link to client's email</span>
                                                    </div>
                                                )}
                                            </div>
                                            <Link
                                                href={`/designer/bookings/${booking.id}`}
                                                className="rounded-lg bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-600 transition-all hover:bg-purple-200 dark:bg-purple-950/50 dark:text-purple-400"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Bookings */}
                    <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-800">
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Upcoming Bookings
                            </h2>
                            <Link
                                href="/designer/bookings"
                                className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="p-6">
                            {upcomingBookings.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                                        <Calendar className="h-6 w-6 text-slate-400" />
                                    </div>
                                    <p className="mt-3 text-slate-600 dark:text-slate-400">
                                        No upcoming bookings
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingBookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-sm font-bold text-white">
                                                    {booking.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white">
                                                        {booking.user.name}
                                                    </div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                                        {formatDate(booking.booking_date)} at {formatTime(booking.booking_time)}
                                                    </div>
                                                </div>
                                            </div>
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    booking.status === 'confirmed'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                }`}
                                            >
                                                {booking.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-500 to-indigo-600 p-6 text-white dark:border-slate-800">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Total Earnings</h3>
                            <p className="mt-1 text-3xl font-bold">Rs. {stats.total_earnings || 0}</p>
                            <p className="mt-1 text-purple-200">
                                From {stats.completed_bookings} completed consultations
                            </p>
                        </div>
                        <div className="flex gap-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{stats.confirmed_bookings}</div>
                                <div className="text-sm text-purple-200">Confirmed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{stats.pending_bookings}</div>
                                <div className="text-sm text-purple-200">Pending</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DesignerLayout>
    );
}

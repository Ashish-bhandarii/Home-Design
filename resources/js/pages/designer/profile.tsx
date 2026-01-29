import DesignerLayout from '@/layouts/designer-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    Camera,
    Check,
    Clock,
    DollarSign,
    ExternalLink,
    Globe,
    Info,
    Loader2,
    Save,
    Star
} from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Designer {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    specialty?: string;
    bio?: string;
    hourly_rate?: number;
    experience_years?: number;
    portfolio_url?: string;
    is_available?: boolean;
    work_start_time?: string;
    work_end_time?: string;
    slot_duration?: number;
    working_days?: number[];
    rating?: number;
    total_reviews?: number;
}

interface Props {
    designer: Designer;
    stats: {
        total_bookings: number;
        completed_bookings: number;
        total_earnings: number;
    };
}

export default function DesignerProfilePage({ designer, stats }: Props) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isSavingAvailability, setIsSavingAvailability] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [formData, setFormData] = useState({
        name: designer.name || '',
        specialty: designer.specialty || '',
        bio: designer.bio || '',
        hourly_rate: designer.hourly_rate || 0,
        experience_years: designer.experience_years || 0,
        portfolio_url: designer.portfolio_url || '',
    });

    const [availabilityData, setAvailabilityData] = useState({
        work_start_time: designer.work_start_time?.slice(0, 5) || '09:00',
        work_end_time: designer.work_end_time?.slice(0, 5) || '18:00',
        slot_duration: designer.slot_duration || 60,
        working_days: designer.working_days || [1, 2, 3, 4, 5],
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const slotDurationOptions = [
        { value: 30, label: '30 minutes' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hours' },
        { value: 120, label: '2 hours' },
    ];

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/designer' },
        { title: 'Profile', href: '/designer/profile' },
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'hourly_rate' || name === 'experience_years' ? Number(value) : value,
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        router.post('/designer/profile', formData, {
            onSuccess: () => {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setIsSubmitting(false);
            },
            onError: () => {
                setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
                setIsSubmitting(false);
            },
        });
    };

    const toggleAvailability = () => {
        router.post('/designer/profile/availability', {}, {
            onSuccess: () => {
                setMessage({
                    type: 'success',
                    text: designer.is_available ? 'You are now unavailable for bookings.' : 'You are now available for bookings!',
                });
            },
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setIsUploading(true);
        router.post('/designer/profile/avatar', formData, {
            forceFormData: true,
            onSuccess: () => {
                setMessage({ type: 'success', text: 'Avatar updated successfully!' });
                setIsUploading(false);
            },
            onError: () => {
                setMessage({ type: 'error', text: 'Failed to upload avatar.' });
                setIsUploading(false);
            },
        });
    };

    const toggleWorkingDay = (day: number) => {
        setAvailabilityData((prev) => ({
            ...prev,
            working_days: prev.working_days.includes(day)
                ? prev.working_days.filter((d) => d !== day)
                : [...prev.working_days, day].sort(),
        }));
    };

    const handleSaveAvailability = () => {
        setIsSavingAvailability(true);
        setMessage(null);

        router.post('/designer/profile/availability-settings', availabilityData, {
            onSuccess: () => {
                setMessage({ type: 'success', text: 'Availability settings updated successfully!' });
                setIsSavingAvailability(false);
            },
            onError: () => {
                setMessage({ type: 'error', text: 'Failed to update availability settings.' });
                setIsSavingAvailability(false);
            },
        });
    };

    return (
        <DesignerLayout breadcrumbs={breadcrumbs}>
            <Head title="My Profile" />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">
                        Manage your profile information and settings
                    </p>
                </div>

                {/* Message */}
                {message && (
                    <div
                        className={`flex items-center gap-3 rounded-xl p-4 ${
                            message.type === 'success'
                                ? 'border border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'border border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                    >
                        {message.type === 'success' ? (
                            <Check className="h-5 w-5" />
                        ) : (
                            <Info className="h-5 w-5" />
                        )}
                        {message.text}
                    </div>
                )}

                {/* Profile Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                        {/* Avatar */}
                        <div className="relative">
                            {designer.avatar ? (
                                <img
                                    src={designer.avatar}
                                    alt={designer.name}
                                    className="h-32 w-32 rounded-2xl object-cover"
                                />
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-4xl font-bold text-white">
                                    {designer.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <label className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg transition-all hover:bg-purple-600">
                                {isUploading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <Camera className="h-5 w-5" />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </label>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                {designer.name}
                            </h2>
                            <p className="text-purple-600 dark:text-purple-400">
                                {designer.specialty || 'Interior Designer'}
                            </p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {designer.email}
                            </p>

                            {/* Rating */}
                            {designer.rating && (
                                <div className="mt-3 flex items-center justify-center gap-1 sm:justify-start">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold text-slate-900 dark:text-white">
                                        {designer.rating.toFixed(1)}
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400">
                                        ({designer.total_reviews || 0} reviews)
                                    </span>
                                </div>
                            )}

                            {/* Availability Toggle */}
                            <div className="mt-4">
                                <button
                                    onClick={toggleAvailability}
                                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                                        designer.is_available
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    <span
                                        className={`h-2 w-2 rounded-full ${
                                            designer.is_available ? 'bg-green-500' : 'bg-slate-400'
                                        }`}
                                    />
                                    {designer.is_available ? 'Available for Bookings' : 'Unavailable'}
                                </button>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 sm:grid-cols-1">
                            <div className="text-center sm:text-right">
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {stats.total_bookings}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Total Bookings
                                </div>
                            </div>
                            <div className="text-center sm:text-right">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {stats.completed_bookings}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Completed
                                </div>
                            </div>
                            <div className="text-center sm:text-right">
                                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    Rs. {stats.total_earnings}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                    Earnings
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <form onSubmit={handleSubmit}>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Profile Information
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Update your profile to attract more clients
                        </p>

                        <div className="mt-6 grid gap-6 sm:grid-cols-2">
                            {/* Name */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            {/* Specialty */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Specialty
                                </label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        name="specialty"
                                        value={formData.specialty}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Modern Interior Design"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Hourly Rate */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Hourly Rate (Rs.)
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="number"
                                        name="hourly_rate"
                                        value={formData.hourly_rate}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Experience Years */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Years of Experience
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="number"
                                        name="experience_years"
                                        value={formData.experience_years}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Portfolio URL */}
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Portfolio URL
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="url"
                                        name="portfolio_url"
                                        value={formData.portfolio_url}
                                        onChange={handleInputChange}
                                        placeholder="https://yourportfolio.com"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                    {formData.portfolio_url && (
                                        <a
                                            href={formData.portfolio_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500 hover:text-purple-600"
                                        >
                                            <ExternalLink className="h-5 w-5" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    placeholder="Tell clients about yourself, your experience, and design philosophy..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Availability Settings */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
                            <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Availability Settings
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Set your working hours and days for client bookings
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Working Hours */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Start Time
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="time"
                                        value={availabilityData.work_start_time}
                                        onChange={(e) => setAvailabilityData(prev => ({ ...prev, work_start_time: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    End Time
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="time"
                                        value={availabilityData.work_end_time}
                                        onChange={(e) => setAvailabilityData(prev => ({ ...prev, work_end_time: e.target.value }))}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-slate-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Slot Duration */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Consultation Duration
                            </label>
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {slotDurationOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setAvailabilityData(prev => ({ ...prev, slot_duration: option.value }))}
                                        className={`rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all ${
                                            availabilityData.slot_duration === option.value
                                                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Working Days */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Working Days
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {dayNames.map((day, index) => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleWorkingDay(index)}
                                        className={`rounded-xl border-2 px-4 py-2.5 text-sm font-medium transition-all ${
                                            availabilityData.working_days.includes(index)
                                                ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                Select the days you're available for consultations
                            </p>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={handleSaveAvailability}
                                disabled={isSavingAvailability || availabilityData.working_days.length === 0}
                                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 font-medium text-white shadow-lg shadow-green-500/30 transition-all hover:shadow-xl hover:shadow-green-500/40 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSavingAvailability ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Save Availability
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tips Card */}
                <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 dark:border-purple-800/50 dark:from-purple-900/20 dark:to-indigo-900/20">
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-purple-900 dark:text-purple-300">
                        <Info className="h-5 w-5" />
                        Profile Tips
                    </h3>
                    <ul className="mt-3 space-y-2 text-sm text-purple-800 dark:text-purple-400">
                        <li className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                            Add a professional photo to increase your bookings by up to 40%
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                            Write a detailed bio highlighting your unique design approach
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                            Link your portfolio to showcase your best work
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-500" />
                            Respond to bookings quickly to maintain a high rating
                        </li>
                    </ul>
                </div>
            </div>
        </DesignerLayout>
    );
}

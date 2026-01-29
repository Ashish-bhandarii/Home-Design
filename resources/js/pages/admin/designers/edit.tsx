import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Camera, Clock, Loader2, Save } from 'lucide-react';
import { useState } from 'react';

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
    work_start_time: string | null;
    work_end_time: string | null;
    slot_duration: number | null;
    working_days: number[] | null;
}

interface Props {
    designer: Designer;
}

export default function EditDesignerPage({ designer }: Props) {
    const [isUploading, setIsUploading] = useState(false);
    const [currentAvatar, setCurrentAvatar] = useState(designer.avatar);
    const [isSavingAvailability, setIsSavingAvailability] = useState(false);
    const [availabilityData, setAvailabilityData] = useState({
        work_start_time: designer.work_start_time || '09:00',
        work_end_time: designer.work_end_time || '18:00',
        slot_duration: designer.slot_duration || 60,
        working_days: designer.working_days || [1, 2, 3, 4, 5],
    });

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const slotDurationOptions = [
        { value: 30, label: '30 min' },
        { value: 60, label: '1 hour' },
        { value: 90, label: '1.5 hours' },
        { value: 120, label: '2 hours' },
    ];

    const toggleWorkingDay = (day: number) => {
        setAvailabilityData(prev => ({
            ...prev,
            working_days: prev.working_days.includes(day)
                ? prev.working_days.filter(d => d !== day)
                : [...prev.working_days, day].sort()
        }));
    };

    const handleSaveAvailability = () => {
        setIsSavingAvailability(true);
        router.post(`/admin/designers/${designer.id}/availability`, availabilityData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsSavingAvailability(false);
            },
            onError: () => {
                setIsSavingAvailability(false);
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Designers', href: '/admin/designers' },
        { title: 'Edit Designer', href: `/admin/designers/${designer.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: designer.name || '',
        email: designer.email || '',
        specialty: designer.specialty || '',
        bio: designer.bio || '',
        hourly_rate: designer.hourly_rate?.toString() || '',
        experience_years: designer.experience_years?.toString() || '',
        portfolio_url: designer.portfolio_url || '',
        is_available: designer.is_available ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/designers/${designer.id}`);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setIsUploading(true);
        router.post(`/admin/designers/${designer.id}/avatar`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page: { props: Record<string, unknown> }) => {
                setIsUploading(false);
                // Update the current avatar from the response
                const updatedDesigner = page.props.designer as Designer | undefined;
                if (updatedDesigner?.avatar) {
                    setCurrentAvatar(updatedDesigner.avatar);
                }
            },
            onError: () => {
                setIsUploading(false);
            },
        });
    };

    const specialtyOptions = [
        'Interior Design',
        'Architecture & Floor Planning',
        'Space Optimization',
        'Landscape & Garden Design',
        'Color & Material Consultation',
        'Kitchen & Bathroom Design',
        'Lighting Design',
        'Sustainable Design',
        'Furniture Design',
        'Other',
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${designer.name}`} />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/designers"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            {currentAvatar ? (
                                <img
                                    src={currentAvatar}
                                    alt={designer.name}
                                    className="h-12 w-12 rounded-xl object-cover"
                                />
                            ) : (
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-lg font-bold text-white">
                                    {designer.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <label className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-indigo-500 text-white shadow-lg transition-all hover:bg-indigo-600">
                                {isUploading ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Camera className="h-3 w-3" />
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
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Edit Designer
                            </h1>
                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                                Update {designer.name}'s profile
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                            Basic Information
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter designer's full name"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Email *
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="designer@example.com"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
                            Professional Details
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Specialty *
                                </label>
                                <select
                                    value={data.specialty}
                                    onChange={(e) => setData('specialty', e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="">Select specialty</option>
                                    {specialtyOptions.map((specialty) => (
                                        <option key={specialty} value={specialty}>
                                            {specialty}
                                        </option>
                                    ))}
                                </select>
                                {errors.specialty && (
                                    <p className="mt-1 text-sm text-red-600">{errors.specialty}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Hourly Rate (Rs.)
                                </label>
                                <input
                                    type="number"
                                    value={data.hourly_rate}
                                    onChange={(e) => setData('hourly_rate', e.target.value)}
                                    placeholder="2000"
                                    min="0"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                                {errors.hourly_rate && (
                                    <p className="mt-1 text-sm text-red-600">{errors.hourly_rate}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Years of Experience
                                </label>
                                <input
                                    type="number"
                                    value={data.experience_years}
                                    onChange={(e) => setData('experience_years', e.target.value)}
                                    placeholder="5"
                                    min="0"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                                {errors.experience_years && (
                                    <p className="mt-1 text-sm text-red-600">{errors.experience_years}</p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Portfolio URL
                                </label>
                                <input
                                    type="url"
                                    value={data.portfolio_url}
                                    onChange={(e) => setData('portfolio_url', e.target.value)}
                                    placeholder="https://portfolio.example.com"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                                {errors.portfolio_url && (
                                    <p className="mt-1 text-sm text-red-600">{errors.portfolio_url}</p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Bio
                                </label>
                                <textarea
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    rows={4}
                                    placeholder="Write a brief professional bio..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                                {errors.bio && (
                                    <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
                                )}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={data.is_available}
                                        onChange={(e) => setData('is_available', e.target.checked)}
                                        className="h-5 w-5 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Available for bookings
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Availability Settings */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-indigo-500" />
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Availability Settings
                            </h2>
                        </div>
                        <div className="space-y-6">
                            {/* Working Hours */}
                            <div>
                                <label className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <Clock className="mr-2 inline h-4 w-4" />
                                    Working Hours
                                </label>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs text-slate-500">Start Time</label>
                                        <input
                                            type="time"
                                            value={availabilityData.work_start_time}
                                            onChange={(e) => setAvailabilityData(prev => ({ ...prev, work_start_time: e.target.value }))}
                                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                    <span className="pt-5 text-slate-400">to</span>
                                    <div>
                                        <label className="mb-1 block text-xs text-slate-500">End Time</label>
                                        <input
                                            type="time"
                                            value={availabilityData.work_end_time}
                                            onChange={(e) => setAvailabilityData(prev => ({ ...prev, work_end_time: e.target.value }))}
                                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Slot Duration */}
                            <div>
                                <label className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Consultation Slot Duration
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {slotDurationOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setAvailabilityData(prev => ({ ...prev, slot_duration: option.value }))}
                                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                                availabilityData.slot_duration === option.value
                                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Working Days */}
                            <div>
                                <label className="mb-3 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Working Days
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {dayNames.map((day, index) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleWorkingDay(index)}
                                            className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all ${
                                                availabilityData.working_days.includes(index)
                                                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Save Availability Button */}
                            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={handleSaveAvailability}
                                    disabled={isSavingAvailability}
                                    className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 font-medium text-white transition-all hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSavingAvailability ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4" />
                                            Save Availability Settings
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-3">
                        <Link
                            href="/admin/designers"
                            className="flex-1 rounded-xl border border-slate-200 px-6 py-3 text-center font-medium text-slate-700 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save className="h-5 w-5" />
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

export default function CreateDesignerPage() {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Designers', href: '/admin/designers' },
        { title: 'Add Designer', href: '/admin/designers/create' },
    ];

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        specialty: '',
        bio: '',
        hourly_rate: '',
        experience_years: '',
        portfolio_url: '',
        is_available: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/designers');
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
            <Head title="Add Designer" />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/designers"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-all hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Add New Designer
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Create a new designer account for consultation bookings
                        </p>
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
                            <div>
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
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Password *
                                </label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Minimum 8 characters"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
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
                            {processing ? 'Creating...' : 'Create Designer'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

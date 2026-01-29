import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    ExternalLink,
    Plus,
    Search,
    Trash2,
    User
} from 'lucide-react';
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
    created_at: string;
}

interface Props {
    designers: {
        data: Designer[];
        current_page: number;
        last_page: number;
        total: number;
    };
    filters: {
        search: string;
    };
}

export default function DesignersIndexPage({ designers, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Admin', href: '/admin' },
        { title: 'Designers', href: '/admin/designers' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/designers', { search }, { preserveState: true });
    };

    const handleDelete = (id: number, name: string) => {
        if (confirm(`Are you sure you want to delete designer "${name}"?`)) {
            router.delete(`/admin/designers/${id}`);
        }
    };

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Manage Designers" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Designers
                        </h1>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            Manage professional designers available for consultation bookings
                        </p>
                    </div>
                    <Link
                        href="/admin/designers/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40"
                    >
                        <Plus className="h-4 w-4" />
                        Add Designer
                    </Link>
                </div>

                {/* Search */}
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, email, or specialty..."
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

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {designers.total}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Total Designers</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {designers.data.filter(d => d.is_available).length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Available</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="text-2xl font-bold text-slate-600 dark:text-slate-400">
                            {designers.data.filter(d => !d.is_available).length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Unavailable</div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                            {designers.data.length > 0 
                                ? Math.round(designers.data.reduce((sum, d) => sum + (d.experience_years || 0), 0) / designers.data.length)
                                : 0}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Avg. Experience (yrs)</div>
                    </div>
                </div>

                {/* Designers Table */}
                <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    {designers.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
                                <User className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                                No designers found
                            </h3>
                            <p className="mt-1 text-slate-600 dark:text-slate-400">
                                {filters.search
                                    ? 'Try adjusting your search query.'
                                    : 'Get started by adding your first designer.'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-slate-200 dark:border-slate-700">
                                    <tr className="text-left">
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Designer</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Specialty</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Experience</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Rate</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">Status</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {designers.data.map((designer) => (
                                        <tr key={designer.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {designer.avatar ? (
                                                        <img
                                                            src={designer.avatar}
                                                            alt={designer.name}
                                                            className="h-10 w-10 flex-shrink-0 rounded-xl object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                                                            {designer.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-slate-900 dark:text-white">
                                                            {designer.name}
                                                        </div>
                                                        <div className="text-sm text-slate-500 dark:text-slate-400">
                                                            {designer.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-700 dark:text-slate-300">
                                                    {designer.specialty || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-700 dark:text-slate-300">
                                                    {designer.experience_years ? `${designer.experience_years} years` : '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-slate-700 dark:text-slate-300">
                                                    {designer.hourly_rate ? `Rs. ${designer.hourly_rate}/hr` : '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    designer.is_available
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${
                                                        designer.is_available ? 'bg-green-500' : 'bg-slate-400'
                                                    }`} />
                                                    {designer.is_available ? 'Available' : 'Unavailable'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {designer.portfolio_url && (
                                                        <a
                                                            href={designer.portfolio_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                                                            title="View Portfolio"
                                                        >
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                    <Link
                                                        href={`/admin/designers/${designer.id}/edit`}
                                                        className="rounded-lg p-2 text-indigo-600 transition-all hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(designer.id, designer.name)}
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
                    {designers.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-700">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Page {designers.current_page} of {designers.last_page}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => router.get('/admin/designers', { page: designers.current_page - 1, ...filters }, { preserveState: true })}
                                    disabled={designers.current_page === 1}
                                    className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </button>
                                <button
                                    onClick={() => router.get('/admin/designers', { page: designers.current_page + 1, ...filters }, { preserveState: true })}
                                    disabled={designers.current_page === designers.last_page}
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
        </AdminLayout>
    );
}

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Briefcase, Clock, Filter, Search, Users } from 'lucide-react';
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
    rating?: number;
    total_reviews?: number;
}

interface Props {
    designers: Designer[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Hire a Designer', href: '/designers' },
];

export default function DesignersPage({ designers }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');

    const specialties = ['all', ...new Set(designers.map((d) => d.specialty).filter(Boolean) as string[])];

    const filteredDesigners = designers.filter((designer) => {
        const matchesSearch =
            designer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            designer.specialty?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'all' || designer.specialty === selectedSpecialty;
        return matchesSearch && matchesSpecialty;
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Hire a Designer" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hire a Designer</h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            Book a consultation with our professional interior designers
                        </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <Users className="h-4 w-4" />
                        <span>{designers.length} designers available</span>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or specialty..."
                            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <select
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                            {specialties.map((specialty) => (
                                <option key={specialty} value={specialty}>
                                    {specialty === 'all' ? 'All Specialties' : specialty}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Designers Grid */}
                {filteredDesigners.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 dark:border-slate-700 dark:bg-slate-900/50">
                        <Users className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                        <h3 className="mt-3 font-medium text-slate-900 dark:text-white">No designers found</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {searchQuery ? 'Try adjusting your search' : 'Check back later'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredDesigners.map((designer) => (
                            <Link
                                key={designer.id}
                                href={`/designers/${designer.id}`}
                                className="group rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-lg dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="flex items-center gap-3">
                                    {designer.avatar ? (
                                        <img
                                            src={designer.avatar}
                                            alt={designer.name}
                                            className="h-11 w-11 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-base font-semibold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                                            {designer.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate font-medium text-slate-900 dark:text-white">
                                            {designer.name}
                                        </h3>
                                        {designer.specialty && (
                                            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                                                {designer.specialty}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {designer.bio && (
                                    <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                                        {designer.bio}
                                    </p>
                                )}

                                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                    {designer.experience_years && (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                            <Briefcase className="h-3 w-3" />
                                            {designer.experience_years} yrs
                                        </span>
                                    )}
                                    {designer.hourly_rate && (
                                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                            <Clock className="h-3 w-3" />
                                            Rs. {designer.hourly_rate}/hr
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                        View Profile
                                    </span>
                                    <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

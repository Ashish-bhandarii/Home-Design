import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Armchair,
    Edit,
    Eye,
    Filter,
    MoreHorizontal,
    Plus,
    Search,
    Sofa,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface Furniture {
    id: number;
    name: string;
    category: string;
    room: string;
    price: number;
    image?: string;
    isActive: boolean;
    isFeatured: boolean;
    stock: number;
    createdAt: string;
}

interface Props {
    furniture: Furniture[];
    categories: string[];
    rooms: string[];
}

export default function FurnitureIndex({ furniture, categories, rooms }: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedRoom, setSelectedRoom] = useState('All');
    const [showFilters, setShowFilters] = useState(false);

    const allCategories = ['All', ...categories];
    const allRooms = ['All', ...rooms];

    const filteredFurniture = furniture.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesRoom = selectedRoom === 'All' || item.room === selectedRoom;
        return matchesSearch && matchesCategory && matchesRoom;
    });

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this furniture?')) {
            router.delete(`/admin/furniture/${id}`);
        }
    };

    const toggleActive = (id: number) => {
        router.post(`/admin/furniture/${id}/toggle-active`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AdminLayout breadcrumbs={[{ title: 'Dashboard', href: '/admin' }, { title: 'Furniture Library', href: '/admin/furniture' }]}>
            <Head title="Furniture Library - Admin" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Furniture Library
                        </h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            Manage furniture items that users can use in their designs
                        </p>
                    </div>
                    <Link
                        href="/admin/furniture/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl"
                    >
                        <Plus className="h-4 w-4" />
                        Add Furniture
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Search */}
                        <div className="relative flex-1 lg:max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search furniture..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                        </button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 dark:border-slate-700 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Category
                                </label>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                    {allCategories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Room
                                </label>
                                <select
                                    value={selectedRoom}
                                    onChange={(e) => setSelectedRoom(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                    {allRooms.map((room) => (
                                        <option key={room} value={room}>{room}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/50">
                                <Armchair className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">{furniture.length}</div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Total Items</div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/50">
                                <Eye className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {furniture.filter(f => f.isActive).length}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Active</div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/50">
                                <Sofa className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {new Set(furniture.map(f => f.category)).size}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Categories</div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950/50">
                                <MoreHorizontal className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {new Set(furniture.map(f => f.room)).size}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">Rooms</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Furniture Table */}
                <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                        Furniture
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                        Category
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                        Room
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                        Price
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredFurniture.map((item) => (
                                    <tr key={item.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                                                    {item.image ? (
                                                        <img src={`/storage/${item.image}`} alt={item.name} className="h-full w-full rounded-lg object-cover" />
                                                    ) : (
                                                        <Armchair className="h-6 w-6 text-slate-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900 dark:text-white">{item.name}</div>
                                                    <div className="text-sm text-slate-500 dark:text-slate-400">Added {formatDate(item.createdAt)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {item.room}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                            NPR {item.price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActive(item.id)}
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                                    item.isActive
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                                }`}
                                            >
                                                {item.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/admin/furniture/${item.id}/edit`}
                                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
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

                    {filteredFurniture.length === 0 && (
                        <div className="py-12 text-center">
                            <Armchair className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
                            <h3 className="mt-4 text-sm font-medium text-slate-900 dark:text-white">No furniture found</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Try adjusting your search or filter criteria
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}

import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, ImagePlus, Save, X } from 'lucide-react';
import { useState, type ChangeEvent, type FormEvent } from 'react';

interface Props {
    categories: string[];
    rooms: string[];
}

export default function FurnitureCreate({ categories, rooms }: Props) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        category: categories[0] || 'Seating',
        room: rooms[0] || 'Living Room',
        price: '',
        image: null as File | null,
        material: '',
        color: '',
        stock: '0',
        availability: 'In Stock',
        dimensions: {
            width: '',
            height: '',
            depth: '',
        },
        is_active: true,
        is_featured: false,
    });

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/furniture', {
            forceFormData: true,
        });
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin' },
                { title: 'Furniture Library', href: '/admin/furniture' },
                { title: 'Add Furniture', href: '/admin/furniture/create' },
            ]}
        >
            <Head title="Add Furniture - Admin" />

            <div className="mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => router.visit('/admin/furniture')}
                        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Furniture</h1>
                        <p className="text-slate-600 dark:text-slate-400">Create a new furniture item for the library</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    placeholder="e.g., Modern Sofa Set"
                                />
                                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    placeholder="Describe the furniture item..."
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Category *
                                </label>
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Room *
                                </label>
                                <select
                                    value={data.room}
                                    onChange={(e) => setData('room', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                    {rooms.map((room) => (
                                        <option key={room} value={room}>
                                            {room}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Price (NPR) *
                                </label>
                                <input
                                    type="number"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    placeholder="0"
                                    min="0"
                                />
                                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Stock
                                </label>
                                <input
                                    type="number"
                                    value={data.stock}
                                    onChange={(e) => setData('stock', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    placeholder="0"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Availability
                                </label>
                                <select
                                    value={data.availability}
                                    onChange={(e) => setData('availability', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                >
                                    <option value="In Stock">In Stock</option>
                                    <option value="Limited Stock">Limited Stock</option>
                                    <option value="Out of Stock">Out of Stock</option>
                                    <option value="Made to Order">Made to Order</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Material
                                </label>
                                <input
                                    type="text"
                                    value={data.material}
                                    onChange={(e) => setData('material', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    placeholder="e.g., Wood, Metal, Fabric"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Color
                                </label>
                                <input
                                    type="text"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    placeholder="e.g., Brown, Black, White"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Dimensions (cm)</h2>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Width
                                </label>
                                <input
                                    type="number"
                                    value={data.dimensions.width}
                                    onChange={(e) => setData('dimensions', { ...data.dimensions, width: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Height
                                </label>
                                <input
                                    type="number"
                                    value={data.dimensions.height}
                                    onChange={(e) => setData('dimensions', { ...data.dimensions, height: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    placeholder="0"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Depth
                                </label>
                                <input
                                    type="number"
                                    value={data.dimensions.depth}
                                    onChange={(e) => setData('dimensions', { ...data.dimensions, depth: e.target.value })}
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Image</h2>

                        {imagePreview ? (
                            <div className="relative inline-block">
                                <img src={imagePreview} alt="Preview" className="h-48 w-auto rounded-lg object-cover" />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow-lg transition-colors hover:bg-red-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-indigo-400 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-500 dark:hover:bg-slate-700">
                                <ImagePlus className="mb-2 h-8 w-8 text-slate-400" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Click to upload image</span>
                                <span className="text-xs text-slate-500">PNG, JPG, WEBP up to 5MB</span>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        )}
                        {errors.image && <p className="mt-2 text-sm text-red-500">{errors.image}</p>}
                    </div>

                    {/* Status */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Status</h2>

                        <div className="flex flex-wrap gap-6">
                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                            </label>

                            <label className="flex cursor-pointer items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={(e) => setData('is_featured', e.target.checked)}
                                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured</span>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.visit('/admin/furniture')}
                            className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Saving...' : 'Save Furniture'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

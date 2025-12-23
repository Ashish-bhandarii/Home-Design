import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Home,
    ImagePlus,
    LayoutGrid,
    PenTool,
    Plus,
    Save,
    X,
} from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';

interface Design {
    id: number;
    title: string;
    description: string | null;
    type: 'floor_plan' | 'home_design' | 'interior_design';
    category: string | null;
    thumbnail: string | null;
    images: string[] | null;
    features: string[] | null;
    dimensions: string | null;
    rooms: number | null;
    bathrooms: number | null;
    is_featured: boolean;
    is_active: boolean;
}

interface Props {
    design: Design;
}

export default function EditDesign({ design }: Props) {
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        design.thumbnail ? `/storage/${design.thumbnail}` : null,
    );
    const [imagesPreview, setImagesPreview] = useState<string[]>(
        design.images?.map((img) => `/storage/${img}`) || [],
    );
    const [newFeature, setNewFeature] = useState('');

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: design.title,
        description: design.description || '',
        type: design.type,
        category: design.category || '',
        thumbnail: null as File | null,
        images: [] as File[],
        features: design.features || [],
        dimensions: design.dimensions || '',
        rooms: design.rooms?.toString() || '',
        bathrooms: design.bathrooms?.toString() || '',
        is_featured: design.is_featured,
        is_active: design.is_active,
    });

    const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('thumbnail', file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const handleImagesChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setData('images', [...data.images, ...files]);
            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setImagesPreview([...imagesPreview, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData('images', newImages);

        const newPreviews = [...imagesPreview];
        newPreviews.splice(index, 1);
        setImagesPreview(newPreviews);
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setData('features', [...data.features, newFeature.trim()]);
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        const newFeatures = [...data.features];
        newFeatures.splice(index, 1);
        setData('features', newFeatures);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(`/admin/designs/${design.id}`, {
            forceFormData: true,
        });
    };

    const typeOptions = [
        { value: 'floor_plan', label: 'Floor Plan', icon: LayoutGrid, color: 'bg-blue-500' },
        { value: 'home_design', label: 'Home Design', icon: Home, color: 'bg-purple-500' },
        { value: 'interior_design', label: 'Interior Design', icon: PenTool, color: 'bg-orange-500' },
    ];

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/admin' },
                { title: 'Designs', href: '/admin/designs' },
                { title: 'Edit', href: `/admin/designs/${design.id}/edit` },
            ]}
        >
            <Head title={`Edit - ${design.title}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/designs"
                        className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Design</h1>
                        <p className="text-slate-600 dark:text-slate-400">Update "{design.title}"</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Design Type Selection */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Design Type</h2>
                        <div className="grid gap-4 sm:grid-cols-3">
                            {typeOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setData('type', option.value as typeof data.type)}
                                        className={`flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all ${
                                            data.type === option.value
                                                ? 'border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/30'
                                                : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        <div className={`rounded-xl ${option.color} p-3 text-white`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <span className="font-medium text-slate-900 dark:text-white">{option.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {errors.type && <p className="mt-2 text-sm text-red-500">{errors.type}</p>}
                    </div>

                    {/* Basic Information */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g., Modern 3-Bedroom Floor Plan"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe this design..."
                                    rows={4}
                                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                        Category
                                    </label>
                                    <input
                                        type="text"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        placeholder="e.g., Modern, Traditional, Minimalist"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                        Dimensions
                                    </label>
                                    <input
                                        type="text"
                                        value={data.dimensions}
                                        onChange={(e) => setData('dimensions', e.target.value)}
                                        placeholder="e.g., 1,200 sq ft"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                        Number of Rooms
                                    </label>
                                    <input
                                        type="number"
                                        value={data.rooms}
                                        onChange={(e) => setData('rooms', e.target.value)}
                                        placeholder="e.g., 3"
                                        min="0"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                        Number of Bathrooms
                                    </label>
                                    <input
                                        type="number"
                                        value={data.bathrooms}
                                        onChange={(e) => setData('bathrooms', e.target.value)}
                                        placeholder="e.g., 2"
                                        min="0"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Thumbnail Image</h2>
                        <div className="flex items-start gap-6">
                            {thumbnailPreview ? (
                                <div className="relative">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail preview"
                                        className="h-40 w-60 rounded-lg object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setData('thumbnail', null);
                                            setThumbnailPreview(null);
                                        }}
                                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex h-40 w-60 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-indigo-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-indigo-400">
                                    <ImagePlus className="h-8 w-8 text-slate-400" />
                                    <span className="mt-2 text-sm text-slate-500">Upload thumbnail</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleThumbnailChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                        {errors.thumbnail && <p className="mt-2 text-sm text-red-500">{errors.thumbnail}</p>}
                    </div>

                    {/* Gallery Images */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Gallery Images</h2>
                        <div className="flex flex-wrap gap-4">
                            {imagesPreview.map((preview, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={preview}
                                        alt={`Gallery ${index + 1}`}
                                        className="h-32 w-32 rounded-lg object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            <label className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-indigo-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-indigo-400">
                                <Plus className="h-6 w-6 text-slate-400" />
                                <span className="mt-1 text-xs text-slate-500">Add image</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImagesChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Features</h2>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newFeature}
                                    onChange={(e) => setNewFeature(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                    placeholder="Add a feature..."
                                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="rounded-lg bg-indigo-500 px-4 py-2.5 text-white transition-colors hover:bg-indigo-600"
                                >
                                    <Plus className="h-5 w-5" />
                                </button>
                            </div>
                            {data.features.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {data.features.map((feature, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400"
                                        >
                                            {feature}
                                            <button
                                                type="button"
                                                onClick={() => removeFeature(index)}
                                                className="ml-1 rounded-full p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-900"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Options */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Status</h2>
                        <div className="space-y-4">
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-5 w-5 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                                />
                                <div>
                                    <span className="font-medium text-slate-900 dark:text-white">Active</span>
                                    <p className="text-sm text-slate-500">Make this design visible to users</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={(e) => setData('is_featured', e.target.checked)}
                                    className="h-5 w-5 rounded border-slate-300 text-indigo-500 focus:ring-indigo-500"
                                />
                                <div>
                                    <span className="font-medium text-slate-900 dark:text-white">Featured</span>
                                    <p className="text-sm text-slate-500">Show this design in featured sections</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Link
                            href="/admin/designs"
                            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl disabled:opacity-50"
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

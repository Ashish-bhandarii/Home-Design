import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Home, Image as ImageIcon, Save, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface DesignImage {
    id: number;
    image_path: string;
    sort_order: number;
}

interface Props {
    homeDesign: {
        id: number;
        name: string;
        description: string | null;
        style: string | null;
        total_floors: number;
        total_area_sqft: string | number | null;
        plot_width: string | number | null;
        plot_length: string | number | null;
        bedrooms: number;
        bathrooms: number;
        kitchens: number;
        living_rooms: number;
        dining_rooms: number;
        balconies: number;
        garages: number;
        has_basement: boolean;
        has_terrace: boolean;
        has_garden: boolean;
        has_swimming_pool: boolean;
        construction_type: string | null;
        facing_direction: string | null;
        estimated_cost_min: string | number | null;
        estimated_cost_max: string | number | null;
        features: string[] | null;
        tags: string[] | null;
        is_featured: boolean;
        is_active: boolean;
        cover_image: string | null;
        images: DesignImage[];
    };
    styleOptions: Record<string, string>;
    constructionTypeOptions: Record<string, string>;
    facingDirectionOptions: Record<string, string>;
}

interface FormData {
    name: string;
    description: string;
    style: string;
    construction_type: string;
    facing_direction: string;
    total_floors: number;
    total_area_sqft: string | number;
    plot_width: string | number;
    plot_length: string | number;
    bedrooms: number;
    bathrooms: number;
    kitchens: number;
    living_rooms: number;
    dining_rooms: number;
    balconies: number;
    garages: number;
    has_basement: boolean;
    has_terrace: boolean;
    has_garden: boolean;
    has_swimming_pool: boolean;
    estimated_cost_min: string | number;
    estimated_cost_max: string | number;
    features: string[];
    tags: string[];
    is_featured: boolean;
    is_active: boolean;
    cover_image: File | null;
    gallery_images: File[];
}

export default function HomeDesignsEdit({
    homeDesign,
    styleOptions,
    constructionTypeOptions,
    facingDirectionOptions,
}: Props) {
    const { data, setData, processing, errors, progress, clearErrors } = useForm<FormData>({
        name: homeDesign.name,
        description: homeDesign.description ?? '',
        style: homeDesign.style ?? '',
        construction_type: homeDesign.construction_type ?? '',
        facing_direction: homeDesign.facing_direction ?? '',
        total_floors: homeDesign.total_floors,
        total_area_sqft: homeDesign.total_area_sqft ?? '',
        plot_width: homeDesign.plot_width ?? '',
        plot_length: homeDesign.plot_length ?? '',
        bedrooms: homeDesign.bedrooms,
        bathrooms: homeDesign.bathrooms,
        kitchens: homeDesign.kitchens,
        living_rooms: homeDesign.living_rooms,
        dining_rooms: homeDesign.dining_rooms,
        balconies: homeDesign.balconies,
        garages: homeDesign.garages,
        has_basement: homeDesign.has_basement,
        has_terrace: homeDesign.has_terrace,
        has_garden: homeDesign.has_garden,
        has_swimming_pool: homeDesign.has_swimming_pool,
        estimated_cost_min: homeDesign.estimated_cost_min ?? '',
        estimated_cost_max: homeDesign.estimated_cost_max ?? '',
        features: homeDesign.features ?? [],
        tags: homeDesign.tags ?? [],
        is_featured: homeDesign.is_featured,
        is_active: homeDesign.is_active,
        cover_image: null,
        gallery_images: [],
    });

    const [featureInput, setFeatureInput] = useState('');
    const [tagInput, setTagInput] = useState('');

    const deleteImage = (imageId: number) => {
        if (confirm('Are you sure you want to delete this image?')) {
            router.delete(admin.homeDesigns.deleteImage({ homeDesign: homeDesign.id, image: imageId }).url, {
                preserveScroll: true,
            });
        }
    };

    const addFeature = () => {
        if (!featureInput.trim()) return;
        setData('features', [...data.features, featureInput.trim()]);
        setFeatureInput('');
    };

    const addTag = () => {
        if (!tagInput.trim()) return;
        setData('tags', [...data.tags, tagInput.trim()]);
        setTagInput('');
    };

    const removeFeature = (index: number) => {
        setData('features', data.features.filter((_, i) => i !== index));
    };

    const removeTag = (index: number) => {
        setData('tags', data.tags.filter((_, i) => i !== index));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        clearErrors();
        
        // Build form data manually to ensure name is properly sent
        const formData = new FormData();
        formData.append('name', data.name.trim());
        formData.append('description', data.description);
        formData.append('style', data.style);
        formData.append('construction_type', data.construction_type);
        formData.append('facing_direction', data.facing_direction);
        formData.append('total_floors', String(data.total_floors));
        formData.append('total_area_sqft', String(data.total_area_sqft));
        formData.append('plot_width', String(data.plot_width));
        formData.append('plot_length', String(data.plot_length));
        formData.append('bedrooms', String(data.bedrooms));
        formData.append('bathrooms', String(data.bathrooms));
        formData.append('kitchens', String(data.kitchens));
        formData.append('living_rooms', String(data.living_rooms));
        formData.append('dining_rooms', String(data.dining_rooms));
        formData.append('balconies', String(data.balconies));
        formData.append('garages', String(data.garages));
        formData.append('has_basement', data.has_basement ? '1' : '0');
        formData.append('has_terrace', data.has_terrace ? '1' : '0');
        formData.append('has_garden', data.has_garden ? '1' : '0');
        formData.append('has_swimming_pool', data.has_swimming_pool ? '1' : '0');
        formData.append('estimated_cost_min', String(data.estimated_cost_min));
        formData.append('estimated_cost_max', String(data.estimated_cost_max));
        formData.append('is_featured', data.is_featured ? '1' : '0');
        formData.append('is_active', data.is_active ? '1' : '0');
        
        data.features.forEach((f, i) => formData.append(`features[${i}]`, f));
        data.tags.forEach((t, i) => formData.append(`tags[${i}]`, t));
        
        if (data.cover_image) {
            formData.append('cover_image', data.cover_image);
        }

        data.gallery_images.forEach((file, i) => {
            formData.append(`gallery_images[${i}]`, file);
        });
        
        // Use _method for Laravel to handle as PUT
        formData.append('_method', 'PUT');
        
        router.post(admin.homeDesigns.update({ homeDesign: homeDesign.id }).url, formData, {
            forceFormData: true,
        });
    };

    const highlightStats = useMemo(() => [
        { label: 'Bedrooms', value: data.bedrooms },
        { label: 'Bathrooms', value: data.bathrooms },
        { label: 'Floors', value: data.total_floors },
    ], [data.bedrooms, data.bathrooms, data.total_floors]);

    return (
        <AdminLayout>
            <Head title="Edit Home Design" />
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={admin.homeDesigns.index().url}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Home className="h-5 w-5 text-indigo-600" /> Edit Home Design
                        </h1>
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" /> Update
                        {progress && <span className="text-xs">{progress.percentage}%</span>}
                    </button>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Core Details</h2>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Name *</label>
                            <input
                                name="name"
                                value={data.name}
                                onChange={(event) => {
                                    setData('name', event.target.value);
                                    clearErrors('name');
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                required
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Style</label>
                            <select
                                value={data.style}
                                onChange={(event) => setData('style', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Select style</option>
                                {Object.entries(styleOptions).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Construction Type</label>
                            <select
                                value={data.construction_type}
                                onChange={(event) => setData('construction_type', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Select construction</option>
                                {Object.entries(constructionTypeOptions).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Facing Direction</label>
                            <select
                                value={data.facing_direction}
                                onChange={(event) => setData('facing_direction', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Select direction</option>
                                {Object.entries(facingDirectionOptions).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Total Floors *</label>
                            <input
                                type="number"
                                min={1}
                                value={data.total_floors}
                                onChange={(event) => setData('total_floors', Number(event.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Total Area (sq.ft)</label>
                            <input
                                type="number"
                                min={0}
                                value={data.total_area_sqft}
                                onChange={(event) => setData('total_area_sqft', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Bedrooms</label>
                            <input
                                type="number"
                                min={0}
                                value={data.bedrooms}
                                onChange={(event) => setData('bedrooms', Number(event.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Bathrooms</label>
                            <input
                                type="number"
                                min={0}
                                value={data.bathrooms}
                                onChange={(event) => setData('bathrooms', Number(event.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Living Rooms</label>
                            <input
                                type="number"
                                min={0}
                                value={data.living_rooms}
                                onChange={(event) => setData('living_rooms', Number(event.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Dining Rooms</label>
                            <input
                                type="number"
                                min={0}
                                value={data.dining_rooms}
                                onChange={(event) => setData('dining_rooms', Number(event.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Garages</label>
                            <input
                                type="number"
                                min={0}
                                value={data.garages}
                                onChange={(event) => setData('garages', Number(event.target.value))}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Plot Width (ft)</label>
                            <input
                                type="number"
                                min={0}
                                value={data.plot_width}
                                onChange={(event) => setData('plot_width', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Plot Length (ft)</label>
                            <input
                                type="number"
                                min={0}
                                value={data.plot_length}
                                onChange={(event) => setData('plot_length', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Est. Cost Min</label>
                            <input
                                type="number"
                                min={0}
                                value={data.estimated_cost_min}
                                onChange={(event) => setData('estimated_cost_min', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Est. Cost Max</label>
                            <input
                                type="number"
                                min={0}
                                value={data.estimated_cost_max}
                                onChange={(event) => setData('estimated_cost_max', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div className="md:col-span-2 xl:col-span-3">
                            <label className="mb-1.5 block text-sm font-medium">Description</label>
                            <textarea
                                rows={4}
                                value={data.description}
                                onChange={(event) => setData('description', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Gallery & Status</h2>
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-300">
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={(event) => setData('is_featured', event.target.checked)}
                                />
                                Featured
                            </label>
                            <label className="inline-flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(event) => setData('is_active', event.target.checked)}
                                />
                                Published
                            </label>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium">Current Cover Image</label>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-600 dark:bg-slate-900">
                                {homeDesign.cover_image ? (
                                    <img
                                        src={`/storage/${homeDesign.cover_image}`}
                                        alt={homeDesign.name}
                                        className="mx-auto max-h-40 w-auto rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-1 text-sm text-slate-500">
                                        <ImageIcon className="h-6 w-6 text-orange-500" />
                                        <span>No cover yet</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Upload New Cover</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                    setData('cover_image', event.target.files ? event.target.files[0] : null)
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700 dark:border-slate-600 dark:bg-slate-700"
                            />
                            {errors.cover_image && <p className="mt-1 text-xs text-red-600">{errors.cover_image}</p>}
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Features & Tags</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="mb-2 block text-sm font-medium">Features</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    value={featureInput}
                                    onChange={(event) => setFeatureInput(event.target.value)}
                                    onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addFeature())}
                                    placeholder="Add feature"
                                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={addFeature}
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {data.features.map((feature, index) => (
                                    <span
                                        key={index}
                                        className="group inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                                    >
                                        {feature}
                                        <button
                                            type="button"
                                            onClick={() => removeFeature(index)}
                                            className="opacity-60 transition hover:opacity-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium">Tags</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    value={tagInput}
                                    onChange={(event) => setTagInput(event.target.value)}
                                    onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), addTag())}
                                    placeholder="Add tag"
                                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={addTag}
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {data.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className="group inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(index)}
                                            className="opacity-60 transition hover:opacity-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Gallery Images */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Gallery Images</h2>
                    
                    {/* Existing Images */}
                    {homeDesign.images.length > 0 && (
                        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {homeDesign.images.map((image) => (
                                <div key={image.id} className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-700">
                                    <img
                                        src={`/storage/${image.image_path}`}
                                        alt={`Gallery image ${image.id}`}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                                        <button
                                            type="button"
                                            onClick={() => deleteImage(image.id)}
                                            className="rounded-full bg-red-600 p-2 text-white hover:bg-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload New Images */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Add New Images
                        </label>
                        <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800/50 dark:hover:bg-slate-800">
                            <div className="text-center">
                                <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                                <div className="mt-4 flex text-sm leading-6 text-slate-600 dark:text-slate-400">
                                    <label
                                        htmlFor="gallery-upload"
                                        className="relative cursor-pointer rounded-md bg-transparent font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                                    >
                                        <span>Upload files</span>
                                        <input
                                            id="gallery-upload"
                                            name="gallery-upload"
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    setData('gallery_images', Array.from(e.target.files));
                                                }
                                            }}
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                                    PNG, JPG, GIF up to 5MB each
                                </p>
                            </div>
                        </div>
                        {data.gallery_images.length > 0 && (
                            <div className="mt-4">
                                <h4 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">Selected for upload:</h4>
                                <ul className="space-y-1">
                                    {data.gallery_images.map((file, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <ImageIcon className="h-4 w-4" />
                                            {file.name}
                                            <span className="text-xs text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-300">Scene summary</p>
                            <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                                {homeDesign.name}
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {highlightStats.map((stat) => (
                                <div key={stat.label} className="rounded-2xl border border-slate-100 p-3 text-center dark:border-slate-700">
                                    <p className="text-xs uppercase tracking-wider text-slate-400">{stat.label}</p>
                                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}

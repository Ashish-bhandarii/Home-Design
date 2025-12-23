import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Image as ImageIcon, Palette, Save, Trash2, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface DesignImage {
    id: number;
    image_path: string;
    sort_order: number;
}

interface Props {
    interiorDesign: {
        id: number;
        name: string;
        description: string | null;
        room_type: string;
        style: string | null;
        room_width: string | number | null;
        room_length: string | number | null;
        room_height: string | number | null;
        area_sqft: string | number | null;
        color_scheme: string | null;
        primary_material: string | null;
        flooring_type: string | null;
        ceiling_type: string | null;
        lighting_type: string | null;
        estimated_cost_min: string | number | null;
        estimated_cost_max: string | number | null;
        furniture_items: string[] | null;
        color_palette: string[] | null;
        features: string[] | null;
        tags: string[] | null;
        cover_image: string | null;
        images: DesignImage[];
        is_featured: boolean;
        is_active: boolean;
    };
    roomTypeOptions: Record<string, string>;
    styleOptions: Record<string, string>;
    flooringTypeOptions: Record<string, string>;
    ceilingTypeOptions: Record<string, string>;
    lightingTypeOptions: Record<string, string>;
    primaryMaterialOptions: Record<string, string>;
}

interface FormData {
    name: string;
    description: string;
    room_type: string;
    style: string;
    room_width: string | number;
    room_length: string | number;
    room_height: string | number;
    area_sqft: string | number;
    color_scheme: string;
    primary_material: string;
    flooring_type: string;
    ceiling_type: string;
    lighting_type: string;
    estimated_cost_min: string | number;
    estimated_cost_max: string | number;
    furniture_items: string[];
    color_palette: string[];
    features: string[];
    tags: string[];
    is_featured: boolean;
    is_active: boolean;
    cover_image: File | null;
    gallery_images: File[];
}

export default function InteriorDesignsEdit({
    interiorDesign,
    roomTypeOptions,
    styleOptions,
    flooringTypeOptions,
    ceilingTypeOptions,
    lightingTypeOptions,
    primaryMaterialOptions,
}: Props) {
    const {
        data,
        setData,
        processing,
        errors,
        progress,
        clearErrors,
    } = useForm<FormData>({
        name: interiorDesign.name,
        description: interiorDesign.description ?? '',
        room_type: interiorDesign.room_type,
        style: interiorDesign.style ?? '',
        room_width: interiorDesign.room_width ?? '',
        room_length: interiorDesign.room_length ?? '',
        room_height: interiorDesign.room_height ?? '',
        area_sqft: interiorDesign.area_sqft ?? '',
        color_scheme: interiorDesign.color_scheme ?? '',
        primary_material: interiorDesign.primary_material ?? '',
        flooring_type: interiorDesign.flooring_type ?? '',
        ceiling_type: interiorDesign.ceiling_type ?? '',
        lighting_type: interiorDesign.lighting_type ?? '',
        estimated_cost_min: interiorDesign.estimated_cost_min ?? '',
        estimated_cost_max: interiorDesign.estimated_cost_max ?? '',
        furniture_items: interiorDesign.furniture_items ?? [],
        color_palette: interiorDesign.color_palette ?? [],
        features: interiorDesign.features ?? [],
        tags: interiorDesign.tags ?? [],
        is_featured: interiorDesign.is_featured,
        is_active: interiorDesign.is_active,
        cover_image: null,
        gallery_images: [],
    });

    const [simpleInput, setSimpleInput] = useState({
        furniture: '',
        color: '',
        feature: '',
        tag: '',
    });

    const deleteImage = (imageId: number) => {
        if (confirm('Are you sure you want to delete this image?')) {
            router.delete(`/admin/interior-designs/${interiorDesign.id}/images/${imageId}`, {
                preserveScroll: true,
            });
        }
    };

    const addListItem = (key: 'furniture' | 'color' | 'feature' | 'tag') => {
        const value = simpleInput[key].trim();
        if (!value) return;
        const fieldMap: Record<string, keyof FormData> = {
            furniture: 'furniture_items',
            color: 'color_palette',
            feature: 'features',
            tag: 'tags',
        };
        const field = fieldMap[key];
        setData(field, [...(data[field] as string[]), value]);
        setSimpleInput((prev) => ({ ...prev, [key]: '' }));
    };

    const removeListItem = (field: keyof FormData, index: number) => {
        setData(field, (data[field] as string[]).filter((_: string, i: number) => i !== index));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        clearErrors();
        
        // Build form data manually to ensure name is properly sent
        const formData = new FormData();
        formData.append('name', data.name.trim());
        formData.append('description', data.description);
        formData.append('room_type', data.room_type);
        formData.append('style', data.style);
        formData.append('room_width', String(data.room_width));
        formData.append('room_length', String(data.room_length));
        formData.append('room_height', String(data.room_height));
        formData.append('area_sqft', String(data.area_sqft));
        formData.append('color_scheme', data.color_scheme);
        formData.append('primary_material', data.primary_material);
        formData.append('flooring_type', data.flooring_type);
        formData.append('ceiling_type', data.ceiling_type);
        formData.append('lighting_type', data.lighting_type);
        formData.append('estimated_cost_min', String(data.estimated_cost_min));
        formData.append('estimated_cost_max', String(data.estimated_cost_max));
        formData.append('is_featured', data.is_featured ? '1' : '0');
        formData.append('is_active', data.is_active ? '1' : '0');
        
        data.furniture_items.forEach((f, i) => formData.append(`furniture_items[${i}]`, f));
        data.color_palette.forEach((c, i) => formData.append(`color_palette[${i}]`, c));
        data.features.forEach((f, i) => formData.append(`features[${i}]`, f));
        data.tags.forEach((t, i) => formData.append(`tags[${i}]`, t));
        
        if (data.cover_image) {
            formData.append('cover_image', data.cover_image);
        }
        
        data.gallery_images.forEach((img, i) => formData.append(`gallery_images[${i}]`, img));
        
        // Use _method for Laravel to handle as PUT
        formData.append('_method', 'PUT');
        
        router.post(`/admin/interior-designs/${interiorDesign.id}`, formData, {
            forceFormData: true,
        });
    };

    const statHighlights = useMemo(
        () => [
            { label: 'Room Type', value: roomTypeOptions[interiorDesign.room_type] ?? interiorDesign.room_type },
            { label: 'Area', value: interiorDesign.area_sqft ?? 'TBD' },
            { label: 'Style', value: styleOptions[interiorDesign.style ?? ''] ?? 'Unstyled' },
        ],
        [interiorDesign.room_type, interiorDesign.area_sqft, interiorDesign.style, roomTypeOptions, styleOptions]
    );

    return (
        <AdminLayout>
            <Head title="Edit Interior Design" />
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin/interior-designs"
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Link>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Palette className="h-5 w-5 text-indigo-600" /> Edit Interior Design
                        </h1>
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" /> Save
                        {progress && <span className="text-xs">{progress.percentage}%</span>}
                    </button>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Basics</h2>
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Name *</label>
                            <input
                                name="name"
                                required
                                value={data.name}
                                onChange={(event) => {
                                    setData('name', event.target.value);
                                    clearErrors('name');
                                }}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Room Type *</label>
                            <select
                                required
                                value={data.room_type}
                                onChange={(event) => setData('room_type', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Select</option>
                                {Object.entries(roomTypeOptions).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
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
                            <label className="mb-1.5 block text-sm font-medium">Area (sq.ft)</label>
                            <input
                                type="number"
                                min={0}
                                value={data.area_sqft}
                                onChange={(event) => setData('area_sqft', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Color Scheme</label>
                            <input
                                value={data.color_scheme}
                                onChange={(event) => setData('color_scheme', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Primary Material</label>
                            <select
                                value={data.primary_material}
                                onChange={(event) => setData('primary_material', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Select material</option>
                                {Object.entries(primaryMaterialOptions).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Flooring</label>
                            <select
                                value={data.flooring_type}
                                onChange={(event) => setData('flooring_type', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Select</option>
                                {Object.entries(flooringTypeOptions).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Ceiling</label>
                            <select
                                value={data.ceiling_type}
                                onChange={(event) => setData('ceiling_type', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Select</option>
                                {Object.entries(ceilingTypeOptions).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Lighting</label>
                            <select
                                value={data.lighting_type}
                                onChange={(event) => setData('lighting_type', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Select</option>
                                {Object.entries(lightingTypeOptions).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Estimated Cost Min</label>
                            <input
                                type="number"
                                min={0}
                                value={data.estimated_cost_min}
                                onChange={(event) => setData('estimated_cost_min', event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Estimated Cost Max</label>
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
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Media & Status</h2>
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
                                Live
                            </label>
                        </div>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium">Current Cover</label>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-600 dark:bg-slate-900">
                                {interiorDesign.cover_image ? (
                                    <img
                                        src={`/storage/${interiorDesign.cover_image}`}
                                        alt={interiorDesign.name}
                                        className="mx-auto max-h-40 w-auto rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-1 text-sm text-slate-500">
                                        <ImageIcon className="h-6 w-6 text-orange-500" />
                                        <span>No cover uploaded</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="mb-1.5 block text-sm font-medium">Upload Cover</label>
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

                {/* Gallery Images */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">Gallery Images</h2>
                    
                    {/* Existing Images */}
                    {interiorDesign.images && interiorDesign.images.length > 0 && (
                        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {interiorDesign.images.map((image) => (
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
                    <div>
                        <label className="mb-1.5 block text-sm font-medium">Add New Gallery Images</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                setData('gallery_images', event.target.files ? Array.from(event.target.files) : [])
                            }
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700 dark:border-slate-600 dark:bg-slate-700"
                        />
                        {data.gallery_images.length > 0 && (
                            <div className="mt-3">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {data.gallery_images.length} file(s) selected for upload
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Lists</h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        <ListEditor
                            title="Furniture Items"
                            value={data.furniture_items}
                            inputValue={simpleInput.furniture}
                            placeholder="Add furniture"
                            onInputChange={(value) => setSimpleInput((prev) => ({ ...prev, furniture: value }))}
                            onAdd={() => addListItem('furniture')}
                            onRemove={(index) => removeListItem('furniture_items', index)}
                        />
                        <ListEditor
                            title="Color Palette"
                            value={data.color_palette}
                            inputValue={simpleInput.color}
                            placeholder="Add color"
                            onInputChange={(value) => setSimpleInput((prev) => ({ ...prev, color: value }))}
                            onAdd={() => addListItem('color')}
                            onRemove={(index) => removeListItem('color_palette', index)}
                        />
                        <ListEditor
                            title="Features"
                            value={data.features}
                            inputValue={simpleInput.feature}
                            placeholder="Add feature"
                            onInputChange={(value) => setSimpleInput((prev) => ({ ...prev, feature: value }))}
                            onAdd={() => addListItem('feature')}
                            onRemove={(index) => removeListItem('features', index)}
                        />
                        <ListEditor
                            title="Tags"
                            value={data.tags}
                            inputValue={simpleInput.tag}
                            placeholder="Add tag"
                            onInputChange={(value) => setSimpleInput((prev) => ({ ...prev, tag: value }))}
                            onAdd={() => addListItem('tag')}
                            onRemove={(index) => removeListItem('tags', index)}
                        />
                    </div>
                </section>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-300">Interior snapshot</p>
                            <p className="text-2xl font-semibold text-slate-900 dark:text-white">{interiorDesign.name}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {statHighlights.map((stat) => (
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

interface ListEditorProps {
    title: string;
    value: string[];
    inputValue: string;
    placeholder: string;
    onAdd: () => void;
    onInputChange: (value: string) => void;
    onRemove: (index: number) => void;
}

function ListEditor({ title, value, inputValue, placeholder, onAdd, onInputChange, onRemove }: ListEditorProps) {
    return (
        <div>
            <label className="mb-2 block text-sm font-medium">{title}</label>
            <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        value={inputValue}
                        placeholder={placeholder}
                        onChange={(event) => onInputChange(event.target.value)}
                        onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), onAdd())}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                    />
                    <button type="button" onClick={onAdd} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                        Add
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {value.map((item, index) => (
                        <span key={`${item}-${index}`} className="group inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                            {item}
                            <button type="button" onClick={() => onRemove(index)} className="opacity-60 transition hover:opacity-100">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

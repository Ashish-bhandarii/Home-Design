import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FilePlus, Image as ImageIcon, Layers, Palette, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  roomTypeOptions: Record<string, string>;
  styleOptions: Record<string, string>;
  flooringTypeOptions: Record<string, string>;
  ceilingTypeOptions: Record<string, string>;
  lightingTypeOptions: Record<string, string>;
  primaryMaterialOptions: Record<string, string>;
  fileTypeOptions: Record<string, string>;
}

export default function InteriorDesignsCreate({
  roomTypeOptions,
  styleOptions,
  flooringTypeOptions,
  ceilingTypeOptions,
  lightingTypeOptions,
  primaryMaterialOptions,
  fileTypeOptions,
}: Props) {
  // Strongly typed form data to avoid deep/implicit any issues
  interface FormData {
    name: string;
    description: string;
    room_type: string;
    style: string;
    room_width: string;
    room_length: string;
    room_height: string;
    area_sqft: string;
    color_scheme: string;
    primary_material: string;
    flooring_type: string;
    ceiling_type: string;
    lighting_type: string;
    estimated_cost_min: string;
    estimated_cost_max: string;
    cover_image: File | null;
    gallery_images: File[];
    furniture_items: string[];
    color_palette: string[];
    features: string[];
    tags: string[];
    is_featured: boolean;
    is_active: boolean;
    design_files: (File | undefined)[];
    design_files_types: string[];
    design_files_titles: (string | null)[];
  }

  const { data, setData, post, processing, errors, progress, reset } = useForm<FormData>({
    name: '',
    description: '',
    room_type: '',
    style: '',
    room_width: '',
    room_length: '',
    room_height: '',
    area_sqft: '',
    color_scheme: '',
    primary_material: '',
    flooring_type: '',
    ceiling_type: '',
    lighting_type: '',
    estimated_cost_min: '',
    estimated_cost_max: '',
    cover_image: null,
    gallery_images: [],
    furniture_items: [],
    color_palette: [],
    features: [],
    tags: [],
    is_featured: false,
    is_active: true,
    design_files: [],
    design_files_types: [],
    design_files_titles: [],
  });

  const [furnitureInput, setFurnitureInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const addSimpleItem = (key: 'furniture_items' | 'color_palette' | 'features' | 'tags', value: string, setFn: (v: string) => void) => {
    if (!value.trim()) return;
    setData(key, [...(data[key] as string[]), value.trim()]);
    setFn('');
  };
  const removeSimpleItem = (key: 'furniture_items' | 'color_palette' | 'features' | 'tags', index: number) => {
    setData(
      key,
      (data[key] as string[]).filter((_: string, i: number) => i !== index)
    );
  };

  const addDesignFileInput = () => {
    setData('design_files_types', [...data.design_files_types, 'other']);
    setData('design_files_titles', [...data.design_files_titles, '']);
  };
  const removeDesignFileInput = (index: number) => {
    setData(
      'design_files_types',
      data.design_files_types.filter((_: string, i: number) => i !== index)
    );
    setData(
      'design_files_titles',
      data.design_files_titles.filter((_: string | null, i: number) => i !== index)
    );
    setData(
      'design_files',
      data.design_files.filter((_: File | undefined, i: number) => i !== index)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const handleSuccess: () => void = () => {
      reset();
    };
    post('/admin/interior-designs', {
      forceFormData: true,
      onSuccess: handleSuccess,
    });
  };

  return (
    <AdminLayout>
      <Head title="Create Interior Design" />
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/interior-designs" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="h-5 w-5 text-indigo-600" /> New Interior Design
            </h1>
          </div>
          <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl disabled:opacity-60">
            <Save className="h-4 w-4" /> Save Interior
            {progress && <span className="text-xs">{progress.percentage}%</span>}
          </button>
        </div>

        {/* Basics */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            Basics
          </h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Name *</label>
              <input value={data.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('name', e.target.value)} required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Room Type *</label>
              <select value={data.room_type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('room_type', e.target.value)} required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                <option value="">Select</option>
                {Object.entries(roomTypeOptions).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Style</label>
              <select value={data.style} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('style', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                <option value="">Select style</option>
                {Object.entries(styleOptions).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Width (ft)</label>
              <input type="number" min={0} value={data.room_width} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('room_width', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Length (ft)</label>
              <input type="number" min={0} value={data.room_length} onChange={(e) => setData('room_length', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Height (ft)</label>
              <input type="number" min={0} value={data.room_height} onChange={(e) => setData('room_height', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Area (sq.ft)</label>
              <input type="number" min={0} value={data.area_sqft} onChange={(e) => setData('area_sqft', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Color Scheme</label>
              <input value={data.color_scheme} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('color_scheme', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Primary Material</label>
              <select value={data.primary_material} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('primary_material', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                <option value="">Select</option>
                {Object.entries(primaryMaterialOptions).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Flooring</label>
              <select value={data.flooring_type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('flooring_type', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                <option value="">Select</option>
                {Object.entries(flooringTypeOptions).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Ceiling</label>
              <select value={data.ceiling_type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('ceiling_type', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                <option value="">Select</option>
                {Object.entries(ceilingTypeOptions).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Lighting</label>
              <select value={data.lighting_type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setData('lighting_type', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                <option value="">Select</option>
                {Object.entries(lightingTypeOptions).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Estimated Cost Min</label>
              <input type="number" min={0} value={data.estimated_cost_min} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('estimated_cost_min', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Estimated Cost Max</label>
              <input type="number" min={0} value={data.estimated_cost_max} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('estimated_cost_max', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
            </div>
            <div className="md:col-span-2 xl:col-span-3">
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <textarea rows={4} value={data.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('description', e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Describe the interior concept, colors, furniture, and highlights." />
            </div>
          </div>
        </section>

        {/* Media & Files */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <ImageIcon className="h-5 w-5 text-indigo-600" /> Media & Files
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Cover Image</label>
              <input type="file" accept="image/*" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('cover_image', e.target.files ? e.target.files[0] : null)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700 dark:border-slate-600 dark:bg-slate-700" />
              {errors.cover_image && <p className="mt-1 text-xs text-red-600">{errors.cover_image}</p>}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-sm font-medium">Gallery Images</label>
              <input multiple type="file" accept="image/*" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData('gallery_images', e.target.files ? Array.from(e.target.files) : [])} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700 dark:border-slate-600 dark:bg-slate-700" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-sm font-medium">Design Files</label>
              <div className="space-y-4">
                {data.design_files_types.map((type: string, i: number) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-4 dark:border-slate-600">
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium">File Type</label>
                        <select value={type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { const arr = [...data.design_files_types]; arr[i] = e.target.value; setData('design_files_types', arr); }} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                          {Object.entries(fileTypeOptions).map(([val, label]) => (<option key={val} value={val}>{label}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Title</label>
                        <input value={data.design_files_titles[i] || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const arr = [...data.design_files_titles]; arr[i] = e.target.value; setData('design_files_titles', arr); }} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" placeholder="Optional title" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium">Upload File</label>
                        <input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const arr = [...data.design_files]; arr[i] = e.target.files ? e.target.files[0] : undefined; setData('design_files', arr); }} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs file:mr-2 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-indigo-700 dark:border-slate-600 dark:bg-slate-700" />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button type="button" onClick={() => removeDesignFileInput(i)} className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50">
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addDesignFileInput} className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50">
                  <FilePlus className="h-3 w-3" /> Add File
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Lists */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Layers className="h-5 w-5 text-indigo-600" /> Furniture, Colors, Features & Tags
          </h2>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
            {/* Furniture */}
            <div>
              <label className="mb-2 block text-sm font-medium">Furniture Items</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input value={furnitureInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFurnitureInput(e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), addSimpleItem('furniture_items', furnitureInput, setFurnitureInput))} placeholder="Add item (Enter)" className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                <button type="button" onClick={() => addSimpleItem('furniture_items', furnitureInput, setFurnitureInput)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Add</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(data.furniture_items as string[]).map((f: string, i: number) => (
                  <span key={i} className="group inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 break-words max-w-full">
                    {f}
                    <button type="button" onClick={() => removeSimpleItem('furniture_items', i)} className="opacity-60 transition hover:opacity-100">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            {/* Colors */}
            <div>
              <label className="mb-2 block text-sm font-medium">Color Palette</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input value={colorInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setColorInput(e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), addSimpleItem('color_palette', colorInput, setColorInput))} placeholder="#RRGGBB or name" className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                <button type="button" onClick={() => addSimpleItem('color_palette', colorInput, setColorInput)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Add</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(data.color_palette as string[]).map((c: string, i: number) => (
                  <span key={i} className="group inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 break-words max-w-full">
                    {c}
                    <button type="button" onClick={() => removeSimpleItem('color_palette', i)} className="opacity-60 transition hover:opacity-100">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            {/* Features */}
            <div>
              <label className="mb-2 block text-sm font-medium">Features</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input value={featureInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFeatureInput(e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), addSimpleItem('features', featureInput, setFeatureInput))} placeholder="Add feature (Enter)" className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                <button type="button" onClick={() => addSimpleItem('features', featureInput, setFeatureInput)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Add</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(data.features as string[]).map((f: string, i: number) => (
                  <span key={i} className="group inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 break-words max-w-full">
                    {f}
                    <button type="button" onClick={() => removeSimpleItem('features', i)} className="opacity-60 transition hover:opacity-100">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium">Tags</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input value={tagInput} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), addSimpleItem('tags', tagInput, setTagInput))} placeholder="Add tag (Enter)" className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white" />
                <button type="button" onClick={() => addSimpleItem('tags', tagInput, setTagInput)} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Add</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(data.tags as string[]).map((t: string, i: number) => (
                  <span key={i} className="group inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 break-words max-w-full">
                    {t}
                    <button type="button" onClick={() => removeSimpleItem('tags', i)} className="opacity-60 transition hover:opacity-100">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end">
          <button type="submit" disabled={processing} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl disabled:opacity-60">
            <Save className="h-4 w-4" /> Save Interior Design
            {progress && <span className="text-xs">{progress.percentage}%</span>}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

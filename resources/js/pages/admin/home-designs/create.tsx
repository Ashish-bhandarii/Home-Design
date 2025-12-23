import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    FilePlus,
    Home,
    Image as ImageIcon,
    Layers,
    Plus,
    Save,
    Trash2,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
  styleOptions: Record<string, string>;
  constructionTypeOptions: Record<string, string>;
  facingDirectionOptions: Record<string, string>;
  floorNumberOptions: Record<string, string | number>;
  roomTypeOptions: Record<string, string>;
  ventilationOptions: Record<string, string>;
  fileTypeOptions: Record<string, string>;
}

interface RoomDraft {
  id?: number;
  room_type: string;
  name?: string;
  length?: string | number;
  width?: string | number;
  area_sqft?: string | number;
  has_attached_bathroom?: boolean;
  has_balcony?: boolean;
  has_wardrobe?: boolean;
  windows_count?: number;
  doors_count?: number;
  ventilation?: string;
  facing_direction?: string;
  notes?: string;
}

interface FloorDraft {
  id?: number;
  name: string;
  description?: string;
  floor_number: number;
  width?: string | number;
  length?: string | number;
  floor_area_sqft?: string | number;
  carpet_area_sqft?: string | number;
  bedrooms?: number;
  bathrooms?: number;
  kitchens?: number;
  living_rooms?: number;
  dining_rooms?: number;
  balconies?: number;
  has_stairs?: boolean;
  has_lift?: boolean;
  has_puja_room?: boolean;
  has_store_room?: boolean;
  has_servant_room?: boolean;
  cover_image?: File | null;
  rooms: RoomDraft[];
}

interface FormData {
  name: string;
  description: string;
  style: string;
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
  construction_type: string;
  facing_direction: string;
  estimated_cost_min: string | number;
  estimated_cost_max: string | number;
  features: string[];
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  cover_image: File | null;
  gallery_images: File[];
  design_files: (File | undefined)[];
  design_files_types: string[];
  design_files_titles: (string | null)[];
  floors: FloorDraft[];
}

export default function HomeDesignsCreate({
  styleOptions,
  constructionTypeOptions,
  facingDirectionOptions,
  floorNumberOptions,
  roomTypeOptions,
  ventilationOptions,
  fileTypeOptions,
}: Props) {
  const { data, setData, post, processing, errors, progress, reset } = useForm<FormData>({
    name: '',
    description: '',
    style: '',
    total_floors: 1,
    total_area_sqft: '',
    plot_width: '',
    plot_length: '',
    bedrooms: 0,
    bathrooms: 0,
    kitchens: 1,
    living_rooms: 1,
    dining_rooms: 0,
    balconies: 0,
    garages: 0,
    has_basement: false,
    has_terrace: false,
    has_garden: false,
    has_swimming_pool: false,
    construction_type: '',
    facing_direction: '',
    estimated_cost_min: '',
    estimated_cost_max: '',
    features: [] as string[],
    tags: [] as string[],
    is_featured: false,
    is_active: true,
    cover_image: null as File | null,
    gallery_images: [] as File[],
    design_files: [] as (File | undefined)[],
    design_files_types: [] as string[],
    design_files_titles: [] as (string | null)[],
    floors: [] as FloorDraft[],
  });

  const [featureInput, setFeatureInput] = useState('');
  const [tagInput, setTagInput] = useState('');

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setData('features', [...data.features, featureInput.trim()]);
    setFeatureInput('');
  };
  const removeFeature = (i: number) => {
    setData('features', data.features.filter((_: string, idx: number) => idx !== i));
  };

  const addTag = () => {
    if (!tagInput.trim()) return;
    setData('tags', [...data.tags, tagInput.trim()]);
    setTagInput('');
  };
  const removeTag = (i: number) => {
    setData('tags', data.tags.filter((_: string, idx: number) => idx !== i));
  };

  const addFloor = () => {
    const floorNumber = data.floors.length === 0 ? 0 : data.floors.length; // simple sequence
    const draft: FloorDraft = {
      name: `Floor ${floorNumber}`,
      floor_number: floorNumber,
      description: '',
      width: '',
      length: '',
      floor_area_sqft: '',
      carpet_area_sqft: '',
      bedrooms: 0,
      bathrooms: 0,
      kitchens: 0,
      living_rooms: 0,
      dining_rooms: 0,
      balconies: 0,
      has_stairs: false,
      has_lift: false,
      has_puja_room: false,
      has_store_room: false,
      has_servant_room: false,
      cover_image: null,
      rooms: [],
    };
    setData('floors', [...data.floors, draft]);
  };

  const updateFloor = (index: number, patch: Partial<FloorDraft>) => {
    const floors: FloorDraft[] = [...data.floors];
    floors[index] = { ...floors[index], ...patch };
    setData('floors', floors);
  };

  const removeFloor = (index: number) => {
    const floors = data.floors.filter((_: FloorDraft, i: number) => i !== index);
    setData('floors', floors);
  };

  const addRoom = (floorIndex: number) => {
    const floors: FloorDraft[] = [...data.floors];
    floors[floorIndex].rooms.push({
      room_type: 'bedroom',
      name: '',
      length: '',
      width: '',
      area_sqft: '',
      has_attached_bathroom: false,
      has_balcony: false,
      has_wardrobe: false,
      windows_count: 0,
      doors_count: 1,
      ventilation: '',
      facing_direction: '',
      notes: '',
    });
    setData('floors', floors);
  };

  const updateRoom = (floorIndex: number, roomIndex: number, patch: Partial<RoomDraft>) => {
    const floors: FloorDraft[] = [...data.floors];
    floors[floorIndex].rooms[roomIndex] = {
      ...floors[floorIndex].rooms[roomIndex],
      ...patch,
    };
    setData('floors', floors);
  };

  const removeRoom = (floorIndex: number, roomIndex: number) => {
    const floors = [...data.floors];
    floors[floorIndex].rooms = floors[floorIndex].rooms.filter((_: RoomDraft, i: number) => i !== roomIndex);
    setData('floors', floors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(admin.homeDesigns.store().url, {
      forceFormData: true,
      onSuccess: () => {
        reset();
      },
    });
  };

  // Append a design file
  const addDesignFileInput = () => {
    setData('design_files_types', [...data.design_files_types, 'other']);
    setData('design_files_titles', [...data.design_files_titles, '']);
  };

  const removeDesignFileInput = (index: number) => {
    const fileTypes = data.design_files_types.filter((_: string, i: number) => i !== index);
    const titles = data.design_files_titles.filter((_: string | null, i: number) => i !== index);
    const files = data.design_files.filter((_: File | undefined, i: number) => i !== index);
    setData('design_files_types', fileTypes);
    setData('design_files_titles', titles);
    setData('design_files', files);
  };

  return (
    <AdminLayout>
      <Head title="Create Home Design" />
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={admin.homeDesigns.index().url}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" /> New Home Design
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={processing}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> Save Design
              {progress && (
                <span className="text-xs">{progress.percentage}%</span>
              )}
            </button>
          </div>
        </div>

        {/* Basic Details */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Home className="h-5 w-5 text-indigo-600" /> Basic Information
          </h2>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Name *</label>
              <input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="E.g. Modern 4 BHK Duplex"
                required
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Style</label>
              <select
                value={data.style}
                onChange={(e) => setData('style', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="">Select style</option>
                {Object.entries(styleOptions).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              {errors.style && <p className="mt-1 text-xs text-red-600">{errors.style}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Construction Type</label>
              <select
                value={data.construction_type}
                onChange={(e) => setData('construction_type', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="">Select type</option>
                {Object.entries(constructionTypeOptions).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Facing Direction</label>
              <select
                value={data.facing_direction}
                onChange={(e) => setData('facing_direction', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="">Select facing</option>
                {Object.entries(facingDirectionOptions).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Total Floors *</label>
              <input
                type="number"
                min={1}
                value={data.total_floors}
                onChange={(e) => setData('total_floors', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Total Area (sq.ft)</label>
              <input
                type="number"
                min={0}
                value={data.total_area_sqft}
                onChange={(e) => setData('total_area_sqft', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Plot Width (ft)</label>
              <input
                type="number"
                min={0}
                value={data.plot_width}
                onChange={(e) => setData('plot_width', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Plot Length (ft)</label>
              <input
                type="number"
                min={0}
                value={data.plot_length}
                onChange={(e) => setData('plot_length', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Bedrooms *</label>
              <input
                type="number"
                min={0}
                value={data.bedrooms}
                onChange={(e) => setData('bedrooms', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Bathrooms *</label>
              <input
                type="number"
                min={0}
                value={data.bathrooms}
                onChange={(e) => setData('bathrooms', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Kitchens *</label>
              <input
                type="number"
                min={0}
                value={data.kitchens}
                onChange={(e) => setData('kitchens', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Living Rooms *</label>
              <input
                type="number"
                min={0}
                value={data.living_rooms}
                onChange={(e) => setData('living_rooms', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Dining Rooms</label>
              <input
                type="number"
                min={0}
                value={data.dining_rooms}
                onChange={(e) => setData('dining_rooms', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Balconies</label>
              <input
                type="number"
                min={0}
                value={data.balconies}
                onChange={(e) => setData('balconies', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Garages</label>
              <input
                type="number"
                min={0}
                value={data.garages}
                onChange={(e) => setData('garages', Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="md:col-span-2 xl:col-span-3">
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <textarea
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="Describe the overall concept, layout, aesthetics, and special features."
              />
            </div>
          </div>

          {/* Boolean Flags */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {([
              ['has_basement', 'Basement'],
              ['has_terrace', 'Terrace'],
              ['has_garden', 'Garden'],
              ['has_swimming_pool', 'Swimming Pool'],
              ['is_featured', 'Featured'],
              ['is_active', 'Active'],
            ] as Array<[keyof FormData, string]>).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={data[key] as boolean}
                  onChange={(e) => setData(key, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        {/* Cost & Media */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <ImageIcon className="h-5 w-5 text-indigo-600" /> Media & Costing
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Estimated Cost Min</label>
              <input
                type="number"
                min={0}
                value={data.estimated_cost_min}
                onChange={(e) => setData('estimated_cost_min', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Estimated Cost Max</label>
              <input
                type="number"
                min={0}
                value={data.estimated_cost_max}
                onChange={(e) => setData('estimated_cost_max', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Cover Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setData('cover_image', e.target.files ? e.target.files[0] : null)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700 dark:border-slate-600 dark:bg-slate-700"
              />
              {errors.cover_image && <p className="mt-1 text-xs text-red-600">{errors.cover_image}</p>}
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-sm font-medium">Gallery Images</label>
              <input
                multiple
                type="file"
                accept="image/*"
                onChange={(e) => setData('gallery_images', e.target.files ? Array.from(e.target.files) : [])}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700 dark:border-slate-600 dark:bg-slate-700"
              />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="mb-1.5 block text-sm font-medium">Design Files (2D / 3D / CAD / PDF / Video)</label>
              <div className="space-y-4">
                {data.design_files_types.map((type: string, i: number) => (
                  <div key={i} className="rounded-xl border border-slate-200 p-4 dark:border-slate-600">
                    <div className="grid gap-4 md:grid-cols-4">
                      <div>
                        <label className="mb-1 block text-xs font-medium">File Type</label>
                        <select
                          value={type}
                          onChange={(e) => {
                            const arr = [...data.design_files_types];
                            arr[i] = e.target.value;
                            setData('design_files_types', arr);
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        >
                          {Object.entries(fileTypeOptions).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Title</label>
                        <input
                          value={data.design_files_titles[i] || ''}
                          onChange={(e) => {
                            const arr = [...data.design_files_titles];
                            arr[i] = e.target.value;
                            setData('design_files_titles', arr);
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          placeholder="Optional title"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium">Upload File</label>
                        <input
                          type="file"
                          onChange={(e) => {
                            const arr = [...data.design_files];
                            arr[i] = e.target.files ? e.target.files[0] : undefined;
                            setData('design_files', arr);
                          }}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs file:mr-2 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-indigo-700 dark:border-slate-600 dark:bg-slate-700"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeDesignFileInput(i)}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                      >
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addDesignFileInput}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                >
                  <FilePlus className="h-3 w-3" /> Add File
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features & Tags */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Layers className="h-5 w-5 text-indigo-600" /> Features & Tags
          </h2>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Features</label>
              <div className="flex gap-2">
                <input
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Add feature (Enter)"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >Add</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.features.map((f: string, i: number) => (
                  <span
                    key={i}
                    className="group inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                  >
                    {f}
                    <button
                      type="button"
                      onClick={() => removeFeature(i)}
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
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag (Enter)"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >Add</button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.tags.map((t: string, i: number) => (
                  <span
                    key={i}
                    className="group inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => removeTag(i)}
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

        {/* Floors & Rooms */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
            <Layers className="h-5 w-5 text-indigo-600" /> Floor Plans & Rooms
          </h2>
          <div className="space-y-6">
            {data.floors.map((floor: FloorDraft, fi: number) => (
              <div key={fi} className="rounded-xl border border-slate-200 p-5 dark:border-slate-600">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="grid gap-4 md:grid-cols-5">
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium">Floor Name *</label>
                        <input
                          value={floor.name}
                          onChange={(e) => updateFloor(fi, { name: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Number *</label>
                        <select
                          value={floor.floor_number}
                          onChange={(e) => updateFloor(fi, { floor_number: Number(e.target.value) })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        >
                          {Object.entries(floorNumberOptions).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Width (ft)</label>
                        <input
                          type="number"
                          min={0}
                          value={floor.width || ''}
                          onChange={(e) => updateFloor(fi, { width: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Length (ft)</label>
                        <input
                          type="number"
                          min={0}
                          value={floor.length || ''}
                          onChange={(e) => updateFloor(fi, { length: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Floor Area</label>
                        <input
                          type="number"
                          min={0}
                          value={floor.floor_area_sqft || ''}
                          onChange={(e) => updateFloor(fi, { floor_area_sqft: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Carpet Area</label>
                        <input
                          type="number"
                          min={0}
                          value={floor.carpet_area_sqft || ''}
                          onChange={(e) => updateFloor(fi, { carpet_area_sqft: e.target.value })}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Bedrooms</label>
                        <input
                          type="number"
                          min={0}
                          value={floor.bedrooms || 0}
                          onChange={(e) => updateFloor(fi, { bedrooms: Number(e.target.value) })}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Bathrooms</label>
                        <input
                          type="number"
                          min={0}
                          value={floor.bathrooms || 0}
                          onChange={(e) => updateFloor(fi, { bathrooms: Number(e.target.value) })}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Kitchens</label>
                        <input
                          type="number"
                          min={0}
                          value={floor.kitchens || 0}
                          onChange={(e) => updateFloor(fi, { kitchens: Number(e.target.value) })}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Living Rooms</label>
                        <input
                          type="number"
                          min={0}
                          value={floor.living_rooms || 0}
                          onChange={(e) => updateFloor(fi, { living_rooms: Number(e.target.value) })}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Dining Rooms</label>
                        <input
                          type="number"
                          min={0}
                          value={floor.dining_rooms || 0}
                          onChange={(e) => updateFloor(fi, { dining_rooms: Number(e.target.value) })}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium">Balconies</label>
                        <input
                          type="number"
                          min={0}
                          value={floor.balconies || 0}
                          onChange={(e) => updateFloor(fi, { balconies: Number(e.target.value) })}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium">Description</label>
                        <textarea
                          value={floor.description || ''}
                          onChange={(e) => updateFloor(fi, { description: e.target.value })}
                          rows={3}
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                          placeholder="Brief notes for this floor"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1 block text-xs font-medium">Cover Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => updateFloor(fi, { cover_image: e.target.files ? e.target.files[0] : null })}
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs file:mr-2 file:rounded-md file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-indigo-700 dark:border-slate-600 dark:bg-slate-700"
                        />
                      </div>
                      <div className="flex flex-wrap gap-4 md:col-span-5">
                        {[
                          ['has_stairs', 'Stairs'],
                          ['has_lift', 'Lift'],
                          ['has_puja_room', 'Puja Room'],
                          ['has_store_room', 'Store Room'],
                          ['has_servant_room', 'Servant Room'],
                        ].map(([k, label]) => (
                          <label key={k} className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={floor[k as keyof FloorDraft] as boolean || false}
                              onChange={(e) => updateFloor(fi, { [k]: e.target.checked } as any)}
                              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            {label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => removeFloor(fi)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                    >
                      <Trash2 className="h-3 w-3" /> Remove Floor
                    </button>
                    <button
                      type="button"
                      onClick={() => addRoom(fi)}
                      className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50"
                    >
                      <Plus className="h-3 w-3" /> Add Room
                    </button>
                  </div>
                </div>
                {/* Rooms */}
                {floor.rooms.length > 0 && (
                  <div className="mt-5 space-y-4">
                    {floor.rooms.map((room: RoomDraft, ri: number) => (
                      <div key={ri} className="rounded-lg border border-slate-200 p-4 dark:border-slate-600">
                        <div className="grid gap-3 md:grid-cols-6">
                          <div>
                            <label className="mb-1 block text-[10px] font-medium">Type</label>
                            <select
                              value={room.room_type}
                              onChange={(e) => updateRoom(fi, ri, { room_type: e.target.value })}
                              className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                              {Object.entries(roomTypeOptions).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium">Name</label>
                            <input
                              value={room.name || ''}
                              onChange={(e) => updateRoom(fi, ri, { name: e.target.value })}
                              className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                              placeholder="Master Bedroom"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium">Length (ft)</label>
                            <input
                              type="number"
                              min={0}
                              value={room.length || ''}
                              onChange={(e) => updateRoom(fi, ri, { length: e.target.value })}
                              className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium">Width (ft)</label>
                            <input
                              type="number"
                              min={0}
                              value={room.width || ''}
                              onChange={(e) => updateRoom(fi, ri, { width: e.target.value })}
                              className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium">Area (sq.ft)</label>
                            <input
                              type="number"
                              min={0}
                              value={room.area_sqft || ''}
                              onChange={(e) => updateRoom(fi, ri, { area_sqft: e.target.value })}
                              className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                          </div>
                          <div className="flex items-start justify-end">
                            <button
                              type="button"
                              onClick={() => removeRoom(fi, ri)}
                              className="mt-5 inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                            >
                              <Trash2 className="h-3 w-3" /> Remove
                            </button>
                          </div>
                          <div className="md:col-span-6 grid grid-cols-2 gap-3">
                            {[
                              ['has_attached_bathroom', 'Attached Bath'],
                              ['has_balcony', 'Balcony'],
                              ['has_wardrobe', 'Wardrobe'],
                            ].map(([k, label]) => (
                              <label key={k} className="flex items-center gap-2 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={(room[k as keyof RoomDraft] as boolean) || false}
                                  onChange={(e) => updateRoom(fi, ri, { [k]: e.target.checked } as any)}
                                  className="h-3 w-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                {label}
                              </label>
                            ))}
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium">Windows</label>
                            <input
                              type="number"
                              min={0}
                              value={room.windows_count || 0}
                              onChange={(e) => updateRoom(fi, ri, { windows_count: Number(e.target.value) })}
                              className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium">Doors</label>
                            <input
                              type="number"
                              min={0}
                              value={room.doors_count || 1}
                              onChange={(e) => updateRoom(fi, ri, { doors_count: Number(e.target.value) })}
                              className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium">Ventilation</label>
                            <select
                              value={room.ventilation || ''}
                              onChange={(e) => updateRoom(fi, ri, { ventilation: e.target.value })}
                              className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                              <option value="">Select</option>
                              {Object.entries(ventilationOptions).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="mb-1 block text-[10px] font-medium">Facing</label>
                            <select
                              value={room.facing_direction || ''}
                              onChange={(e) => updateRoom(fi, ri, { facing_direction: e.target.value })}
                              className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                              <option value="">Select</option>
                              {Object.entries(facingDirectionOptions).map(([val, label]) => (
                                <option key={val} value={val}>{label}</option>
                              ))}
                            </select>
                          </div>
                          <div className="md:col-span-6">
                            <label className="mb-1 block text-[10px] font-medium">Notes</label>
                            <textarea
                              rows={2}
                              value={room.notes || ''}
                              onChange={(e) => updateRoom(fi, ri, { notes: e.target.value })}
                              className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                              placeholder="Additional details for this room"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addFloor}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> Add Floor
            </button>
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={processing}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:shadow-xl disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> Save Home Design
            {progress && <span className="text-xs">{progress.percentage}%</span>}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}

import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Edit, Eye, Filter, MoreVertical, Palette, Plus, Search, Trash2, X } from 'lucide-react';
import { useState } from 'react';

interface InteriorDesign {
  id: number;
  name: string;
  description: string | null;
  room_type: string;
  style: string | null;
  area_sqft: string | null;
  cover_image: string | null;
  is_featured: boolean;
  is_active: boolean;
  views: number;
  downloads: number;
  created_at: string;
}

interface PaginatedData {
  data: InteriorDesign[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
  designs: PaginatedData;
  filters: {
    room_type?: string;
    style?: string;
    status?: string;
    search?: string;
  };
  roomTypeOptions: Record<string, string>;
  styleOptions: Record<string, string>;
}

export default function InteriorDesignsIndex({ designs, filters, roomTypeOptions, styleOptions }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState(filters.room_type || '');
  const [selectedStyle, setSelectedStyle] = useState(filters.style || '');
  const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    router.get('/admin/interior-designs', {
      search: search || undefined,
      room_type: selectedRoomType || undefined,
      style: selectedStyle || undefined,
      status: selectedStatus || undefined,
    }, { preserveState: true, preserveScroll: true });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedRoomType('');
    setSelectedStyle('');
    setSelectedStatus('');
    router.get('/admin/interior-designs');
  };

  const toggleFeatured = (id: number) => {
    router.post(`/admin/interior-designs/${id}/toggle-featured`, {}, { preserveScroll: true });
  };

  const toggleActive = (id: number) => {
    router.post(`/admin/interior-designs/${id}/toggle-active`, {}, { preserveScroll: true });
  };

  const deleteDesign = (id: number) => {
    if (confirm('Delete this interior design?')) {
      router.delete(`/admin/interior-designs/${id}`, { preserveScroll: true });
    }
  };

  return (
    <AdminLayout>
      <Head title="Interior Designs" />
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Interior Designs</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Manage room/space interior concepts</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Showing <span className="font-medium text-slate-900 dark:text-white">{designs.data.length}</span> / <span className="font-medium text-slate-900 dark:text-white">{designs.total}</span> designs</p>
          </div>
          <Link href="/admin/interior-designs/create" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl hover:shadow-indigo-500/40">
            <Plus className="h-4 w-4" /> Add New Interior
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search interior designs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-indigo-500"
                />
              </div>
            </form>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                showFilters ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              <Filter className="h-4 w-4" /> Filters
              {(selectedRoomType || selectedStyle || selectedStatus) && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-xs text-white">
                  {[selectedRoomType, selectedStyle, selectedStatus].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 dark:border-slate-700 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Room Type</label>
                <select value={selectedRoomType} onChange={(e) => setSelectedRoomType(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                  <option value="">All</option>
                  {Object.entries(roomTypeOptions).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Style</label>
                <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                  <option value="">All Styles</option>
                  {Object.entries(styleOptions).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white">
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button onClick={applyFilters} className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">Apply</button>
                <button onClick={clearFilters} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {designs.data.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {designs.data.map((design) => (
              <div key={design.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-700">
                  {design.cover_image ? (
                    <img src={`/storage/${design.cover_image}`} alt={design.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Palette className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <div className="relative">
                      <button onClick={() => setDropdownOpen(dropdownOpen === design.id ? null : design.id)} className="rounded-lg bg-white/90 p-2 text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white dark:bg-slate-800/90 dark:text-slate-300">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {dropdownOpen === design.id && (
                        <div className="absolute right-0 mt-1 w-48 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                          <Link href={`/admin/interior-designs/${design.id}/edit`} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                            <Edit className="h-4 w-4" /> Edit
                          </Link>
                          <button onClick={() => toggleFeatured(design.id)} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                            <Eye className="h-4 w-4" /> {design.is_featured ? 'Remove Featured' : 'Mark Featured'}
                          </button>
                          <button onClick={() => toggleActive(design.id)} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                            <Eye className="h-4 w-4" /> {design.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <hr className="my-1 border-slate-200 dark:border-slate-700" />
                          <button onClick={() => deleteDesign(design.id)} className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{design.name}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {roomTypeOptions[design.room_type] || design.room_type}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {design.style && (
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {styleOptions[design.style] || design.style}
                      </span>
                    )}
                    {design.area_sqft && (
                      <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {parseFloat(design.area_sqft).toLocaleString()} sq.ft
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-800">
            <Palette className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">No interior designs found</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Create your first interior design.</p>
            <Link href="/admin/interior-designs/create" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" /> Create Interior
            </Link>
          </div>
        )}

        {designs.last_page > 1 && (
          <div className="flex items-center justify-center gap-2">
            {designs.links.map((link, index) => (
              <Link
                key={index}
                href={link.url || '#'}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  link.active ? 'bg-indigo-600 text-white' : link.url ? 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300' : 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-700'
                }`}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

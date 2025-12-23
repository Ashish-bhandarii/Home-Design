import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';
import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Edit,
    Mail,
    Search,
    Shield,
    ShieldAlert,
    Trash2,
    User as UserIcon
} from 'lucide-react';
import { useState } from 'react';

type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at?: string;
  role?: string; // Assuming role might be available or added later
};

type Paginated<T> = {
  data: T[];
  links: { url: string | null; label: string; active: boolean }[];
  current_page: number;
  last_page: number;
  from: number;
  to: number;
  total: number;
};

interface Props {
  users: Paginated<User>;
  filters: { search?: string };
}

export default function AdminUsersIndex({ users, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(admin.users.index({ query: { search } }), {}, { preserveState: true });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      router.delete(admin.users.destroy({ user: id }));
    }
  };

  return (
    <AdminLayout>
      <Head title="Users Management" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 dark:text-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
                <UserIcon className="h-6 w-6" />
              </div>
              Users Management
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage registered users, roles, and account status.
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/20 dark:bg-indigo-600 dark:hover:bg-indigo-700"
            >
              Search
            </button>
          </form>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 dark:bg-slate-700/50 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users.data.length > 0 ? (
                  users.data.map((user) => (
                    <tr key={user.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 dark:from-slate-700 dark:to-slate-600 dark:text-slate-300">
                            <span className="font-semibold">{user.name.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.email_verified_at ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          <Shield className="h-3.5 w-3.5" />
                          {user.role || 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={admin.users.edit({ user: user.id })}
                            className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">No users found</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Try adjusting your search terms.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {users.data.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing <span className="font-medium text-slate-900 dark:text-white">{users.from}</span> to{' '}
                <span className="font-medium text-slate-900 dark:text-white">{users.to}</span> of{' '}
                <span className="font-medium text-slate-900 dark:text-white">{users.total}</span> results
              </div>
              <div className="flex gap-2">
                {users.links.map((link, i) => {
                  // Simple pagination logic for prev/next buttons vs numbers
                  if (link.label.includes('&laquo;')) {
                    return (
                      <Link
                        key={i}
                        href={link.url || '#'}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 ${!link.url && 'pointer-events-none opacity-50'}`}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Link>
                    );
                  }
                  if (link.label.includes('&raquo;')) {
                    return (
                      <Link
                        key={i}
                        href={link.url || '#'}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 ${!link.url && 'pointer-events-none opacity-50'}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    );
                  }
                  // Number links
                  return (
                    <Link
                      key={i}
                      href={link.url || '#'}
                      className={`hidden h-8 min-w-[2rem] items-center justify-center rounded-lg px-3 text-sm font-medium transition md:inline-flex ${
                        link.active
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}


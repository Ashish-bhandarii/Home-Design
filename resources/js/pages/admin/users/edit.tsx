import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, User } from 'lucide-react';

interface Props {
  user: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
}

export default function AdminUsersEdit({ user }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: user.name,
    email: user.email,
    role: user.role || 'user',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/users/${user.id}`);
  };

  return (
    <AdminLayout>
      <Head title={`Edit User - ${user.name}`} />
      
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/users"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Edit User
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Update user profile information
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="john@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Role
              </label>
              <select
                value={data.role}
                onChange={(e) => setData('role', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-700">
              <Link
                href="/admin/users"
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={processing}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 disabled:opacity-70"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

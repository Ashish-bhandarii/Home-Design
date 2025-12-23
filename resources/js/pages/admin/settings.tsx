import AdminLayout from '@/layouts/admin-layout';
import admin from '@/routes/admin';
import { Head, useForm } from '@inertiajs/react';
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Save, Twitter } from 'lucide-react';
import { FormEvent } from 'react';

interface SettingsProps {
    settings: {
        contact_email: string;
        contact_phone: string;
        contact_address: string;
        facebook_url: string;
        twitter_url: string;
        instagram_url: string;
        linkedin_url: string;
        about_text: string;
    };
}

export default function AdminSettings({ settings }: SettingsProps) {
    const { data, setData, post, processing, recentlySuccessful } = useForm({
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings.contact_address || '',
        facebook_url: settings.facebook_url || '',
        twitter_url: settings.twitter_url || '',
        instagram_url: settings.instagram_url || '',
        linkedin_url: settings.linkedin_url || '',
        about_text: settings.about_text || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(admin.settings().url);
    };

    return (
        <AdminLayout breadcrumbs={[{ title: 'Dashboard', href: admin.dashboard() }, { title: 'Settings', href: admin.settings() }]}>
            <Head title="Admin Settings" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Site Settings
                        </h1>
                        <p className="mt-1 text-slate-600 dark:text-slate-400">
                            Manage contact information and social links displayed in the footer
                        </p>
                    </div>
                </div>

                    {recentlySuccessful && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400">
                        ✓ Settings saved successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact Information */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                            <Mail className="h-5 w-5 text-indigo-500" />
                            Contact Information
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={data.contact_email}
                                        onChange={(e) => setData('contact_email', e.target.value)}
                                        placeholder="contact@homedesign.com"
                                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={data.contact_phone}
                                        onChange={(e) => setData('contact_phone', e.target.value)}
                                        placeholder="+1 (555) 123-4567"
                                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                    Address
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                                    <textarea
                                        value={data.contact_address}
                                        onChange={(e) => setData('contact_address', e.target.value)}
                                        placeholder="123 Design Street, Creative City, ST 12345"
                                        rows={2}
                                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-6 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                            <Twitter className="h-5 w-5 text-indigo-500" />
                            Social Media Links
                        </h2>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                    Facebook
                                </label>
                                <div className="relative">
                                    <Facebook className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="url"
                                        value={data.facebook_url}
                                        onChange={(e) => setData('facebook_url', e.target.value)}
                                        placeholder="https://facebook.com/homedesign"
                                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                    Twitter / X
                                </label>
                                <div className="relative">
                                    <Twitter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="url"
                                        value={data.twitter_url}
                                        onChange={(e) => setData('twitter_url', e.target.value)}
                                        placeholder="https://twitter.com/homedesign"
                                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                    Instagram
                                </label>
                                <div className="relative">
                                    <Instagram className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="url"
                                        value={data.instagram_url}
                                        onChange={(e) => setData('instagram_url', e.target.value)}
                                        placeholder="https://instagram.com/homedesign"
                                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                    LinkedIn
                                </label>
                                <div className="relative">
                                    <Linkedin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="url"
                                        value={data.linkedin_url}
                                        onChange={(e) => setData('linkedin_url', e.target.value)}
                                        placeholder="https://linkedin.com/company/homedesign"
                                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                        <h2 className="mb-6 text-lg font-semibold text-slate-900 dark:text-white">
                            About Text
                        </h2>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-900 dark:text-white">
                                Footer Description
                            </label>
                            <textarea
                                value={data.about_text}
                                onChange={(e) => setData('about_text', e.target.value)}
                                placeholder="A brief description of your company that will appear in the footer..."
                                rows={4}
                                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-xl disabled:opacity-50"
                        >
                            <Save className="h-5 w-5" />
                            {processing ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}

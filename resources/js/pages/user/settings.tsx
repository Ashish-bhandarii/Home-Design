import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Bell, Lock, Mail, MapPin, Palette, Phone, User } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '/settings' },
];

export default function Settings() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Settings" />
            
            <div className="min-h-screen bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
                <div className="mx-auto max-w-4xl px-6 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                            Settings
                        </h1>
                        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                            Manage your account preferences and settings
                        </p>
                    </div>

                    {/* Settings Sections */}
                    <div className="space-y-6">
                        {/* Account Settings */}
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-950/40">
                                    <User className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                                        Account Information
                                    </h2>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Update your personal details
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue="John"
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue="Doe"
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                        <Mail className="inline h-4 w-4 mr-2" />
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        defaultValue="john@example.com"
                                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                            <Phone className="inline h-4 w-4 mr-2" />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            defaultValue="+1 (555) 000-0000"
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                            <MapPin className="inline h-4 w-4 mr-2" />
                                            Location
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue="New York, USA"
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                <button className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 transition-colors">
                                    Save Changes
                                </button>
                            </div>
                        </div>

                        {/* Security Settings */}
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-red-100 p-3 dark:bg-red-950/40">
                                    <Lock className="h-6 w-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                                        Security
                                    </h2>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Manage your password and security settings
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                        Current Password
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Enter current password"
                                        className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Enter new password"
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            placeholder="Confirm new password"
                                            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        />
                                    </div>
                                </div>

                                <button className="w-full rounded-lg bg-red-500 py-3 font-semibold text-white hover:bg-red-600 transition-colors">
                                    Change Password
                                </button>
                            </div>
                        </div>

                        {/* Notification Settings */}
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-950/40">
                                    <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                                        Notifications
                                    </h2>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Control your notification preferences
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { title: 'Email Notifications', desc: 'Receive email updates' },
                                    { title: 'Project Sharing', desc: 'Notify when someone shares a project' },
                                    { title: 'Design Tips', desc: 'Receive design tips and updates' },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between rounded-lg p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                        <div>
                                            <p className="font-medium text-zinc-900 dark:text-white">{item.title}</p>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{item.desc}</p>
                                        </div>
                                        <input type="checkbox" defaultChecked className="rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Theme Settings */}
                        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-950/40">
                                    <Palette className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                                        Appearance
                                    </h2>
                                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                        Customize your interface appearance
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-3">
                                        Theme
                                    </label>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {['Light', 'Dark', 'Auto'].map((theme) => (
                                            <label key={theme} className="flex items-center gap-3 rounded-lg border-2 border-zinc-200 p-3 cursor-pointer hover:border-orange-300 dark:border-zinc-700 dark:hover:border-orange-600">
                                                <input type="radio" name="theme" defaultChecked={theme === 'Auto'} className="rounded-full" />
                                                <span className="font-medium text-zinc-900 dark:text-white">{theme}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

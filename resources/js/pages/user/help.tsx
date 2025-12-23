import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { FileText, HelpCircle, Mail, MessageSquare, Phone } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Help & Support', href: '/help' },
];

const faqs = [
    {
        q: 'How do I create a new project?',
        a: 'Click on the "New Project" button from your dashboard or sidebar. Choose from Floor Plans, Home Design, or Interior Design to get started.',
    },
    {
        q: 'Can I download my projects?',
        a: 'Yes! Go to My Projects, click the download icon next to any project, and select your preferred format (PDF, PNG, or SVG).',
    },
    {
        q: 'How do I share my designs with others?',
        a: 'Click the share button on any project. You can generate a shareable link or invite specific users by email.',
    },
    {
        q: 'What file formats are supported?',
        a: 'We support JPG, PNG, PDF, SVG, and DWG formats for import and export.',
    },
    {
        q: 'How do I delete a project?',
        a: 'Go to My Projects, select the project, and click the trash icon. Deleted projects can be recovered within 30 days.',
    },
    {
        q: 'Is there a limit to project size?',
        a: 'Free accounts have a 100MB limit per project. Premium users get up to 1GB per project.',
    },
];

const supportChannels = [
    {
        icon: Mail,
        title: 'Email Support',
        desc: 'We typically respond within 24 hours',
        contact: 'support@homedesign.com',
    },
    {
        icon: MessageSquare,
        title: 'Live Chat',
        desc: 'Chat with our support team in real-time',
        contact: 'Start a chat',
    },
    {
        icon: Phone,
        title: 'Phone Support',
        desc: 'Available Mon-Fri, 9AM-6PM EST',
        contact: '+1 (555) 123-4567',
    },
];

export default function Help() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Help & Support" />
            
            <div className="min-h-screen bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
                <div className="mx-auto max-w-4xl px-6 py-8">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                            Help & Support
                        </h1>
                        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                            Find answers to your questions or get in touch with our team
                        </p>
                    </div>

                    {/* Support Channels */}
                    <div className="mb-12 grid gap-6 sm:grid-cols-3">
                        {supportChannels.map((channel) => {
                            const Icon = channel.icon;
                            return (
                                <div
                                    key={channel.title}
                                    className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/50"
                                >
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/40">
                                        <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                                        {channel.title}
                                    </h3>
                                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                                        {channel.desc}
                                    </p>
                                    <p className="mt-3 font-medium text-orange-600 dark:text-orange-400">
                                        {channel.contact}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* FAQs */}
                    <div className="mb-8">
                        <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-zinc-900 dark:text-white">
                            <FileText className="h-6 w-6 text-orange-600" />
                            Frequently Asked Questions
                        </h2>

                        <div className="space-y-4">
                            {faqs.map((faq, idx) => (
                                <details
                                    key={idx}
                                    className="group rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50"
                                >
                                    <summary className="flex cursor-pointer items-center justify-between px-6 py-4 font-medium text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                                        <span className="flex items-center gap-3">
                                            <HelpCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                            {faq.q}
                                        </span>
                                        <span className="text-xl group-open:rotate-180 transition-transform">
                                            ›
                                        </span>
                                    </summary>
                                    <div className="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800">
                                        <p className="text-zinc-600 dark:text-zinc-400">
                                            {faq.a}
                                        </p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                        <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">
                            Didn't find what you're looking for?
                        </h2>

                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="your@email.com"
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    placeholder="How can we help?"
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
                                    Message
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder="Tell us more about your issue..."
                                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-lg bg-orange-500 py-3 font-semibold text-white hover:bg-orange-600 transition-colors"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

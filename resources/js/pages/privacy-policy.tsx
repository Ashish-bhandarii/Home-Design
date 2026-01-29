import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <>
            <Head title="Privacy Policy - Home Design" />
            
            <div className="min-h-screen bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
                {/* Header */}
                <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 sticky top-0 z-50">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 shadow-lg flex items-center justify-center text-white font-bold">HD</div>
                            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Home Design</span>
                        </Link>
                        <Link href="/" className="flex items-center gap-2 text-sm text-zinc-600 hover:text-orange-600 dark:text-zinc-400 dark:hover:text-orange-400">
                            <ArrowLeft className="h-4 w-4" /> Back to Home
                        </Link>
                    </div>
                </header>

                <div className="mx-auto max-w-4xl px-6 py-12">
                    {/* Header */}
                    <div className="mb-12 text-center">
                        <div className="mb-6 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-pink-600 shadow-lg">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">Privacy Policy</h1>
                        <p className="text-zinc-600 dark:text-zinc-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 space-y-8">
                            
                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">1. Introduction</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Welcome to Home Design. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">2. Information We Collect</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">We collect information you provide directly to us, including:</p>
                                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-2">
                                    <li>Account information (name, email address, password)</li>
                                    <li>Profile information (avatar, preferences)</li>
                                    <li>Project data (floor plans, designs, settings)</li>
                                    <li>Communication data (support requests, feedback)</li>
                                    <li>Payment information (processed securely by our payment providers)</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">3. How We Use Your Information</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">We use the information we collect to:</p>
                                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-2">
                                    <li>Provide, maintain, and improve our services</li>
                                    <li>Process transactions and send related information</li>
                                    <li>Send technical notices, updates, and support messages</li>
                                    <li>Respond to your comments, questions, and requests</li>
                                    <li>Personalize and improve your experience</li>
                                    <li>Monitor and analyze trends, usage, and activities</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">4. Information Sharing</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                                </p>
                                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-2 mt-4">
                                    <li>With your consent or at your direction</li>
                                    <li>With service providers who assist in our operations</li>
                                    <li>To comply with legal obligations</li>
                                    <li>To protect rights, privacy, safety, or property</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">5. Data Security</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security assessments.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">6. Your Rights</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">You have the right to:</p>
                                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-2">
                                    <li>Access your personal data</li>
                                    <li>Correct inaccurate data</li>
                                    <li>Request deletion of your data</li>
                                    <li>Object to processing of your data</li>
                                    <li>Export your data in a portable format</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">7. Cookies</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    We use cookies and similar tracking technologies to enhance your experience, analyze usage, and assist in our marketing efforts. You can control cookie preferences through your browser settings.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">8. Changes to This Policy</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">9. Contact Us</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    If you have any questions about this Privacy Policy, please contact us at:
                                </p>
                                <div className="mt-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                                    <p className="text-zinc-700 dark:text-zinc-300">Email: <a href="mailto:privacy@homedesign.com" className="text-orange-600 hover:underline">privacy@homedesign.com</a></p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mx-auto max-w-7xl px-6 text-center">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            © {new Date().getFullYear()} Home Design. All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

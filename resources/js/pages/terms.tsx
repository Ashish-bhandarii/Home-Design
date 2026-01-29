import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, FileText } from 'lucide-react';

export default function Terms() {
    return (
        <>
            <Head title="Terms of Service - Home Design" />
            
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
                            <FileText className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">Terms of Service</h1>
                        <p className="text-zinc-600 dark:text-zinc-400">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 space-y-8">
                            
                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">1. Acceptance of Terms</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    By accessing or using Home Design's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">2. Description of Service</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Home Design provides an online platform for creating floor plans, interior designs, and home visualizations. Our services include design tools, a furniture library, project storage, and export capabilities.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">3. User Accounts</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">To use our services, you must:</p>
                                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-2">
                                    <li>Be at least 18 years old or have parental consent</li>
                                    <li>Provide accurate and complete registration information</li>
                                    <li>Maintain the security of your account credentials</li>
                                    <li>Notify us immediately of any unauthorized access</li>
                                    <li>Accept responsibility for all activities under your account</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">4. User Content</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    You retain ownership of all designs, floor plans, and other content you create using our platform. By using our services, you grant us a license to store, display, and process your content as necessary to provide our services.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">5. Acceptable Use</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">You agree not to:</p>
                                <ul className="list-disc list-inside text-zinc-600 dark:text-zinc-400 space-y-2">
                                    <li>Use the service for any illegal purpose</li>
                                    <li>Violate any intellectual property rights</li>
                                    <li>Transmit malware or harmful code</li>
                                    <li>Attempt to gain unauthorized access to our systems</li>
                                    <li>Interfere with the proper working of the service</li>
                                    <li>Impersonate any person or entity</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">6. Intellectual Property</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    The Home Design platform, including its design, features, and content (excluding user-generated content), is owned by us and protected by intellectual property laws. Our furniture library, templates, and design assets are licensed for use within the platform.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">7. Payment Terms</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Certain features may require payment. All prices are displayed in the applicable currency and are subject to change. Payments are processed securely through our third-party payment providers. Refunds are handled according to our refund policy.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">8. Disclaimer of Warranties</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    Our services are provided "as is" without warranties of any kind. We do not guarantee that the service will be uninterrupted, secure, or error-free. Designs created using our platform should be reviewed by qualified professionals before construction.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">9. Limitation of Liability</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    To the maximum extent permitted by law, Home Design shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">10. Termination</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    We may terminate or suspend your account at any time for violations of these terms. You may also terminate your account at any time. Upon termination, your right to use the service will immediately cease.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">11. Changes to Terms</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    We reserve the right to modify these terms at any time. We will notify users of significant changes via email or through the platform. Continued use of the service after changes constitutes acceptance of the new terms.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">12. Governing Law</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Home Design operates, without regard to its conflict of law provisions.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">13. Contact Information</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    For questions about these Terms of Service, please contact us at:
                                </p>
                                <div className="mt-4 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                                    <p className="text-zinc-700 dark:text-zinc-300">Email: <a href="mailto:legal@homedesign.com" className="text-orange-600 hover:underline">legal@homedesign.com</a></p>
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

import type { SharedData, SiteSettings } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Award, Building2, Facebook, Heart, Home, Instagram, Lightbulb, Linkedin, Mail, MapPin, Phone, Target, Twitter, Users } from 'lucide-react';

export default function About() {
    const { siteSettings } = usePage<SharedData>().props;
    const settings: SiteSettings = siteSettings || {};

    const socialLinks = [
        { href: settings.facebook_url, label: 'Facebook', icon: Facebook },
        { href: settings.twitter_url, label: 'Twitter / X', icon: Twitter },
        { href: settings.instagram_url, label: 'Instagram', icon: Instagram },
        { href: settings.linkedin_url, label: 'LinkedIn', icon: Linkedin },
    ].filter((s) => !!s.href);

    const hasContactInfo = settings.contact_email || settings.contact_phone || settings.contact_address;

    return (
        <>
            <Head title="About Us - Home Design" />
            
            <div className="min-h-screen bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900">
                {/* Header */}
                <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/80 sticky top-0 z-50">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 shadow-lg flex items-center justify-center text-white font-bold">HD</div>
                            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Home Design</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
                                Sign In
                            </Link>
                            <Link href="/register" className="rounded-lg bg-gradient-to-r from-orange-500 to-pink-600 px-4 py-2 text-sm font-medium text-white shadow-lg hover:shadow-xl transition-shadow">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-transparent dark:from-orange-950/20" />
                    <div className="relative mx-auto max-w-7xl px-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6">
                            Designing Dreams, <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">Building Futures</span>
                        </h1>
                        <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            Home Design is your all-in-one platform for creating stunning floor plans, interior designs, and home visualizations. We empower homeowners, architects, and designers to bring their visions to life.
                        </p>
                    </div>
                </section>

                {/* Mission & Vision */}
                <section className="py-16">
                    <div className="mx-auto max-w-7xl px-6">
                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 shadow-lg">
                                    <Target className="h-7 w-7 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Our Mission</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    To democratize home design by providing powerful, intuitive tools that enable anyone to visualize and plan their perfect living spaces. We believe everyone deserves access to professional-grade design capabilities.
                                </p>
                            </div>
                            <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                                    <Lightbulb className="h-7 w-7 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-4">Our Vision</h2>
                                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                    To become the world's leading platform for home design and visualization, where creativity meets technology to transform how people imagine, plan, and create their living spaces.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What We Offer */}
                <section className="py-16 bg-zinc-50 dark:bg-zinc-900/50">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-12">What We Offer</h2>
                        <div className="grid gap-8 md:grid-cols-3">
                            {[
                                {
                                    icon: Building2,
                                    title: 'Floor Plan Designer',
                                    description: 'Create detailed floor plans with smart room layouts, accurate measurements, and professional export options.'
                                },
                                {
                                    icon: Home,
                                    title: 'Interior Design Studio',
                                    description: 'Design beautiful interiors with our 2D/3D visualization tools, furniture library, and material customization.'
                                },
                                {
                                    icon: Heart,
                                    title: 'Design Inspiration',
                                    description: 'Browse our curated gallery of home designs, save favorites, and get inspired by trending styles.'
                                }
                            ].map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={feature.title} className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow dark:border-zinc-800 dark:bg-zinc-900">
                                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/40">
                                            <Icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">{feature.title}</h3>
                                        <p className="text-zinc-600 dark:text-zinc-400">{feature.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-16">
                    <div className="mx-auto max-w-7xl px-6">
                        <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-12">Our Values</h2>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                { icon: Users, title: 'User-Centric', desc: 'Every feature is designed with our users in mind' },
                                { icon: Award, title: 'Quality', desc: 'We maintain the highest standards in everything we do' },
                                { icon: Lightbulb, title: 'Innovation', desc: 'Constantly pushing boundaries in design technology' },
                                { icon: Heart, title: 'Passion', desc: 'We love what we do and it shows in our work' }
                            ].map((value) => {
                                const Icon = value.icon;
                                return (
                                    <div key={value.title} className="text-center p-6">
                                        <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-950/40 dark:to-pink-950/40">
                                            <Icon className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">{value.title}</h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{value.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Contact Us */}
                {hasContactInfo && (
                    <section className="py-16 bg-zinc-50 dark:bg-zinc-900/50">
                        <div className="mx-auto max-w-7xl px-6">
                            <h2 className="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-4">Get In Touch</h2>
                            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto">
                                Have questions or want to learn more about Home Design? We'd love to hear from you.
                            </p>
                            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
                                {settings.contact_email && (
                                    <a 
                                        href={`mailto:${settings.contact_email}`}
                                        className="flex flex-col items-center p-6 rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-lg transition-shadow dark:border-zinc-800 dark:bg-zinc-900 group"
                                    >
                                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-950/40 dark:to-pink-950/40 group-hover:from-orange-500 group-hover:to-pink-600 transition-all">
                                            <Mail className="h-6 w-6 text-orange-600 dark:text-orange-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Email Us</h3>
                                        <p className="text-sm text-orange-600 dark:text-orange-400 hover:underline">{settings.contact_email}</p>
                                    </a>
                                )}
                                {settings.contact_phone && (
                                    <a 
                                        href={`tel:${settings.contact_phone}`}
                                        className="flex flex-col items-center p-6 rounded-xl border border-zinc-200 bg-white shadow-sm hover:shadow-lg transition-shadow dark:border-zinc-800 dark:bg-zinc-900 group"
                                    >
                                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-950/40 dark:to-pink-950/40 group-hover:from-orange-500 group-hover:to-pink-600 transition-all">
                                            <Phone className="h-6 w-6 text-orange-600 dark:text-orange-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Call Us</h3>
                                        <p className="text-sm text-orange-600 dark:text-orange-400 hover:underline">{settings.contact_phone}</p>
                                    </a>
                                )}
                                {settings.contact_address && (
                                    <div className="flex flex-col items-center p-6 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-950/40 dark:to-pink-950/40">
                                            <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">Visit Us</h3>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">{settings.contact_address}</p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Social Links */}
                            {socialLinks.length > 0 && (
                                <div className="mt-10 text-center">
                                    <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">Follow Us</h3>
                                    <div className="flex justify-center gap-4">
                                        {socialLinks.map(({ href, label, icon: Icon }) => (
                                            <a
                                                key={href}
                                                href={href}
                                                aria-label={label}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group rounded-xl bg-white border border-zinc-200 p-3 text-zinc-600 transition hover:bg-gradient-to-br hover:from-orange-500 hover:to-pink-600 hover:text-white hover:border-transparent hover:shadow-lg dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                                            >
                                                <Icon className="h-6 w-6" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="py-20 bg-gradient-to-r from-orange-500 to-pink-600">
                    <div className="mx-auto max-w-4xl px-6 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Ready to Design Your Dream Home?</h2>
                        <p className="text-orange-100 mb-8 text-lg">Join thousands of users who are creating beautiful spaces with Home Design.</p>
                        <Link 
                            href="/register" 
                            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-orange-600 shadow-lg hover:shadow-xl transition-shadow"
                        >
                            Get Started Free <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </section>

                {/* Footer */}
                <footer className="border-t border-zinc-200 bg-white py-8 dark:border-zinc-800 dark:bg-zinc-900">
                    <div className="mx-auto max-w-7xl px-6 text-center">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            © {new Date().getFullYear()} Home Design. All rights reserved.
                        </p>
                        <div className="mt-4 flex justify-center gap-6">
                            <Link href="/privacy-policy" className="text-sm text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400">Privacy Policy</Link>
                            <Link href="/terms" className="text-sm text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400">Terms of Service</Link>
                            <Link href="/help" className="text-sm text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400">Help Center</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

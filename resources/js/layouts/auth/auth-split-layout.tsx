import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="flex min-h-screen">
            {/* Left Side - Decorative Panel */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                </div>
                
                {/* Floating Shapes */}
                <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse" />
                <div className="absolute bottom-40 right-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse" style={{ animationDelay: '2s' }} />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
                    <div className="max-w-md text-center">
                        {/* Logo */}
                        <div className="mb-8 flex justify-center">
                            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
                                <AppLogoIcon className="h-16 w-16 text-white" />
                            </div>
                        </div>
                        
                        {/* Heading */}
                        <h1 className="text-4xl font-bold mb-4">
                            Design Your Dream Home
                        </h1>
                        <p className="text-lg text-white/80 mb-8">
                            Transform your living space with our intuitive design tools and vast collection of furniture and materials.
                        </p>
                        
                        {/* Features */}
                        <div className="space-y-4 text-left">
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Floor Plan Designer</h3>
                                    <p className="text-sm text-white/70">Create detailed floor plans with ease</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Interior Design</h3>
                                    <p className="text-sm text-white/70">Visualize your dream interiors</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Furniture Library</h3>
                                    <p className="text-sm text-white/70">Browse thousands of furniture items</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Quote */}
                        {quote && (
                            <blockquote className="mt-8 p-4 bg-white/10 backdrop-blur-sm rounded-xl border-l-4 border-white/30">
                                <p className="italic text-white/90">&ldquo;{quote.message}&rdquo;</p>
                                <footer className="mt-2 text-sm text-white/70">— {quote.author}</footer>
                            </blockquote>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 bg-white dark:bg-zinc-950">
                <div className="mx-auto w-full max-w-sm">
                    {/* Mobile Logo */}
                    <div className="lg:hidden mb-8">
                        <Link
                            href={home()}
                            className="flex items-center justify-center gap-2 text-lg font-semibold"
                        >
                            <AppLogoIcon className="h-10 w-10 text-orange-500" />
                            <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 bg-clip-text text-xl font-bold text-transparent">
                                {name}
                            </span>
                        </Link>
                    </div>

                    {/* Form Header */}
                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
                            {title}
                        </h2>
                        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                            {description}
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="space-y-6">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

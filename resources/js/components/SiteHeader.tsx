import AppLogoIcon from '@/components/app-logo-icon';
import { home, login, register } from '@/routes';
import { User } from '@/types';
import { Link } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function SiteHeader({ authUser }: { authUser?: User }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    
    // Determine dashboard URL based on user role
    const dashboardUrl = authUser?.role === 'admin' ? '/admin' : '/dashboard';

    return (
        <header className="fixed inset-x-0 top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-[#0a0a0a]/70 border-b border-black/10 dark:border-white/10 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.12)]">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
                <div className="flex items-center gap-3">
                    <button
                        className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-[#1b1b18] dark:text-[#ededec] hover:bg-black/5 dark:hover:bg-white/10"
                        onClick={() => setMobileOpen((o) => !o)}
                        aria-label="Toggle navigation"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <Link
                        href={home().url}
                        className="group relative inline-flex items-center gap-2 font-semibold text-lg tracking-tight"
                    >
                        <AppLogoIcon className="h-8 w-8 fill-current text-[#ff5722]" />
                        <span className="bg-gradient-to-r from-[#ff5722] via-[#ff9800] to-[#ffc107] bg-clip-text text-transparent">
                            Home Design
                        </span>
                        <span className="absolute -inset-x-2 -inset-y-1 rounded-md opacity-0 group-hover:opacity-100 transition bg-black/5 dark:bg-white/10" />
                    </Link>
                </div>
                <div className="hidden lg:flex items-center gap-3">
                    {authUser ? (
                        <Link
                            href={dashboardUrl}
                            className="rounded-md px-4 py-2 text-[13px] font-medium bg-gradient-to-r from-[#ff9800] to-[#ff5722] text-white shadow hover:shadow-md transition"
                        >
                            {authUser.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login().url}
                                className="rounded-md px-3 py-2 text-[13px] font-medium hover:bg-black/5 dark:hover:bg-white/10"
                            >
                                Sign in
                            </Link>
                            <Link
                                href={register().url}
                                className="rounded-md px-4 py-2 text-[13px] font-semibold bg-gradient-to-r from-[#ff5722] via-[#ff9800] to-[#ffc107] text-white shadow hover:shadow-lg active:scale-[.99] transition"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </div>
            {/* Mobile Panel */}
            {mobileOpen && (
                <div className="lg:hidden border-t border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl">
                    <div className="px-4 py-4">
                        <div className="flex gap-3">
                            {authUser ? (
                                <Link
                                    href={dashboardUrl}
                                    className="flex-1 text-center rounded-md px-4 py-2 text-[13px] font-medium bg-gradient-to-r from-[#ff9800] to-[#ff5722] text-white shadow hover:shadow-md transition"
                                >
                                    {authUser.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login().url}
                                        className="flex-1 text-center rounded-md px-3 py-2 text-[13px] font-medium bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.12]"
                                    >
                                        Sign in
                                    </Link>
                                    <Link
                                        href={register().url}
                                        className="flex-1 text-center rounded-md px-4 py-2 text-[13px] font-semibold bg-gradient-to-r from-[#ff5722] via-[#ff9800] to-[#ffc107] text-white shadow hover:shadow-lg active:scale-[.99] transition"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

export default SiteHeader;

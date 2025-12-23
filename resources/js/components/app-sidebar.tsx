import AppLogoIcon from '@/components/app-logo-icon';
import { NavFooter } from '@/components/nav-footer';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { dashboard } from '@/routes';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Box, FolderOpen, Heart, HelpCircle, Home, Image, Layout, LayoutGrid, Palette, PenTool, Ruler, Settings, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AppSidebar() {
    const page = usePage<SharedData>();
    const isLanding = page.url === '/';
    const isLoggedIn = !!page.props?.auth?.user;
    const [cartCount, setCartCount] = useState(0);

    // Fetch cart count when logged in
    useEffect(() => {
        const fetchCartCount = async () => {
            if (!isLoggedIn) {
                setCartCount(0);
                return;
            }
            try {
                const response = await axios.get('/api/cart/count');
                setCartCount(response.data.count || 0);
            } catch (error) {
                console.error('Failed to fetch cart count:', error);
            }
        };
        fetchCartCount();
    }, [isLoggedIn, page.url]);

    const mainNavItems: NavItem[] = [
        {
            title: isLanding ? 'Home' : 'Dashboard',
            href: isLanding ? '/' : dashboard(),
            icon: LayoutGrid,
        },
        {
            title: 'My Projects',
            href: '/projects',
            icon: FolderOpen,
        },
        ...(isLoggedIn
            ? [
                  {
                      title: 'Wishlist',
                      href: '/wishlist',
                      icon: Heart,
                  },
                  {
                      title: 'Cart',
                      href: '/cart',
                      icon: ShoppingCart,
                  },
                  {
                      title: 'My Orders',
                      href: '/orders',
                      icon: ShoppingBag,
                  },
              ]
            : []),
        {
            title: 'Floor Plans',
            href: '/floor-plan',
            icon: Layout,
        },
        {
            title: 'Home Design',
            href: '/design-home',
            icon: Home,
        },
        {
            title: 'Interior Design',
            href: '/interior-design',
            icon: PenTool,
        },
        {
            title: 'Gallery',
            href: '/gallery',
            icon: Image,
        },
    ];

    const toolsNavItems: NavItem[] = [
        {
            title: 'Furniture Library',
            href: '/library/furniture',
            icon: Box,
        },
        {
            title: 'Materials',
            href: '/library/materials',
            icon: Palette,
        },
        {
            title: 'Measurements',
            href: '/tools/measurements',
            icon: Ruler,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Settings',
            href: '/settings',
            icon: Settings,
        },
        {
            title: 'Help & Support',
            href: '/help',
            icon: HelpCircle,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-zinc-200 dark:border-zinc-800">
            {/* Header */}
            <SidebarHeader className="border-b border-zinc-200 dark:border-zinc-800 px-4 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton 
                            size="lg" 
                            asChild 
                            className="hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <Link href={dashboard()} prefetch>
                                <div className="flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-orange-500">
                                        <AppLogoIcon className="h-5 w-5 fill-white" />
                                    </div>
                                    <div className="flex flex-col gap-0.5 group-data-[state=collapsed]:hidden">
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                                            Home Design
                                        </span>
                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">Studio</span>
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Content */}
            <SidebarContent className="px-2 py-4">
                {/* Main Navigation */}
                <div className="space-y-2">
                    <div className="px-3 py-2 group-data-[state=collapsed]:hidden">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Workspace
                        </h2>
                    </div>
                    <div className="space-y-1">
                        {mainNavItems.map((item) => (
                            <NavItem 
                                key={item.title} 
                                item={item} 
                                isActive={page.url.startsWith(resolveUrl(item.href))}
                                badge={item.title === 'Cart' ? cartCount : undefined}
                            />
                        ))}
                    </div>
                </div>

                {/* Tools Section */}
                <div className="space-y-2 mt-4">
                    <div className="px-3 py-2 group-data-[state=collapsed]:hidden">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                            Design Tools
                        </h2>
                    </div>
                    <div className="space-y-1">
                        {toolsNavItems.map((item) => (
                            <NavItem 
                                key={item.title} 
                                item={item} 
                                isActive={page.url.startsWith(resolveUrl(item.href))}
                            />
                        ))}
                    </div>
                </div>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="px-2 py-4">
                {/* Footer links (Settings, Help) */}
                <NavFooter items={footerNavItems} />

                {/* User area: show profile menu when logged in, otherwise show Login CTA */}
                {page.props?.auth?.user ? (
                    <NavUser />
                ) : (
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                asChild
                                className="p-0 hover:bg-transparent"
                            >
                                <Link href="/login" className="w-full">
                                    <div className="flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 w-full group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 flex-shrink-0">
                                            <span className="text-2xl">🔒</span>
                                        </div>
                                        <span className="text-white font-semibold text-sm group-data-[state=collapsed]:hidden">Login</span>
                                    </div>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}

interface NavItemProps {
    item: NavItem;
    isActive: boolean;
    size?: 'sm' | 'default';
    badge?: number;
}

function NavItem({ item, isActive, size = 'default', badge }: NavItemProps) {
    const Icon = item.icon;
    
    return (
        <Link
            href={item.href}
            prefetch
            className={`group flex items-center gap-3 rounded-md px-3 transition-all duration-200 ${
                size === 'sm' ? 'py-2 text-sm' : 'py-2.5 text-sm'
            } ${
                isActive
                    ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-medium'
                    : 'text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-300'
            }`}
        >
            {/* Icon */}
            <div className="relative flex-shrink-0">
                {Icon && <Icon className={`h-5 w-5 transition-colors ${
                    isActive 
                        ? 'text-orange-600 dark:text-orange-400' 
                        : 'text-zinc-500 dark:text-zinc-500'
                }`} />}
                {badge !== undefined && badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                        {badge > 99 ? '99+' : badge}
                    </span>
                )}
            </div>

            {/* Label */}
            <span className="flex-1 group-data-[state=collapsed]:hidden">
                {item.title}
            </span>

            {/* Badge for expanded state */}
            {badge !== undefined && badge > 0 && (
                <span className="group-data-[state=collapsed]:hidden ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 text-xs font-semibold text-white">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
}

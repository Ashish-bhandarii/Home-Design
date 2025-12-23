import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SiteSettings {
    contact_email?: string;
    contact_phone?: string;
    contact_address?: string;
    facebook_url?: string;
    twitter_url?: string;
    instagram_url?: string;
    linkedin_url?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash: {
        message?: string;
        success?: string;
        error?: string;
    };
    sidebarOpen: boolean;
    siteSettings: SiteSettings;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    role?: 'admin' | 'user';
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

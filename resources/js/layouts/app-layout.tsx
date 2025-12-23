import FlashMessage from '@/components/flash-message';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
    withFooter?: boolean;
}

export default function AppLayout({ children, breadcrumbs, withFooter = true, ...props }: AppLayoutProps) {
    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs} withFooter={withFooter} {...props}>
            <FlashMessage />
            {children}
        </AppLayoutTemplate>
    );
}

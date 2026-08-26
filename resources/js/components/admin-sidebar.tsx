import { Link, usePage } from '@inertiajs/react';
import {
    Boxes,
    FolderTree,
    Images,
    LayoutDashboard,
    Package,
    Settings,
    ShoppingBag,
    Store,
    Users,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard, home } from '@/routes';
import { inventory, settings } from '@/routes/dashboard';
import { index as bannersIndex } from '@/routes/dashboard/banners';
import { index as categoriesIndex } from '@/routes/dashboard/categories';
import { index as customersIndex } from '@/routes/dashboard/customers';
import { index as ordersIndex } from '@/routes/dashboard/orders';
import { index as productsIndex } from '@/routes/dashboard/products';
import type { NavItem } from '@/types';

type AdminNavSection = {
    title: string;
    items: NavItem[];
};

const adminNavSections: AdminNavSection[] = [
    {
        title: 'Overview',
        items: [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: 'Commerce',
        items: [
            {
                title: 'Orders',
                href: ordersIndex(),
                icon: ShoppingBag,
            },
            {
                title: 'Products',
                href: productsIndex(),
                icon: Package,
            },
            {
                title: 'Categories',
                href: categoriesIndex(),
                icon: FolderTree,
            },
            {
                title: 'Inventory',
                href: inventory(),
                icon: Boxes,
            },
        ],
    },
    {
        title: 'Customers',
        items: [
            {
                title: 'Customers',
                href: customersIndex(),
                icon: Users,
            },
        ],
    },
    {
        title: 'Configuration',
        items: [
            {
                title: 'Banners',
                href: bannersIndex(),
                icon: Images,
            },
            {
                title: 'Store Settings',
                href: settings(),
                icon: Settings,
            },
            {
                title: 'Storefront',
                href: home(),
                icon: Store,
            },
        ],
    },
];

export function AdminSidebar() {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { dashboard: dashboardStats } = usePage().props;
    const pendingOrdersCount = dashboardStats.orders.pending_count;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {adminNavSections.map((section) => (
                    <SidebarGroup key={section.title} className="px-2 py-0">
                        <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                        <SidebarMenu>
                            {section.items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isCurrentOrParentUrl(
                                            item.href,
                                        )}
                                        tooltip={{ children: item.title }}
                                    >
                                        <Link
                                            href={item.href}
                                            prefetch
                                            className="relative"
                                        >
                                            {item.icon && (
                                                <span className="relative [&>svg]:size-4 [&>svg]:shrink-0">
                                                    <item.icon />
                                                    {item.title === 'Orders' &&
                                                        pendingOrdersCount >
                                                            0 && (
                                                            <span className="absolute -top-2 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[9px] leading-none font-bold text-white ring-2 ring-sidebar">
                                                                {pendingOrdersCount >
                                                                99
                                                                    ? '99+'
                                                                    : pendingOrdersCount}
                                                            </span>
                                                        )}
                                                </span>
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

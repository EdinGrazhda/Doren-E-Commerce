import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';

import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

import { home } from '@/routes';
import { show as showCollection } from '@/routes/collections';

type Props = {
    activeCategorySlug?: string | null;
    isNewInActive?: boolean;
    mobile?: boolean;
    preserveScroll?: boolean;
};

export default function StorefrontNavigation({
    activeCategorySlug = null,
    isNewInActive = false,
    mobile = false,
    preserveScroll = false,
}: Props) {
    const { storefrontCategories } = usePage().props;

    const navigationItems = [
        { id: 'new-in', label: 'New In', slug: null },
        ...storefrontCategories.map((category) => ({
            id: category.id,
            label: category.name,
            slug: category.slug,
        })),
    ];

    if (mobile) {
        return (
            <Sheet>
                <SheetTrigger asChild>
                    <button
                        type="button"
                        className="grid h-10 w-10 place-items-center lg:hidden"
                        aria-label="Open navigation"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </SheetTrigger>
                <SheetContent
                    side="left"
                    className="bg-[#f8f4ed] px-6 pt-16 text-[#151513] lg:hidden"
                >
                    <SheetTitle className="text-sm font-bold tracking-[0.12em] uppercase">
                        Shop
                    </SheetTitle>
                    <nav
                        aria-label="Mobile navigation"
                        className="flex flex-col"
                    >
                        {navigationItems.map((item) => {
                            const isActive = item.slug
                                ? activeCategorySlug === item.slug
                                : isNewInActive;

                            return (
                                <SheetClose asChild key={item.id}>
                                    <Link
                                        href={
                                            item.slug
                                                ? showCollection(item.slug)
                                                : `${home.url()}#new-in`
                                        }
                                        preserveScroll={preserveScroll}
                                        aria-current={
                                            isActive ? 'page' : undefined
                                        }
                                        className={`border-b border-[#dfd8cc] py-4 text-sm font-bold tracking-[0.1em] uppercase transition-colors hover:text-[#8d6b35] ${isActive ? 'text-[#8d6b35]' : ''}`}
                                    >
                                        {item.label}
                                    </Link>
                                </SheetClose>
                            );
                        })}
                    </nav>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-7 overflow-x-auto px-6 text-[11px] font-bold tracking-[0.12em] uppercase lg:flex xl:gap-10">
            {navigationItems.map((item) => {
                const isActive = item.slug
                    ? activeCategorySlug === item.slug
                    : isNewInActive;

                return (
                    <Link
                        key={item.id}
                        href={
                            item.slug
                                ? showCollection(item.slug)
                                : `${home.url()}#new-in`
                        }
                        preserveScroll={preserveScroll}
                        aria-current={isActive ? 'page' : undefined}
                        className={`relative shrink-0 py-2 transition-colors after:absolute after:right-0 after:bottom-0 after:left-0 after:h-px after:bg-[#8d6b35] after:transition-transform ${isActive ? 'text-[#8d6b35] after:scale-x-100' : 'after:scale-x-0 hover:text-[#8d6b35] hover:after:scale-x-100'}`}
                    >
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

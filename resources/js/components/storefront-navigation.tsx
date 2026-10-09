import { Link, usePage } from '@inertiajs/react';

import { home } from '@/routes';

type Props = {
    activeCategorySlug?: string | null;
    isNewInActive?: boolean;
    preserveScroll?: boolean;
};

export default function StorefrontNavigation({
    activeCategorySlug = null,
    isNewInActive = false,
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
                                ? home({ query: { category: item.slug } })
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

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

export type AdminPaginationMeta<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    path: string;
    first_page_url: string | null;
    last_page_url: string | null;
    prev_page_url: string | null;
    next_page_url: string | null;
};

type AdminPaginationProps<T> = {
    pagination: AdminPaginationMeta<T>;
    onPageChange: (url: string) => void;
};

function pageNumbers(currentPage: number, lastPage: number): number[] {
    if (lastPage <= 7) {
        return Array.from({ length: lastPage }, (_, index) => index + 1);
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(lastPage - 1, currentPage + 1);
    const pages = [1];

    if (start > 2) {
        pages.push(-1);
    }

    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }

    if (end < lastPage - 1) {
        pages.push(-2);
    }

    pages.push(lastPage);

    return pages;
}

function pageUrl<T>(pagination: AdminPaginationMeta<T>, page: number): string {
    const separator = pagination.path.includes('?') ? '&' : '?';

    return `${pagination.path}${separator}page=${page}`;
}

export function AdminPagination<T>({
    pagination,
    onPageChange,
}: AdminPaginationProps<T>) {
    if (pagination.total === 0) {
        return null;
    }

    const pages = pageNumbers(pagination.current_page, pagination.last_page);

    return (
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
                Showing {pagination.from?.toLocaleString() ?? 0}-
                {pagination.to?.toLocaleString() ?? 0} of{' '}
                {pagination.total.toLocaleString()}
            </p>

            {pagination.last_page > 1 && (
                <nav
                    className="flex items-center gap-1"
                    aria-label="Pagination"
                >
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={!pagination.prev_page_url}
                        onClick={() => {
                            if (pagination.prev_page_url) {
                                onPageChange(pagination.prev_page_url);
                            }
                        }}
                    >
                        <ChevronLeft />
                        <span className="sr-only">Previous page</span>
                    </Button>

                    {pages.map((page) =>
                        page < 0 ? (
                            <span
                                key={page}
                                className="grid size-9 place-items-center text-sm text-muted-foreground"
                            >
                                ...
                            </span>
                        ) : (
                            <Button
                                key={page}
                                type="button"
                                variant={
                                    page === pagination.current_page
                                        ? 'default'
                                        : 'outline'
                                }
                                size="icon"
                                aria-current={
                                    page === pagination.current_page
                                        ? 'page'
                                        : undefined
                                }
                                onClick={() =>
                                    onPageChange(pageUrl(pagination, page))
                                }
                            >
                                {page}
                            </Button>
                        ),
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={!pagination.next_page_url}
                        onClick={() => {
                            if (pagination.next_page_url) {
                                onPageChange(pagination.next_page_url);
                            }
                        }}
                    >
                        <ChevronRight />
                        <span className="sr-only">Next page</span>
                    </Button>
                </nav>
            )}
        </div>
    );
}

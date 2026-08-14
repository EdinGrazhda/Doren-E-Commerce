import { Head, useHttp } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import {  useState } from 'react';
import type {FormEvent} from 'react';

import { AdminApiState } from '@/components/admin-api-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminApi } from '@/hooks/use-admin-api';
import { formatDate } from '@/lib/admin-format';
import { dashboard } from '@/routes';
import {
    destroy as destroyCategory,
    index as categoriesApiIndex,
    store as storeCategory,
    update as updateCategory,
} from '@/routes/api/admin/categories';
import { index as categoriesIndex } from '@/routes/dashboard/categories';

type Category = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_visible: boolean;
    updated_at: string;
    products_count: number;
    active_products_count: number;
};

type Props = {
    categories: Category[];
};

type CategoryFormData = {
    name: string;
    slug: string;
    description: string;
    is_visible: boolean;
};

const emptyCategory: CategoryFormData = {
    name: '',
    slug: '',
    description: '',
    is_visible: true,
};

export default function AdminCategoriesIndex() {
    const [open, setOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null,
    );
    const listing = useAdminApi<Props>(categoriesApiIndex.url());
    const form = useHttp<CategoryFormData>(emptyCategory);
    const deleteRequest = useHttp<Record<string, never>>({});

    if (!listing.data) {
        return (
            <>
                <Head title="Admin Categories" />
                <AdminApiState error={listing.error} />
            </>
        );
    }

    const { categories } = listing.data;

    const openCreateDialog = () => {
        setEditingCategory(null);
        form.clearErrors();
        form.setData(emptyCategory);
        setOpen(true);
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        form.clearErrors();
        form.setData({
            name: category.name,
            slug: category.slug,
            description: category.description ?? '',
            is_visible: category.is_visible,
        });
        setOpen(true);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            onSuccess: () => {
                setOpen(false);
                setEditingCategory(null);
                form.reset();
                void listing.reload();
            },
        };

        if (editingCategory) {
            void form.put(updateCategory.url(editingCategory.id), options);

            return;
        }

        void form.post(storeCategory.url(), options);
    };

    const deleteCategory = (category: Category) => {
        if (!window.confirm(`Delete ${category.name}?`)) {
            return;
        }

        void deleteRequest
            .delete(destroyCategory.url(category.id), {
                onSuccess: () => void listing.reload(),
            })
            .catch(() => undefined);
    };

    return (
        <>
            <Head title="Admin Categories" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Categories
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Storefront category structure and merchandising
                            order.
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreateDialog}>
                                <Plus />
                                New category
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingCategory
                                        ? 'Edit category'
                                        : 'New category'}
                                </DialogTitle>
                                <DialogDescription>
                                    Manage storefront grouping and visibility.
                                </DialogDescription>
                            </DialogHeader>

                            <form className="grid gap-4" onSubmit={submit}>
                                <div className="grid gap-2">
                                    <Label htmlFor="category-name">Name</Label>
                                    <Input
                                        id="category-name"
                                        value={form.data.name}
                                        onChange={(event) =>
                                            form.setData(
                                                'name',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    {form.errors.name && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.name}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category-slug">Slug</Label>
                                    <Input
                                        id="category-slug"
                                        value={form.data.slug}
                                        onChange={(event) =>
                                            form.setData(
                                                'slug',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="auto-generated from name"
                                    />
                                    {form.errors.slug && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.slug}
                                        </p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category-description">
                                        Description
                                    </Label>
                                    <textarea
                                        id="category-description"
                                        className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
                                        value={form.data.description}
                                        onChange={(event) =>
                                            form.setData(
                                                'description',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    {form.errors.description && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.description}
                                        </p>
                                    )}
                                </div>
                                <label className="flex items-center gap-2 text-sm font-medium">
                                    <Checkbox
                                        checked={form.data.is_visible}
                                        onCheckedChange={(checked) =>
                                            form.setData(
                                                'is_visible',
                                                checked === true,
                                            )
                                        }
                                    />
                                    Visible on storefront
                                </label>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        {editingCategory ? 'Save' : 'Create'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle>
                            {categories.length.toLocaleString()} categories
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead>
                                <tr className="border-b text-left text-xs text-muted-foreground">
                                    <th className="py-3 font-medium">
                                        Category
                                    </th>
                                    <th className="py-3 font-medium">Slug</th>
                                    <th className="py-3 font-medium">
                                        Products
                                    </th>
                                    <th className="py-3 font-medium">Status</th>
                                    <th className="py-3 font-medium">
                                        Updated
                                    </th>
                                    <th className="py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category) => (
                                    <tr
                                        key={category.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="py-3">
                                            <div className="font-medium">
                                                {category.name}
                                            </div>
                                            <div className="max-w-md truncate text-xs text-muted-foreground">
                                                {category.description ??
                                                    'No description'}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            /{category.slug}
                                        </td>
                                        <td className="py-3">
                                            {category.active_products_count}{' '}
                                            active / {category.products_count}{' '}
                                            total
                                        </td>
                                        <td className="py-3">
                                            <Badge
                                                variant={
                                                    category.is_visible
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {category.is_visible
                                                    ? 'Visible'
                                                    : 'Hidden'}
                                            </Badge>
                                        </td>
                                        <td className="py-3">
                                            {formatDate(category.updated_at)}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        openEditDialog(category)
                                                    }
                                                >
                                                    <Edit />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        deleteCategory(category)
                                                    }
                                                >
                                                    <Trash2 />
                                                    Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminCategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: dashboard(),
        },
        {
            title: 'Categories',
            href: categoriesIndex(),
        },
    ],
};

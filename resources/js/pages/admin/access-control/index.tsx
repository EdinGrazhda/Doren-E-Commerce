import { Head, useHttp } from '@inertiajs/react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { AdminApiState } from '@/components/admin-api-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminApi } from '@/hooks/use-admin-api';
import { dashboard } from '@/routes';
import {
    destroy as destroyPermission,
    store as storePermission,
    update as updatePermission,
} from '@/routes/api/admin/permissions';
import {
    destroy as destroyRole,
    index as rolesIndex,
    store as storeRole,
    update as updateRole,
} from '@/routes/api/admin/roles';
import { accessControl } from '@/routes/dashboard';

type Permission = { id: number; name: string; roles_count?: number };
type Role = {
    id: number;
    name: string;
    users_count: number;
    permissions: Permission[];
};
type Props = { roles: Role[]; permissions: Permission[] };
type RoleFormData = { name: string; permissions: string[] };
type PermissionFormData = { name: string };

export default function AccessControlIndex() {
    const listing = useAdminApi<Props>(rolesIndex.url());
    const roleForm = useHttp<RoleFormData>({ name: '', permissions: [] });
    const permissionForm = useHttp<PermissionFormData>({ name: '' });
    const deletion = useHttp<Record<string, never>>({});
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [editingPermission, setEditingPermission] =
        useState<Permission | null>(null);

    if (!listing.data) {
        return (
            <>
                <Head title="Roles & Permissions" />
                <AdminApiState error={listing.error} />
            </>
        );
    }

    const { roles, permissions } = listing.data;
    const resetRole = () => {
        setEditingRole(null);
        roleForm.setData({ name: '', permissions: [] });
        roleForm.clearErrors();
    };
    const resetPermission = () => {
        setEditingPermission(null);
        permissionForm.setData({ name: '' });
        permissionForm.clearErrors();
    };
    const submitRole = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const request = editingRole
            ? roleForm.put(updateRole.url(editingRole.id), {
                  onSuccess: () => {
                      resetRole();
                      void listing.reload();
                  },
              })
            : roleForm.post(storeRole.url(), {
                  onSuccess: () => {
                      resetRole();
                      void listing.reload();
                  },
              });
        void request;
    };
    const submitPermission = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const request = editingPermission
            ? permissionForm.put(
                  updatePermission.url(editingPermission.id),
                  {
                      onSuccess: () => {
                          resetPermission();
                          void listing.reload();
                      },
                  },
              )
            : permissionForm.post(storePermission.url(), {
                  onSuccess: () => {
                      resetPermission();
                      void listing.reload();
                  },
              });
        void request;
    };
    const togglePermission = (name: string) =>
        roleForm.setData(
            'permissions',
            roleForm.data.permissions.includes(name)
                ? roleForm.data.permissions.filter(
                      (permission) => permission !== name,
                  )
                : [...roleForm.data.permissions, name],
        );

    return (
        <>
            <Head title="Roles & Permissions" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Roles & Permissions
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Control panel access with reusable roles and
                        permissions.
                    </p>
                </div>
                <div className="grid gap-6 xl:grid-cols-2">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Roles</CardTitle>
                            <CardDescription>
                                Create roles and choose their permissions.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <form
                                onSubmit={submitRole}
                                className="grid gap-4 rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="role-name">
                                        {editingRole ? 'Edit role' : 'New role'}
                                    </Label>
                                    {editingRole && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={resetRole}
                                        >
                                            <X />
                                        </Button>
                                    )}
                                </div>
                                <Input
                                    id="role-name"
                                    value={roleForm.data.name}
                                    onChange={(event) =>
                                        roleForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="warehouse-manager"
                                />
                                {roleForm.errors.name && (
                                    <p className="text-sm text-destructive">
                                        {roleForm.errors.name}
                                    </p>
                                )}
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {permissions.map((permission) => (
                                        <Label
                                            key={permission.id}
                                            className="flex items-center gap-2 rounded-md border p-3 font-normal"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={roleForm.data.permissions.includes(
                                                    permission.name,
                                                )}
                                                onChange={() =>
                                                    togglePermission(
                                                        permission.name,
                                                    )
                                                }
                                            />
                                            {permission.name}
                                        </Label>
                                    ))}
                                </div>
                                <Button disabled={roleForm.processing}>
                                    <Plus />
                                    {editingRole ? 'Save role' : 'Create role'}
                                </Button>
                            </form>
                            <div className="grid gap-3">
                                {roles.map((role) => (
                                    <div
                                        key={role.id}
                                        className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="grid gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {role.name}
                                                </span>
                                                <Badge variant="secondary">
                                                    {role.users_count} users
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.map(
                                                    (permission) => (
                                                        <Badge
                                                            key={permission.id}
                                                            variant="outline"
                                                        >
                                                            {permission.name}
                                                        </Badge>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingRole(role);
                                                    roleForm.setData({
                                                        name: role.name,
                                                        permissions:
                                                            role.permissions.map(
                                                                (permission) =>
                                                                    permission.name,
                                                            ),
                                                    });
                                                }}
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                disabled={[
                                                    'admin',
                                                    'employee',
                                                ].includes(role.name)}
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            `Delete role ${role.name}?`,
                                                        )
                                                    ) {
                                                        void deletion.delete(
                                                            destroyRole.url(
                                                                role.id,
                                                            ),
                                                            {
                                                                onSuccess: () =>
                                                                    void listing.reload(),
                                                            },
                                                        );
                                                    }
                                                }}
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Permissions</CardTitle>
                            <CardDescription>
                                Create permission keys used by roles.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <form
                                onSubmit={submitPermission}
                                className="grid gap-4 rounded-lg border p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="permission-name">
                                        {editingPermission
                                            ? 'Edit permission'
                                            : 'New permission'}
                                    </Label>
                                    {editingPermission && (
                                        <Button
                                            type="button"
                                            size="icon"
                                            variant="ghost"
                                            onClick={resetPermission}
                                        >
                                            <X />
                                        </Button>
                                    )}
                                </div>
                                <Input
                                    id="permission-name"
                                    value={permissionForm.data.name}
                                    onChange={(event) =>
                                        permissionForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="reports.view"
                                />
                                {permissionForm.errors.name && (
                                    <p className="text-sm text-destructive">
                                        {permissionForm.errors.name}
                                    </p>
                                )}
                                <Button disabled={permissionForm.processing}>
                                    <Plus />
                                    {editingPermission
                                        ? 'Save permission'
                                        : 'Create permission'}
                                </Button>
                            </form>
                            <div className="grid gap-2">
                                {permissions.map((permission) => (
                                    <div
                                        key={permission.id}
                                        className="flex items-center justify-between gap-3 rounded-lg border p-3"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                {permission.name}
                                            </div>
                                            {permission.roles_count !==
                                                undefined && (
                                                <div className="text-xs text-muted-foreground">
                                                    Used by{' '}
                                                    {permission.roles_count}{' '}
                                                    roles
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() => {
                                                    setEditingPermission(
                                                        permission,
                                                    );
                                                    permissionForm.setData(
                                                        'name',
                                                        permission.name,
                                                    );
                                                }}
                                            >
                                                <Pencil />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="destructive"
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            `Delete permission ${permission.name}?`,
                                                        )
                                                    ) {
                                                        void deletion.delete(
                                                            destroyPermission.url(
                                                                permission.id,
                                                            ),
                                                            {
                                                                onSuccess: () =>
                                                                    void listing.reload(),
                                                            },
                                                        );
                                                    }
                                                }}
                                            >
                                                <Trash2 />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AccessControlIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Roles & Permissions', href: accessControl() },
    ],
};

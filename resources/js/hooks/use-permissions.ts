import { usePage } from '@inertiajs/react';

export function usePermissions() {
    const { auth } = usePage().props as any;

    const hasRole = (role: string) => {
        return auth.roles.includes(role);
    };

    const hasPermission = (permission: string) => {
        return auth.permissions.includes(permission);
    };

    return { hasRole, hasPermission };
}
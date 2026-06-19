import { Link, usePage } from '@inertiajs/react';
import { Activity, Award, BellRing, BookOpen, BriefcaseMedical, CalendarClock, CalendarDays, CircleDollarSign, ClipboardPlus, CreditCard, FolderGit2, History, Hospital, Layers, LayoutDashboard, LayoutGrid, MessageSquare, ShieldCheck, Stethoscope, Tag, UserCog, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem, User } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { ChatNavItem } from './admin/layout/chat-nav-item';
import { useEcho } from '@laravel/echo-react';
import { useSoundAlert } from '@/hooks/use-sound-alert';
import { NotificationsMenu } from './admin/layout/notifications-menu';

interface AppNavItem extends NavItem {
    roles?: string[];
    strictRole?: boolean;
}

const mainNavItems: AppNavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: "Agenda",
        href: "/admin/appointments",
        icon: CalendarDays,
        roles: ['admin', 'doctor', 'assistant'],
    },
    {
        title: 'Pacientes',
        href: '/admin/patients',
        icon: Users,
        roles: ['admin', 'doctor', 'assistant'],
    },
    {
        title: "Mi Horario",
        href: '/my-schedule',
        icon: CalendarClock,
        roles: ['doctor'],
        strictRole: true,
    },
    {
        title: "Clínica",
        href: "/admin/clinic",
        icon: Hospital,
        roles: ['admin'],
    },
    {
        title: "Especialidades",
        href: "/admin/specialties",
        icon: BriefcaseMedical,
        roles: ['admin'],
    },
    {
        title: 'Usuarios',
        href: '/admin/staff',
        icon: UserCog,
        roles: ['admin'],
    },
    {
        title: 'Médicos',
        href: '/admin/doctors',
        icon: Stethoscope,
        roles: ['admin'],
    },
    {
        title: "Servicios",
        href: "/admin/services",
        icon: ClipboardPlus,
        roles: ['admin'],
    },
    {
        title: "Catalogos",
        href: "/admin/catalogs",
        icon: Layers,
        roles: ['admin'],
    },
    {
        title: "Métodos de pago",
        href: "/admin/payment-methods",
        icon: CreditCard,
        roles: ['admin'],
    },
    {
        title: "Auditoría",
        href: "/admin/audit",
        icon: ShieldCheck,
        roles: ['admin'],
    },
    {
        title: "Recordatorios",
        href: "/admin/reminders",
        icon: BellRing,
        roles: ['admin'],
    },
    {
        title: "Reporte operativo",
        href: "/admin/reports/operational",
        icon: Activity,
        roles: ['admin'],
    },
    {
        title: "Reporte financiero",
        href: "/admin/reports/financial",
        icon: CircleDollarSign,
        roles: ['admin'],
    },
];

export function AppSidebar() {
    const { auth } = usePage<{ auth: { user: User & { roles?: string[] }, unreadMessagesCount: number } }>().props;
    const user = auth.user;

    const userRoles = useMemo(() => {

        return user.roles?.map((r: any) => r.name) || [];
    }, [user]);

    const hasRole = (roles: string[], strict: boolean = false) => {
        if (!strict && userRoles.includes('super_admin')) return true;

        return roles.some(r => userRoles.includes(r));
    };

    const filteredNavItems = useMemo(() => {
        return mainNavItems.filter(item => {
            if (!item.roles) return true;
            return hasRole(item.roles, item.strictRole);
        });
    }, [userRoles]);

    const [unreadMsgCount, setUnreadMsgCount] = useState(auth.unreadMessagesCount || 0);
    const canAccessChat = hasRole(['doctor', 'assistant', 'admin']);

    const playChatSound = useSoundAlert('/sounds/pop.mp3');

    useEcho(
        `chat.${user.id}`,
        '.message.sent',
        (e: any) => {
            playChatSound();
            setUnreadMsgCount((prev) => prev + 1);
        },
        [user.id],
        'private'
    );

    useEffect(() => {
        setUnreadMsgCount(auth.unreadMessagesCount);
    }, [auth.unreadMessagesCount]);

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
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    {canAccessChat && (
                        <ChatNavItem unreadCount={unreadMsgCount} />
                    )}
                    <SidebarMenuItem>
                        <NotificationsMenu />
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarSeparator className='mx-0' />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

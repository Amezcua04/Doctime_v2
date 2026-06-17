import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Bell, Trash2, Calendar, CheckCheck, Pencil, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEcho } from '@laravel/echo-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSoundAlert } from '@/hooks/use-sound-alert';

interface NotificationItem {
    id: string;
    type: string;
    data: {
        title: string;
        message: string;
        action?: string;
        icon?: string;
        appointment_id?: number;
    };
    created_at: string;
    read_at: string | null;
}

export function NotificationsMenu() {
    const { auth } = usePage<{ auth: { user: any, notifications: NotificationItem[], unreadCount: number } }>().props;
    const user = auth.user;
    const playNotificationSound = useSoundAlert('/sounds/bell.mp3');

    const [notifications, setNotifications] = useState<NotificationItem[]>(auth.notifications || []);
    const [unreadCount, setUnreadCount] = useState(auth.unreadCount || 0);
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEcho(
        `App.Models.User.${user.id}`,
        '.Illuminate\\Notifications\\Events\\BroadcastNotificationCreated',
        (e: any) => {
            playNotificationSound();
            const notificationData = e.data;

            const newNotification: NotificationItem = {
                id: e.id,
                type: e.type,
                data: {
                    title: notificationData.title,
                    message: notificationData.message,
                    action: notificationData.action,
                    icon: notificationData.icon,
                    appointment_id: notificationData.appointment_id
                },
                created_at: new Date().toISOString(),
                read_at: null
            };

            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
        },
        [user.id],
        'private'
    );

    const markAsRead = (id: string) => {
        router.post(`/notifications/${id}/read`, {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setNotifications(prev => prev.filter(n => n.id !== id));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        });
    };

    const markAllAsRead = () => {
        router.post('/notifications/mark-all', {}, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                setNotifications([]);
                setUnreadCount(0);
                setIsOpen(false);
            }
        });
    };

    const getIcon = (iconType?: string) => {
        switch (iconType) {
            case 'trash': return <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />;
            case 'pencil': return <Pencil className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
            case 'info': return <Info className="h-4 w-4 text-sky-500 dark:text-sky-400" />;
            case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
            default: return <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 relative cursor-pointer px-2 group/notifications"
                >
                    <div className="flex items-center gap-2 ml-1">
                        <Bell className="h-4 w-4 text-muted-foreground group-hover/notifications:text-foreground transition-colors" />

                        <span className='font-normal group-data-[collapsible=icon]:hidden truncate'>
                            Notificaciones
                        </span>
                    </div>

                    {unreadCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white shadow-sm 
                        group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:top-1.5 group-data-[collapsible=icon]:right-1.5 group-data-[collapsible=icon]:h-2.5 group-data-[collapsible=icon]:w-2.5
                        group-data-[collapsible=icon]:min-w-0 group-data-[collapsible=icon]:p-0">
                            <span className="group-data-[collapsible=icon]:hidden">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                side={isMobile ? "top" : "right"}
                align={isMobile ? "center" : "start"}
                className="w-[90vw] sm:w-80 p-0 shadow-xl border-border rounded-xl overflow-hidden ml-0 sm:ml-2 bg-popover text-popover-foreground"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/40 backdrop-blur-sm">
                    <h4 className="font-semibold text-sm">Notificaciones</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
                            Marcar todo
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[350px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-3">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <Bell className="h-6 w-6 opacity-30" />
                            </div>
                            <p className="text-xs font-medium">No tienes notificaciones nuevas</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className="px-4 py-3.5 hover:bg-muted/50 transition-colors flex gap-3 group relative cursor-pointer"
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="mt-0.5 h-8 w-8 rounded-full bg-background border border-border shadow-sm flex items-center justify-center shrink-0">
                                        {getIcon(notification.data.icon)}
                                    </div>

                                    <div className="space-y-1 flex-1 pr-2">
                                        <p className="text-sm font-medium text-foreground leading-tight">
                                            {notification.data.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {notification.data.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground/70 font-medium pt-1 flex items-center gap-1">
                                            <Calendar className="h-2.5 w-2.5" />
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                                        </p>
                                    </div>

                                    <div className="absolute right-3 top-4 h-2 w-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
import React from 'react';
import { Link } from '@inertiajs/react';
import { MessageSquare } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

interface ChatNavItemProps {
  unreadCount: number;
}

export function ChatNavItem({ unreadCount }: ChatNavItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild tooltip="Mensajería interna">
        <Link href="/chat" className="flex items-center justify-between group/chat cursor-pointer">
          <div className="flex items-center gap-2 ml-1">
            <MessageSquare className="h-4 w-4 text-muted-foreground group-hover/chat:text-foreground transition-colors" />
            <span>Mensajería</span>
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
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
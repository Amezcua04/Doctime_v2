import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Send, Mail, MessageCircle, Loader2 } from 'lucide-react';
import { ActionTooltip } from '@/components/shared/action-tooltip';

interface SendBudgetDropdownProps {
  isLoading: boolean;
  onSendEmail: () => void;
  onSendWhatsApp: () => void;
}

export function SendBudgetDropdown({ isLoading, onSendEmail, onSendWhatsApp }: SendBudgetDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ActionTooltip label="Enviar">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer text-indigo-600 hover:bg-indigo-50 cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </ActionTooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onSendEmail} className="cursor-pointer flex items-center">
          <Mail className="mr-2 h-4 w-4 text-amber-600" />
          <span>Enviar por Email</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSendWhatsApp} className="cursor-pointer flex items-center">
          <MessageCircle className="mr-2 h-4 w-4 text-emerald-600" />
          <span>Enviar por WhatsApp</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
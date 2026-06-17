import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionTooltipProps {
  children: React.ReactNode;
  label: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  variant?: 'default' | 'destructive';
}

export const ActionTooltip = ({
  children,
  label,
  side = 'top',
  align = 'center',
  variant = 'default'
}: ActionTooltipProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip >
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={variant === 'destructive' ? 'bg-destructive text-white' : ''}
        >
          <p className="text-xs font-medium">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
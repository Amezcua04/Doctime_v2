import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CalendarOff, ArrowRight, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimeSlot {
  start_time: string;
  end_time: string;
}

export interface DayConfig {
  day_of_week: number;
  label: string;
  enabled: boolean;
  slots: TimeSlot[];
}

interface Props {
  day: DayConfig;
  dayIndex: number;
  onToggle: (idx: number) => void;
  onAddSlot: (idx: number) => void;
  onRemoveSlot: (dIdx: number, sIdx: number) => void;
  onUpdateSlot: (dIdx: number, sIdx: number, field: keyof TimeSlot, val: string) => void;
}

export const DayRow = ({
  day,
  dayIndex,
  onToggle,
  onAddSlot,
  onRemoveSlot,
  onUpdateSlot
}: Props) => {
  return (
    <div className={cn(
      "group flex flex-col sm:flex-row sm:items-start gap-4 p-4 rounded-xl border transition-all duration-200",
      day.enabled
        ? "bg-card border-border shadow-sm"
        : "bg-muted/30 border-transparent opacity-70"
    )}>
      {/* Control del Día */}
      <div className="flex items-center gap-3 w-32 shrink-0 pt-1">
        <Switch
          checked={day.enabled}
          onCheckedChange={() => onToggle(dayIndex)}
          className="data-[state=checked]:bg-primary cursor-pointer"
        />
        <div className="flex flex-col">
          <span className={cn("font-medium text-sm", day.enabled ? "text-foreground" : "text-muted-foreground")}>
            {day.label}
          </span>
          {day.enabled && (
            <span className="text-[10px] text-primary font-medium">
              {day.slots.length} turno{day.slots.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Área de Slots */}
      <div className="flex-1 min-w-0">
        {!day.enabled ? (
          <div className="text-sm text-muted-foreground italic py-1 flex items-center gap-2">
            <CalendarOff className="h-3 w-3" /> No laborable
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-3">
            {day.slots.map((slot, slotIndex) => (
              <div
                key={slotIndex}
                className="flex items-center gap-2 bg-background border border-border rounded-md p-1.5 pl-2 shadow-sm transition-all hover:border-primary/40"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Input
                    type="time"
                    className="h-6 w-auto px-0 text-center border-0 bg-transparent focus-visible:ring-0 p-0 cursor-pointer text-foreground"
                    value={slot.start_time}
                    onChange={(e) => onUpdateSlot(dayIndex, slotIndex, 'start_time', e.target.value)}
                  />
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <Input
                    type="time"
                    className="h-6 w-auto px-0 text-center border-0 bg-transparent focus-visible:ring-0 p-0 cursor-pointer text-foreground"
                    value={slot.end_time}
                    onChange={(e) => onUpdateSlot(dayIndex, slotIndex, 'end_time', e.target.value)}
                  />
                </div>

                {day.slots.length > 1 && (
                  <button
                    onClick={() => onRemoveSlot(dayIndex, slotIndex)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-sm hover:bg-muted cursor-pointer"
                    title="Eliminar turno"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddSlot(dayIndex)}
              className="h-[38px] border-dashed border-muted-foreground/30 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/5 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Agregar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
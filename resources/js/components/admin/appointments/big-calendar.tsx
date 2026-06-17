import React, { useState, useCallback, useEffect, useMemo, CSSProperties } from 'react';
import { Calendar, dateFnsLocalizer, View, Views, Navigate } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent } from '@/types';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const statusDotColors: Record<string, string> = {
  scheduled: '#3b82f6',
  confirmed: '#10b981',
  arrived: '#a855f7',
  in_progress: '#6366f1',
  cancelled: '#ef4444',
  completed: '#475569',
  no_show: '#f59e0b',
};

interface BigCalendarProps {
  events: CalendarEvent[];
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  toolbarAction?: React.ReactNode;
}

const CustomToolbar = ({ date, view, onNavigate, onView, extraAction }: any) => {
  const goToBack = () => onNavigate(Navigate.PREVIOUS);
  const goToNext = () => onNavigate(Navigate.NEXT);
  const goToCurrent = () => onNavigate(Navigate.TODAY);

  const getHeaderText = () => {
    if (view === Views.DAY) {
      return format(date, "EEEE, d 'de' MMMM, yyyy", { locale: es });
    }
    return format(date, 'MMMM yyyy', { locale: es });
  };

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-4 mb-5 pb-4 border-b">
      <div className="flex items-center gap-2 px-1 w-full md:w-auto">
        <CalendarIcon className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold capitalize tracking-tight text-slate-800 dark:text-slate-100">
          {getHeaderText()}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
        <div className="flex items-center justify-between sm:justify-start bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
          <Button variant="ghost" size="icon" onClick={goToBack} className="h-9 w-9 hover:bg-white dark:hover:bg-slate-700 shadow-sm cursor-pointer">
            <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToCurrent} className="h-9 px-5 font-semibold text-sm hover:bg-white dark:hover:bg-slate-700 shadow-sm cursor-pointer">
            Hoy
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNext} className="h-9 w-9 hover:bg-white dark:hover:bg-slate-700 shadow-sm cursor-pointer">
            <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </Button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Select value={view} onValueChange={(val) => onView(val)}>
            <SelectTrigger className="w-full sm:w-[130px] h-10 bg-background shadow-sm cursor-pointer font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="cursor-pointer font-medium" value={Views.MONTH}>Mes</SelectItem>
              <SelectItem className="cursor-pointer font-medium" value={Views.WEEK}>Semana</SelectItem>
              <SelectItem className="cursor-pointer font-medium" value={Views.DAY}>Día</SelectItem>
            </SelectContent>
          </Select>

          {extraAction && (
            <div className="w-full sm:w-auto shrink-0">
              {extraAction}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// 2. COMPONENTE DE CONTENIDO (Hora + Dot arriba, Paciente abajo)
const CustomEventContent = ({ event }: { event: any }) => {
  const dotColor = statusDotColors[event.status] || '#94a3b8';
  const isCancelled = event.status === 'cancelled';
  
  // Formateamos la hora para que diga Ej. "09:30 - 10:00"
  // Aseguramos que sea un objeto Date válido
  const startTime = format(new Date(event.start), 'HH:mm');
  const endTime = format(new Date(event.end), 'HH:mm');

  return (
    <div 
      className={cn(
        "flex flex-col w-full h-full justify-start overflow-hidden",
        isCancelled && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between gap-1 w-full mb-0.5">
        <span className="font-semibold text-[9px] tracking-tight text-slate-600 dark:text-slate-300 truncate">
          {startTime} - {endTime}
        </span>
        
        <div 
          className="h-2 w-2 rounded-full shrink-0 shadow-sm border border-white/60"
          style={{ backgroundColor: dotColor }}
          title={`Estatus: ${event.status}`}
        />
      </div>

      <span 
        className={cn(
          "font-bold text-[10px] sm:text-xs text-slate-900 dark:text-slate-100 truncate leading-none",
          isCancelled && "line-through text-slate-400 dark:text-slate-500"
        )}
      >
        {event.patient?.name || event.title || 'Paciente'}
      </span>
    </div>
  );
};

export default function AppointmentCalendar({ events, onSelectSlot, onSelectEvent, toolbarAction }: BigCalendarProps) {
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);
  const onView = useCallback((newView: View) => setView(newView), [setView]);
  const minTime = new Date(2026, 0, 1, 9, 0, 0);
  const maxTime = new Date(2026, 0, 1, 20, 0, 0);

  const components = useMemo(() => ({
    toolbar: (props: any) => <CustomToolbar {...props} extraAction={toolbarAction} />,

    event: CustomEventContent
  }), [toolbarAction]);


  // 4. ESTILOS DEL CONTENEDOR 
  const eventStyleGetter = (event: any) => {
    const doctorColor = event.doctor?.color || '#3b82f6';
    const isCancelled = event.status === 'cancelled';
    
    const customStyle: CSSProperties = {
      backgroundColor: `${doctorColor}${isCancelled ? '10' : '18'}`, 
      color: '#0f172a',
      borderRadius: '6px',
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid', 
      borderLeftColor: doctorColor, 
      borderTopColor: `${doctorColor}25`, 
      borderRightColor: `${doctorColor}25`,
      borderBottomColor: `${doctorColor}25`,
      padding: '2px 4px', // Padding ajustado para permitir dos líneas
      display: 'flex',
      flexDirection: 'column', // Forzamos la estructura en columna
    };

    return {
      className: cn(
        "border rounded-md shadow-sm transition-all hover:brightness-95 overflow-hidden outline-none",
        isCancelled && "!border-red-200 dark:!border-red-900/40" 
      ),
      style: customStyle
    };
  };

  useEffect(() => {
    if (window.innerWidth < 768) {
      setView(Views.DAY);
    }
  }, []);

  const calendarStyles = `
    .rbc-calendar {
      height: 90% !important;
      display: flex;
      flex-direction: column;
    }
    
    .rbc-time-view {
      flex: 1 1 0%;
      min-height: 0 !important; 
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      overflow: hidden;
    }

    .rbc-time-header {
      flex: none !important;
      margin-right: 0 !important;
    }

    .rbc-time-header.rbc-overflowing {
      border-right: none !important;
    }
    
    .rbc-time-content {
      flex: 1 1 0% !important;
      overflow-y: auto !important;
    }

    .rbc-timeslot-group {
      min-height: 50px !important; 
      flex-flow: row wrap !important; 
    }
    
    .rbc-today {
      background: linear-gradient(
        to bottom,
        color-mix(in srgb, var(--primary), transparent 95%) 0%, 
        color-mix(in srgb, var(--primary), transparent 90%) 100%
      ) !important;
      border: 0.5px solid color-mix(in srgb, var(--primary), transparent 85%) !important;
    }
    
    .view-week .rbc-time-view, 
    .view-month .rbc-month-view {
      min-width: 800px !important;
    }
    
    .view-day .rbc-time-view {
      min-width: 100% !important;
    }

    .rbc-header {
      padding: 8px 4px !important;
      font-weight: 600 !important;
      text-transform: capitalize;
    }

    .rbc-time-gutter {
      font-size: 11px !important;
      font-weight: 500;
      color: hsl(var(--muted-foreground));
    }

    .rbc-event:focus {
      outline: none !important;
    }
    
    .hide-scroll::-webkit-scrollbar, 
    .rbc-time-content::-webkit-scrollbar {
      height: 6px;
      width: 6px;
    }
    .hide-scroll::-webkit-scrollbar-thumb, 
    .rbc-time-content::-webkit-scrollbar-thumb {
      background: hsl(var(--muted));
      border-radius: 10px;
    }

    .rbc-event-label, 
    .rbc-event-time {
      display: none !important;
    }
  `;

  return (
    <>
      <style>{calendarStyles}</style>
      <div className="flex flex-col h-[calc(100vh-140px)] min-h-[500px] w-full bg-card rounded-xl border border-border shadow-sm p-4 sm:p-5">
        <div className="flex-1 w-full overflow-x-auto hide-scroll">
          <div className="h-full min-w-full">
            <Calendar
              className={cn(`view-${view}`, "font-sans")}
              localizer={localizer}
              events={events}
              date={date}
              view={view}
              onNavigate={onNavigate}
              onView={onView}
              startAccessor={(event) => new Date(event.start)}
              endAccessor={(event) => new Date(event.end)}
              culture='es'
              messages={{
                next: "Sig",
                previous: "Ant",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                date: "Fecha",
                time: "Hora",
                event: "Cita",
                noEventsInRange: "Sin citas en este rango",
              }}
              components={components}
              selectable
              onSelectSlot={onSelectSlot}
              onSelectEvent={onSelectEvent}
              eventPropGetter={eventStyleGetter}
              defaultView={Views.WEEK}
              min={minTime}
              max={maxTime}
              style={{ height: '100%' }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
import React, { useState, useCallback, useEffect, useMemo, CSSProperties } from 'react';
import { Calendar, dateFnsLocalizer, View, Views, Navigate } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
    }
    return format(date, 'MMMM yyyy', { locale: es });
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between w-full px-2 py-3 mb-2">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={goToCurrent}
          className="rounded-full px-6 h-9 font-medium shadow-none border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
        >
          Hoy
        </Button>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={goToBack} className="h-9 w-9 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNext} className="h-9 w-9 rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer">
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <span className="text-[22px] font-normal tracking-tight text-slate-800 dark:text-slate-100 ml-2">
          {getHeaderText()}
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 sm:gap-3 w-full md:w-auto mt-2 md:mt-0">
        {extraAction && (
          <div className="flex items-center shrink-0">
            {extraAction}
          </div>
        )}
        <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
        <Select value={view} onValueChange={(val) => onView(val)}>
          <SelectTrigger className="w-25 sm:w-27.5 h-9 rounded-md bg-transparent border-slate-300 shadow-none font-medium focus:ring-0 dark:border-slate-700 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className='cursor-pointer' value={Views.MONTH}>Mes</SelectItem>
            <SelectItem className='cursor-pointer' value={Views.WEEK}>Semana</SelectItem>
            <SelectItem className='cursor-pointer' value={Views.DAY}>Día</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const CustomMonthHeader = ({ label }: any) => {
  return (
    <div className="py-2 text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}
    </div>
  );
};

const CustomHeader = ({ date }: any) => {
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const dayName = format(date, 'EEE', { locale: es }).substring(0, 3).toUpperCase();
  const dayNumber = format(date, 'd');

  return (
    <div className="flex flex-col items-center justify-center py-2 gap-1.5">
      <span className={cn(
        "text-[11px] font-medium uppercase tracking-wider",
        isToday ? "text-[#1a73e8] dark:text-[#8ab4f8]" : "text-slate-500 dark:text-slate-400"
      )}>
        {dayName}
      </span>
      <div className={cn(
        "text-2xl font-normal flex items-center justify-center w-11 h-11 rounded-full transition-colors",
        isToday
          ? "bg-[#1a73e8] text-white dark:bg-[#8ab4f8] dark:text-slate-900"
          : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-default"
      )}>
        {dayNumber}
      </div>
    </div>
  );
};

const CustomEventContent = ({ event }: { event: any }) => {
  const dotColor = statusDotColors[event.status] || '#94a3b8';
  const isCancelled = event.status === 'cancelled';
  const startTime = format(new Date(event.start), 'HH:mm');
  const endTime = format(new Date(event.end), 'HH:mm');

  return (
    <div className={cn("flex flex-col w-full h-full justify-center overflow-hidden", isCancelled && "opacity-60")}>
      <div className="flex items-center justify-between gap-1 w-full mb-0.5">
        <div
          className="h-1.5 w-1.5 rounded-full shrink-0 shadow-sm border border-white/40"
          style={{ backgroundColor: dotColor }}
          title={`Estatus: ${event.status}`}
        />
        <span className={cn(
          "font-bold text-[10px] sm:text-xs text-slate-900 dark:text-slate-100 truncate leading-tight",
          isCancelled && "line-through text-slate-400 dark:text-slate-500"
        )}
        >
          {event.patient?.name || event.title || 'Paciente'}
        </span>
      </div>
      {/* <span className="font-semibold text-[9px] tracking-tight text-slate-700 dark:text-slate-300 truncate">
        {startTime} - {endTime}
      </span> */}
    </div>
  );
};

export default function AppointmentCalendar({ events, onSelectSlot, onSelectEvent, toolbarAction }: BigCalendarProps) {
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());

  const onNavigate = useCallback((newDate: Date) => setDate(newDate), [setDate]);
  const onView = useCallback((newView: View) => setView(newView), [setView]);
  const minTime = new Date(2026, 0, 1, 8, 0, 0);
  const maxTime = new Date(2026, 0, 1, 21, 0, 0);

  const components = useMemo(() => ({
    toolbar: (props: any) => <CustomToolbar {...props} extraAction={toolbarAction} />,

    week: { header: CustomHeader, },
    day: { header: CustomHeader, },
    month: { header: CustomMonthHeader, },
    event: CustomEventContent
  }), [toolbarAction]);

  const eventStyleGetter = (event: any) => {
    const doctorColor = event.doctor?.color || '#3b82f6';
    const isCancelled = event.status === 'cancelled';

    const customStyle: CSSProperties = {
      backgroundColor: `${doctorColor}${isCancelled ? '15' : '25'}`,
      color: '#0f172a',
      borderRadius: '4px',
      borderLeftWidth: '4px',
      borderLeftStyle: 'solid',
      borderLeftColor: doctorColor,
      border: 'none',
      borderLeft: `4px solid ${doctorColor}`,
      padding: '2px 6px',
      display: 'flex',
      flexDirection: 'column',
    };

    return {
      className: "shadow-sm transition-all hover:brightness-95 overflow-hidden outline-none mx-0.5 mt-0.5",
      style: customStyle
    };
  };

  useEffect(() => {
    if (window.innerWidth < 768) setView(Views.DAY);
  }, []);

  const calendarStyles = `
    .rbc-calendar {
      height: 100% !important;
      display: flex;
      flex-direction: column;
      background: transparent;
    }
    
    .rbc-time-view {
      flex: 1 1 0%;
      border: none !important;
    }

    .rbc-time-header {
      border-bottom: 1px solid #e2e8f0 !important;
    }

    .dark .rbc-time-header {
      border-bottom: 1px solid #1e293b !important;
    }

    .rbc-time-header.rbc-overflowing {
      border-right: none !important;
    }
    
    .rbc-time-gutter {
      font-size: 10px !important;
      color: #70757a !important;
      text-transform: uppercase;
      font-weight: 500;
    }

    .dark .rbc-time-gutter {
      color: #94a3b8 !important;
    }

    .rbc-time-gutter .rbc-timeslot-group {
      border-bottom: none !important;
    }

    .rbc-timeslot-group {
      border-bottom: 1px solid #e2e8f0 !important;
      min-height: 48px !important; 
    }

    .rbc-day-bg {
      border-left: 1px solid #e2e8f0 !important;
    }

    .dark .rbc-timeslot-group,
    .dark .rbc-day-bg {
      border-color: #1e293b !important;
    }
    
    .rbc-today {
      background-color: transparent !important;
    }

    .rbc-current-time-indicator {
      background-color: #ea4335 !important;
      height: 2px !important;
      z-index: 3 !important;
    }
    
    .rbc-current-time-indicator::before {
      content: '';
      position: absolute;
      left: -5px;
      top: -4px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: #ea4335;
    }

    .view-week .rbc-time-view, 
    .view-month .rbc-month-view {
      min-width: 800px !important;
    }

    .rbc-allday-cell {
      display: none !important;
    }

    .rbc-time-header-content > .rbc-row:nth-child(2) {
      display: none !important;
    }

    .rbc-header {
      border: none !important;
      padding: 4px 0 4px 0 !important;
      min-height: 75px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .rbc-time-header {
      border-bottom: 1px solid #e2e8f0 !important;
    }
    .dark .rbc-time-header {
      border-bottom-color: #1e293b !important;
    }

    .rbc-time-content {
      border-top: none !important;
      flex: 1 1 0% !important;
      overflow-y: auto !important;
    }

    .rbc-event:focus {
      outline: none !important;
    }
    
    .rbc-time-content::-webkit-scrollbar {
      width: 8px;
    }
    .rbc-time-content::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }
    .dark .rbc-time-content::-webkit-scrollbar-thumb {
      background: #334155;
    }

    .rbc-event-label, 
    .rbc-event-time {
      display: none !important;
    }
  `;

  return (
    <>
      <style>{calendarStyles}</style>
      <div className="flex flex-col h-full w-full">
        <div className="flex-1 w-full overflow-x-auto hide-scroll px-2 pb-2">
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
              formats={{
                timeGutterFormat: (date, culture, localizer) => localizer!.format(date, 'h a', culture),
              }}
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
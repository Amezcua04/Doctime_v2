import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock, AlertCircle, Save, Loader2 } from 'lucide-react';
import { DayRow, DayConfig, TimeSlot } from './day-row';

const DAYS_MAP = [
  { id: 1, label: 'Lunes' },
  { id: 2, label: 'Martes' },
  { id: 3, label: 'Miércoles' },
  { id: 4, label: 'Jueves' },
  { id: 5, label: 'Viernes' },
  { id: 6, label: 'Sábado' },
  { id: 0, label: 'Domingo' },
];

interface Props {
  schedules: Record<string, { start_time: string, end_time: string }[]>;
}

export default function ScheduleEditor({ schedules }: Props) {

  const getInitialSchedule = (): DayConfig[] => {
    return DAYS_MAP.map(day => {
      const savedSlots = schedules[day.id.toString()] || [];
      return {
        day_of_week: day.id,
        label: day.label,
        enabled: savedSlots.length > 0,
        slots: savedSlots.length > 0
          ? savedSlots.map(s => ({ start_time: s.start_time.substring(0, 5), end_time: s.end_time.substring(0, 5) }))
          : [{ start_time: '09:00', end_time: '14:00' }]
      };
    });
  };

  const { data, setData, post, processing, errors } = useForm({
    schedule: getInitialSchedule()
  });

  const toggleDay = (idx: number) => {
    const newSched = [...data.schedule];
    newSched[idx].enabled = !newSched[idx].enabled;
    setData('schedule', newSched);
  };

  const addSlot = (idx: number) => {
    const newSched = [...data.schedule];
    const lastSlot = newSched[idx].slots[newSched[idx].slots.length - 1];

    let nextStart = '16:00';
    let nextEnd = '20:00';
    if (lastSlot && parseInt(lastSlot.end_time) >= 16) {
      nextStart = '21:00'; nextEnd = '23:00';
    } else if (lastSlot && parseInt(lastSlot.end_time) < 12) {
      nextStart = '14:00'; nextEnd = '18:00';
    }

    newSched[idx].slots.push({ start_time: nextStart, end_time: nextEnd });
    setData('schedule', newSched);
  };

  const removeSlot = (dIdx: number, sIdx: number) => {
    const newSched = [...data.schedule];
    newSched[dIdx].slots.splice(sIdx, 1);
    setData('schedule', newSched);
  };

  const updateSlot = (dIdx: number, sIdx: number, field: keyof TimeSlot, val: string) => {
    const newSched = [...data.schedule];
    newSched[dIdx].slots[sIdx][field] = val;
    setData('schedule', newSched);
  };

  const submitSchedule = () => {
    post('/my-schedule', { preserveScroll: true });
  };

  return (
    <div className="space-y-6">

      {Object.keys(errors).length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-sm flex gap-3 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Por favor revisa los siguientes errores:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs opacity-90">
              {Object.values(errors).map((e: any, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3 border-b bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Semana laboral típica
            </CardTitle>
            <CardDescription>
              Activa los días que trabajas y añade múltiples turnos.
            </CardDescription>
          </div>
          <Button
            onClick={submitSchedule}
            disabled={processing}
            size="sm"
            className="shadow-sm cursor-pointer"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Guardar horario
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {data.schedule.map((day, index) => (
            <DayRow
              key={day.day_of_week}
              day={day}
              dayIndex={index}
              onToggle={toggleDay}
              onAddSlot={addSlot}
              onRemoveSlot={removeSlot}
              onUpdateSlot={updateSlot}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
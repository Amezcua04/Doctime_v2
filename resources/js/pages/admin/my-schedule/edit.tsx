import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Absence } from '@/types';
import ScheduleEditor from '@/components/admin/mySchedule/schedule-editor';
import AbsenceManager from '@/components/admin/mySchedule/absence-manager';

interface Props {
  schedules: Record<string, { start_time: string, end_time: string }[]>;
  absences: Absence[];
}

export default function MyScheduleIndex({ schedules, absences }: Props) {
  return (
    <>
      <Head title="Mi horario" />
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 p-4 md:p-6 lg:p-4">

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Configuración de disponibilidad</h1>
          <p className="text-sm text-muted-foreground">Define tus días laborales, turnos y periodos de ausencia.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          <div className="lg:col-span-2">
            <ScheduleEditor schedules={schedules} />
          </div>

          <div>
            <AbsenceManager absences={absences} />
          </div>
        </div>

      </div>
    </>
  );
}

MyScheduleIndex.layout = {
  breadcrumbs: [
    {
      title: 'Mi horario',
      href: '/my-schedule',
    },
  ],
};
import React, { useState, useMemo, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppointmentCalendar from '@/components/admin/appointments/big-calendar';
import { AppointmentModal } from '@/components/admin/appointments/appointment-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { User, Patient, Service, PaymentMethod, RawAppointmentEvent, CalendarEvent } from '@/types';
import { toast } from 'sonner';
import { useEcho } from '@laravel/echo-react';
import { DoctorFilter } from '@/components/admin/appointments/doctor-filter';
import { BillingModal } from '@/components/admin/appointments/billing-modal';

interface Props {
  events: RawAppointmentEvent[];
  patients: Patient[];
  doctors: User[];
  services: Service[];
  paymentMethods: PaymentMethod[];
}

const forceExactTime = (dateString: string) => {
  if (!dateString) return new Date();

  const parts = dateString.match(/(\d+)/g);
  if (!parts || parts.length < 5) return new Date(dateString);

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const hour = parseInt(parts[3], 10);
  const minute = parseInt(parts[4], 10);

  return new Date(year, month, day, hour, minute, 0);
};

export default function AppointmentsIndex({ events, patients, doctors, services, paymentMethods }: Props) {
  const { auth } = usePage<{ auth: { user: User } }>().props;

  const [localEvents, setLocalEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const formattedEvents = events.map(event => ({
      ...event,
      start: forceExactTime(event.start as any),
      end: forceExactTime(event.end as any),
    }));

    setLocalEvents(formattedEvents as any);

    setSelectedEvent(prev => {
      if (!prev) return null;
      return (formattedEvents.find(e => e.id === prev.id) as any) || prev;
    });
  }, [events]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date, end: Date } | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<number[]>([]);

  const filteredEvents = useMemo(() => {
    if (selectedDoctorIds.length === 0) return localEvents;
    return localEvents.filter(evt => selectedDoctorIds.includes(evt.doctor_id));
  }, [localEvents, selectedDoctorIds]);

  useEcho(
    'appointments',
    '.appointment.updated',
    (e: any) => {
      const { action, appointment, causedByUserId } = e;

      const currentUserId = auth.user.id;
      const isRelevant = doctors.some(doc => String(doc.id) === String(appointment.doctor_id));

      if (!isRelevant) return;

      const relatedDoctor = doctors.find(d => String(d.id) === String(appointment.doctor_id));
      const relatedPatient = patients.find(p => String(p.id) === String(appointment.patient_id));

      const processedEvent: any = {
        ...appointment,
        title: appointment.title || relatedPatient?.name,
        start: forceExactTime(appointment.start_time || appointment.start),
        end: forceExactTime(appointment.end_time || appointment.end),
        status: appointment.status,
        patient: appointment.patient || (relatedPatient ? { id: relatedPatient.id, name: relatedPatient.name } : null),
        doctor: appointment.doctor || (relatedDoctor ? { id: relatedDoctor.id, name: relatedDoctor.name, color: relatedDoctor.color } : null),
        services: appointment.services || [],
        payments: appointment.payments || [],
        total: appointment.total,
        paid_amount: appointment.paid_amount,
        balance: appointment.balance,
        payment_status: appointment.payment_status
      };

      setLocalEvents((prevEvents) => {
        if (action === 'created') {
          if (prevEvents.some(ev => ev.id === processedEvent.id)) return prevEvents;
          return [...prevEvents, processedEvent];
        }

        if (action === 'updated') {
          return prevEvents.map(ev =>
            ev.id === processedEvent.id ? processedEvent : ev
          );
        }

        if (action === 'deleted') {
          return prevEvents.filter(ev => ev.id !== processedEvent.id);
        }

        return prevEvents;
      });

      setSelectedEvent((prevSelected) => {
        if (!prevSelected || prevSelected.id !== processedEvent.id) return prevSelected;
        if (action === 'deleted') return null;
        return processedEvent;
      });
    }
  );

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedSlot(slotInfo);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const handleNewAppointment = () => {
    const now = new Date();
    if (now.getMinutes() > 30) {
      now.setHours(now.getHours() + 1);
      now.setMinutes(0, 0, 0);
    } else {
      now.setMinutes(30, 0, 0);
    }

    const end = new Date(now.getTime() + 30 * 60000);

    setSelectedSlot({ start: now, end: end });
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  return (
    <>
      <Head title="Agenda" />
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 p-4 md:p-6 lg:p-4">

        <div className="flex-1 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-0">
          <AppointmentCalendar
            events={filteredEvents}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            toolbarAction={
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  onClick={handleNewAppointment}
                  className="rounded-full shadow-none hover:shadow-sm transition-all px-3 sm:px-4 h-9 bg-primary text-primary-foreground cursor-pointer"
                >
                  <Plus className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline font-medium">Crear cita</span>
                </Button>

                <DoctorFilter
                  doctors={doctors}
                  selectedIds={selectedDoctorIds}
                  onChange={setSelectedDoctorIds}
                />
              </div>
            }
          />
        </div>

        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onOpenBilling={() => {
            setIsModalOpen(false);
            setIsBillingModalOpen(true);
          }}
          selectedSlot={selectedSlot}
          selectedEvent={selectedEvent}
          patients={patients}
          doctors={doctors}
        />
        <BillingModal
          isOpen={isBillingModalOpen}
          onClose={() => setIsBillingModalOpen(false)}
          onBack={() => {
            setIsBillingModalOpen(false);
            setIsModalOpen(true);
          }}
          appointment={selectedEvent}
          availableServices={services}
          paymentMethods={paymentMethods}
        />
      </div>
    </>
  );
}

AppointmentsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Agenda',
      href: '/admin/appointments',
    },
  ],
};
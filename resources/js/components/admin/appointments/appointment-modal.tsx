import React, { useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Loader2, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { User, Patient } from '@/types';
import { AppointmentForm } from './appointment-form';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenBilling: () => void;
  selectedSlot: { start: Date, end: Date } | null;
  selectedEvent: any | null;
  patients: Patient[];
  doctors: User[];
}

export const AppointmentModal = ({
  isOpen, onClose, onOpenBilling, selectedSlot, selectedEvent, patients, doctors
}: Props) => {
  const { auth } = usePage<{ auth: { user: User } }>().props;
  const isEdit = !!selectedEvent;
  const isAuthDoctor = auth.user.roles?.some(r => r.name === 'doctor');

  const form = useForm({
    patient_id: '',
    doctor_id: '',
    date: '',
    start_time: '',
    end_time: '',
    notes: '',
    status: 'scheduled'
  });

  useEffect(() => {
    if (isOpen) {
      form.clearErrors();
      if (selectedEvent) {
        const start = new Date(selectedEvent.start);
        const end = new Date(selectedEvent.end);
        form.setData({
          patient_id: selectedEvent.patient_id.toString(),
          doctor_id: selectedEvent.doctor_id.toString(),
          date: format(start, 'yyyy-MM-dd'),
          start_time: format(start, 'HH:mm'),
          end_time: format(end, 'HH:mm'),
          notes: selectedEvent.notes || '',
          status: selectedEvent.status
        });
      } else if (selectedSlot) {
        form.setData({
          patient_id: '',
          doctor_id: isAuthDoctor ? auth.user.id.toString() : '',
          date: format(selectedSlot.start, 'yyyy-MM-dd'),
          start_time: format(selectedSlot.start, 'HH:mm'),
          end_time: format(selectedSlot.end, 'HH:mm'),
          notes: '',
          status: 'scheduled'
        });
      }
    }
  }, [isOpen, selectedEvent, selectedSlot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEdit ? `/admin/appointments/${selectedEvent.id}` : '/admin/appointments';
    const method = isEdit ? form.put : form.post;

    method(url, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg sm:max-w-[600px] p-0 gap-0 overflow-hidden bg-background text-foreground border-border rounded-xl sm:rounded-2xl">

        <DialogHeader className="px-4 sm:px-6 py-4 border-b bg-muted/30 shrink-0">
          <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl font-semibold">
            <div className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-primary/10 shadow-sm border border-primary/10">
              <Calendar className="h-5 w-5 sm:h-4 sm:w-4 text-primary" />
            </div>
            {isEdit ? 'Gestionar cita' : 'Nueva cita médica'}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-5 max-h-[65vh] sm:max-h-[75vh] overflow-y-auto">
          <form id="appt-form" onSubmit={handleSubmit} className="space-y-4">
            <AppointmentForm
              data={form.data}
              setData={form.setData}
              errors={form.errors}
              patients={patients}
              doctors={doctors}
              isAuthDoctor={isAuthDoctor}
              isEdit={isEdit}
            />
          </form>
        </div>

        <DialogFooter className="px-4 sm:px-6 py-4 border-t bg-muted/10 shrink-0 flex flex-col sm:flex-row gap-3 sm:justify-between items-center">
          <div className="w-full sm:w-auto flex-1 order-3 sm:order-none mt-2 sm:mt-0">
            {isEdit && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  onClose();
                  onOpenBilling();
                }}
                className="w-full sm:w-auto cursor-pointer border shadow-sm bg-background hover:bg-muted font-medium text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30"
              >
                <Receipt className="mr-2 h-4 w-4" />
                Cobros y servicios
              </Button>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full sm:w-auto order-1 sm:order-none">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={form.processing}
              className="w-full sm:w-auto cursor-pointer shadow-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              form="appt-form"
              disabled={form.processing}
              className="sm:min-w-[140px] cursor-pointer shadow-md font-semibold"
            >
              {form.processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                isEdit ? 'Actualizar' : 'Guardar cita'
              )}
            </Button>
          </div>

        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
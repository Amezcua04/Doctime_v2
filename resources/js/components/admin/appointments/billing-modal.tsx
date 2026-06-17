import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AppointmentBilling } from './appointment-billing';
import { Receipt, ArrowLeft } from 'lucide-react';
import { PaymentMethod } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  appointment: any | null;
  availableServices: any[];
  paymentMethods: PaymentMethod[];
}

export const BillingModal = ({ isOpen, onClose, onBack, appointment, availableServices, paymentMethods }: Props) => {
  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-full sm:max-w-[850px] p-0 gap-0 overflow-hidden bg-background text-foreground border-border rounded-xl sm:rounded-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b bg-muted/30 shrink-0">
          <DialogTitle className="flex items-center gap-3 text-lg sm:text-xl font-semibold">
            <div className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-emerald-500/10 shadow-sm border border-emerald-500/20">
              <Receipt className="h-5 w-5 sm:h-4 sm:w-4 text-emerald-600" />
            </div>
            <span className="truncate">Estado de Cuenta - {appointment.title || 'Paciente'}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5">
          <AppointmentBilling
            appointment={appointment}
            availableServices={availableServices}
            paymentMethods={paymentMethods}
          />
        </div>

        <DialogFooter className="px-4 sm:px-6 py-4 border-t bg-muted/10 shrink-0 flex flex-col-reverse sm:flex-row gap-3 sm:justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="w-full sm:w-auto cursor-pointer shadow-sm hover:bg-muted font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Regresar a la cita
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto cursor-pointer shadow-md font-semibold bg-primary hover:bg-primary/90"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
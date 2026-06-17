import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity } from 'lucide-react';

// DICCIONARIO DE COLUMNAS (Agrega aquí las columnas de tu BD)
const KEY_DICTIONARY: Record<string, string> = {
  name: 'Nombre',
  email: 'Correo Electrónico',
  phone: 'Teléfono',
  status: 'Estatus',
  start_time: 'Fecha y Hora de Inicio',
  end_time: 'Fecha y Hora de Fin',
  doctor_id: 'Doctor Asignado',
  patient_id: 'Paciente',
  created_by: 'Creado por',
  amount: 'Monto Total',
  payment_method: 'Método de Pago',
  notes: 'Notas / Observaciones',
  birth_date: 'Fecha de Nacimiento',
  uuid: 'Identificador Único (UUID)',
};

// DICCIONARIO DE VALORES ESTÁTICOS
const VALUE_DICTIONARY: Record<string, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  completed: 'Completada',
  no_show: 'No Asistió',
  arrived: 'En Espera',
  in_progress: 'En Consulta',
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
};

interface AuditDetailsModalProps {
  log: any | null;
  onClose: () => void;
}

export function AuditDetailsModal({ log, onClose }: AuditDetailsModalProps) {

  const getChangedKeys = () => {
    if (!log?.properties) return [];
    const attributes = log.properties.attributes || {};
    const old = log.properties.old || {};
    return Array.from(new Set([...Object.keys(attributes), ...Object.keys(old)]));
  };

  const translateKey = (key: string) => KEY_DICTIONARY[key] || key;
  const translateValue = (val: any) => {
    if (val === undefined || val === null) return 'N/A';
    const strVal = String(val);
    return VALUE_DICTIONARY[strVal] || strVal;
  };

  const changedKeys = getChangedKeys();
  const isCreated = log?.event === 'created';
  const isDeleted = log?.event === 'deleted';
  const isUpdated = log?.event === 'updated';

  return (
    <Dialog open={!!log} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" /> Detalles del Evento
          </DialogTitle>
          <DialogDescription>
            {log?.description} — Realizado por {log?.causer?.name || 'Sistema'} el {log?.created_at}.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] mt-4 rounded-md border">
          {changedKeys.length > 0 ? (
            <div className="p-4 bg-muted/30">
              <div className="space-y-4">
                {changedKeys.map((key) => {
                  if (key === 'password' || key === 'remember_token' || key === 'updated_at') return null;

                  const newValue = log?.properties?.attributes?.[key];
                  const oldValue = log?.properties?.old?.[key];

                  if (isUpdated && JSON.stringify(oldValue) === JSON.stringify(newValue)) return null;

                  const displayKey = translateKey(key);
                  const displayOld = translateValue(oldValue);
                  const displayNew = translateValue(newValue);

                  return (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4 last:border-0">

                      {!isCreated && (
                        <div className={isDeleted ? "md:col-span-2" : ""}>
                          <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                            {isDeleted ? `Dato eliminado (${displayKey})` : `Valor anterior (${displayKey})`}
                          </p>
                          <div className="bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-300 p-2 rounded-md font-mono text-sm break-all">
                            {displayOld}
                          </div>
                        </div>
                      )}

                      {!isDeleted && (
                        <div className={isCreated ? "md:col-span-2" : ""}>
                          <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                            {isCreated ? `Valor inicial (${displayKey})` : `Nuevo valor (${displayKey})`}
                          </p>
                          <div className="bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 p-2 rounded-md font-mono text-sm break-all">
                            {displayNew}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No hay propiedades detalladas para este evento.
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
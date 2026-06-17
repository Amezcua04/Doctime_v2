import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Briefcase, Plus, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DeleteModal } from '@/components/shared/delete-modal';

export interface Absence {
  id: number;
  start_date: string;
  end_date: string;
  reason: string | null;
}

interface Props {
  absences: Absence[];
}

export default function AbsenceManager({ absences }: Props) {
  const [absenceToDelete, setAbsenceToDelete] = useState<Absence | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data,
    setData,
    post,
    processing,
    reset,
    errors,
    clearErrors
  } = useForm({
    start_date: '',
    end_date: '',
    reason: ''
  });

  const saveAbsence = (e: React.FormEvent) => {
    e.preventDefault();
    post('/my-schedule/absences', {
      onSuccess: () => {
        reset();
        clearErrors();
      },
      preserveScroll: true
    });
  };

  const confirmDeleteAbsence = () => {
    if (!absenceToDelete) return;

    setIsDeleting(true);

    router.delete(`/my-schedule/absences/${absenceToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setAbsenceToDelete(null);
      },
      onFinish: () => {
        setIsDeleting(false);
      }
    });
  };

  const parseLocalDate = (dateString: string) => {
    if (!dateString) return new Date();
    const cleanDate = dateString.split('T')[0];
    const [year, month, day] = cleanDate.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getAbsenceDateRange = (absence: Absence | null) => {
    if (!absence) return '';
    const start = format(parseLocalDate(absence.start_date), "d 'de' MMMM", { locale: es });
    const end = format(parseLocalDate(absence.end_date), "d 'de' MMMM", { locale: es });

    return absence.start_date === absence.end_date
      ? `el ${start}`
      : `del ${start} al ${end}`;
  };

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-sm font-bold tracking-wide flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" /> Registrar ausencia
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <form onSubmit={saveAbsence} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Desde</Label>
                <div className="relative">
                  <Input
                    type="date"
                    className="h-9 text-xs cursor-pointer bg-background"
                    value={data.start_date}
                    onChange={e => setData('start_date', e.target.value)}
                    required
                  />
                </div>
                {errors.start_date && <p className="text-[10px] text-destructive">{errors.start_date}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Hasta</Label>
                <Input
                  type="date"
                  className="h-9 text-xs cursor-pointer bg-background"
                  value={data.end_date}
                  onChange={e => setData('end_date', e.target.value)}
                  required
                />
                {errors.end_date && <p className="text-[10px] text-destructive">{errors.end_date}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Motivo (opcional)</Label>
              <Input
                placeholder="Ej. Vacaciones, Congreso..."
                className="h-9 text-xs bg-background"
                value={data.reason}
                onChange={e => setData('reason', e.target.value)}
              />
            </div>

            <Button
              type="submit"
              size="sm"
              className="w-full mt-2 cursor-pointer"
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Agregando...
                </>
              ) : (
                <>
                  <Plus className="h-3.5 w-3.5 mr-2" />
                  Bloquear fechas
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="flex flex-col overflow-hidden h-[500px]">
        <CardHeader className="py-4 px-5 border-b bg-muted/10 shrink-0">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Próximas ausencias</span>
            <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{absences.length}</span>
          </CardTitle>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {absences.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <div className="h-10 w-10 bg-muted/50 rounded-full flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 opacity-30" />
                </div>
                <p className="text-xs">No hay ausencias programadas</p>
              </div>
            ) : (
              absences.map((absence) => (
                <div key={absence.id} className="group bg-card border border-border p-3 rounded-lg shadow-sm hover:border-primary/30 transition-all flex justify-between items-start relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400/50 rounded-l-lg"></div>
                  <div className="pl-2">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <span>{format(parseLocalDate(absence.start_date), "d MMM", { locale: es })}</span>
                      {absence.start_date !== absence.end_date && (
                        <>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span>{format(parseLocalDate(absence.end_date), "d MMM", { locale: es })}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <span className="bg-muted px-1.5 rounded text-[10px] uppercase tracking-wide">
                        {format(parseISO(absence.start_date), "yyyy")}
                      </span>
                      <span>• {absence.reason || 'Personal'}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setAbsenceToDelete(absence)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-1.5 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      <DeleteModal
        open={!!absenceToDelete}
        onOpenChange={(open) => !open && setAbsenceToDelete(null)}
        onConfirm={confirmDeleteAbsence}
        isDeleting={isDeleting}
        title="Eliminar ausencia"
        contextText="Estás a punto de cancelar el bloqueo de agenda para:"
        itemName={getAbsenceDateRange(absenceToDelete)}
        warningText="Esta acción liberará estas fechas en tu agenda, permitiendo que los pacientes puedan volver a programar citas en estos días."
      />
    </div>
  );
}
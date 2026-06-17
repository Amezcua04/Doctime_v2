import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight, Clock, Phone, CheckCircle, Clock3, Send, Loader2 } from 'lucide-react';

interface UpcomingAgendaProps {
  nextAppointments: any[];
  confirmationList: any[];
  hasRole: (role: string) => boolean;
  quickConfirm: (id: number) => void;
  sendReminder: (id: number) => void;
  sendingId: number | null;
}

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'confirmed': return { label: 'Confirmada', classes: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800', dot: 'bg-emerald-500' };
    case 'arrived': return { label: 'En Espera', classes: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800', dot: 'bg-purple-500' };
    case 'in_progress': return { label: 'En Consulta', classes: 'bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700 animate-pulse', dot: 'bg-indigo-500' };
    case 'cancelled': return { label: 'Cancelada', classes: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', dot: 'bg-red-500' };
    case 'completed': return { label: 'Completada', classes: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700', dot: 'bg-slate-500' };
    case 'no_show': return { label: 'No Asistió', classes: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800', dot: 'bg-amber-500' };
    default: return { label: 'Programada', classes: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800', dot: 'bg-blue-500' };
  }
};

export function UpcomingAgenda({ nextAppointments, confirmationList, hasRole, quickConfirm, sendReminder, sendingId }: UpcomingAgendaProps) {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-2">
      <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-emerald-500 h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex justify-between items-center">
            Próximos pacientes
            {nextAppointments.length > 0 && <Button variant="ghost" size="icon" className="h-6 w-6"><ArrowRight className="h-4 w-4" /></Button>}
          </CardTitle>
          <CardDescription>Visualización general de agenda</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-[250px] w-full px-6 pb-4">
            {nextAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-6 text-muted-foreground">
                <Calendar className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">Todo despejado por hoy.</p>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                {nextAppointments.map((appt) => {
                  const statusConfig = getStatusConfig(appt.status);
                  return (
                    <div key={appt.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                      <div className="space-y-1 overflow-hidden">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium leading-none truncate">{appt.patient_name}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 shrink-0 ${statusConfig.classes}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}></span>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">Dr. {appt.doctor_name}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <div className="flex items-center gap-1 justify-end text-sm font-bold text-slate-700 dark:text-slate-300">
                          <Clock className="h-3 w-3" /> {appt.time}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase">{appt.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {hasRole('assistant') && (
        <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-500 h-full flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-500" /> Por confirmar
            </CardTitle>
            <CardDescription>Citas para mañana</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-[250px] w-full px-6 pb-4">
              {confirmationList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground text-sm">
                  <CheckCircle className="h-10 w-10 mb-3 text-green-500 opacity-20" />
                  ¡Todo confirmado!
                </div>
              ) : (
                <div className="space-y-3 pt-4">
                  {confirmationList.map((item) => (
                    <div key={item.id} className="flex flex-col xl:flex-row xl:items-center justify-between border p-3 rounded-lg bg-card shadow-sm gap-3">
                      <div>
                        <p className="font-medium text-sm">{item.patient}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock3 className="h-3 w-3" /> {item.time} hrs
                        </p>
                        {item.phone && <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">{item.phone}</p>}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto">
                        <Button size="sm" variant="outline" className="h-8 px-3 w-full sm:w-auto cursor-pointer" onClick={() => sendReminder(item.id)} disabled={sendingId === item.id}>
                          {sendingId === item.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1" />}
                          <span className="text-xs">Avisar</span>
                        </Button>

                        <Button size="sm" variant="secondary" className="h-8 text-xs w-full sm:w-auto cursor-pointer" onClick={() => quickConfirm(item.id)}>
                          Confirmar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
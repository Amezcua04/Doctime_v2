import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock3, PlayCircle, Stethoscope } from 'lucide-react';

interface LiveOperationsProps {
  waitingRoom: { id: number; patient: string; time: string; wait_time: string; }[];
  inConsultation: { id: number; patient: string; doctor: string; time: string; duration: string; }[];
  hasRole: (role: string) => boolean;
}

export function LiveOperations({ waitingRoom, inConsultation, hasRole }: LiveOperationsProps) {
  if (!hasRole('doctor') && !hasRole('assistant')) return null;

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 mt-2">
      <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-purple-500 h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-purple-600 dark:text-purple-400" /> Sala de espera
          </CardTitle>
          <CardDescription>Pacientes listos para hoy</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-[250px] w-full px-6 pb-4">
            {waitingRoom.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground text-sm">
                <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-3">
                  <Clock3 className="h-6 w-6 text-purple-400" />
                </div>
                Sala vacía por ahora.
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                {waitingRoom.map((patient) => (
                  <div key={patient.id} className="flex items-center gap-3 border-l-4 border-purple-500 bg-purple-50/50 dark:bg-purple-900/10 p-3 rounded-r-md shadow-sm">
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold text-sm text-foreground truncate">{patient.patient}</p>
                      <p className="text-xs text-purple-700 dark:text-purple-400">Cita: {patient.time}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold uppercase text-purple-600 bg-white dark:bg-purple-950 dark:text-purple-400 px-2 py-1 rounded-full border border-purple-100 dark:border-purple-800 shadow-sm">
                        {patient.wait_time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-300 border-t-4 border-t-indigo-500 h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-indigo-600 animate-pulse" /> En consulta
          </CardTitle>
          <CardDescription>Pacientes siendo atendidos ahora</CardDescription>
        </CardHeader>
        <CardContent className="p-0 flex-1">
          <ScrollArea className="h-[250px] w-full px-6 pb-4">
            {inConsultation.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground text-sm">
                <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center mb-3">
                  <Stethoscope className="h-6 w-6 text-indigo-300" />
                </div>
                Ningún doctor en consulta.
              </div>
            ) : (
              <div className="space-y-3 pt-4">
                {inConsultation.map((patient) => (
                  <div key={patient.id} className="flex items-center gap-3 border-l-4 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10 p-3 rounded-r-md shadow-sm">
                    <div className="flex-1 overflow-hidden">
                      <p className="font-bold text-sm text-foreground truncate">{patient.patient}</p>
                      {hasRole('assistant') && <p className="text-xs text-indigo-700 dark:text-indigo-400 truncate">Dr. {patient.doctor}</p>}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold uppercase text-indigo-600 bg-white dark:bg-indigo-950 dark:text-indigo-400 px-2 py-1 rounded-full border border-indigo-100 dark:border-indigo-800 shadow-sm animate-pulse">
                        {patient.duration}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
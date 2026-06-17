import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarCheck, UserX, Bot } from 'lucide-react';

interface OperationalKpisProps {
  kpis: {
    total_citas: number;
    tasa_cancelacion: number;
    horas_ahorradas_bot: number;
  };
}

export function OperationalKpis({ kpis }: OperationalKpisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Volumen de citas</CardTitle>
          <CalendarCheck className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpis.total_citas}</div>
          <p className="text-xs text-muted-foreground mt-1">Agendadas en el período</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Tasa de cancelación</CardTitle>
          <UserX className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{kpis.tasa_cancelacion}%</div>
          <p className="text-xs text-muted-foreground mt-1">Proporción de inasistencias</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Horas ahorradas (Bot)</CardTitle>
          <Bot className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{kpis.horas_ahorradas_bot} hrs</div>
          <p className="text-xs text-muted-foreground mt-1">Trabajo manual automatizado</p>
        </CardContent>
      </Card>
    </div>
  );
}
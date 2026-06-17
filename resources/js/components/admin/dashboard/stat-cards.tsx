import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, XCircle, Clock } from 'lucide-react';
import { StatCardsProps } from '@/types';

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Citas para hoy</CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.today_appointments}</div>
          <p className="text-xs text-muted-foreground mt-1">Pacientes agendados</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Próximas</CardTitle>
          <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.upcoming_appointments}</div>
          <p className="text-xs text-muted-foreground mt-1">Programadas / confirmadas</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-indigo-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Base de pacientes</CardTitle>
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total_patients}</div>
          <p className="text-xs text-muted-foreground mt-1">Total registrados</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Cancelaciones</CardTitle>
          <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.cancelled_month}</div>
          <p className="text-xs text-muted-foreground mt-1">En el mes seleccionado</p>
        </CardContent>
      </Card>
    </div>
  );
}
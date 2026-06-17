import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, Search, User, Calendar } from 'lucide-react';
import { Pagination } from '@/components/shared/pagination';

interface OperationalTableProps {
  appointments: {
    data: any[];
    links: any[];
    from: number;
    to: number;
    total: number;
  };
}

export function OperationalTable({ appointments }: OperationalTableProps) {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Completada</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Confirmada</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Cancelada</Badge>;
      case 'scheduled':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Agendada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const tableData = appointments?.data || [];

  return (
    <Card className="shadow-sm overflow-hidden py-0 flex flex-col">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg">Registro de citas</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="w-[120px]">Fecha</TableHead>
                <TableHead className="w-[140px]">Horario</TableHead>
                <TableHead className="min-w-[160px]">Paciente</TableHead>
                <TableHead className="min-w-[160px]">Médico</TableHead>
                <TableHead className="w-[130px] text-right">Estatus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-48 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 opacity-20" />
                      <p>No se encontraron citas en este periodo.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((app, index) => (
                  <TableRow key={`${app.id}-${index}`} className="hover:bg-muted/30">
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {app.fecha}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {app.hora}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {app.paciente}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{app.medico}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {getStatusBadge(app.estatus)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {appointments.links && appointments.links.length > 3 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10 mt-auto">
            <div className="text-sm text-muted-foreground hidden sm:block">
              Mostrando <span className="font-medium text-foreground">{appointments.from || 0}</span> a <span className="font-medium text-foreground">{appointments.to || 0}</span> de <span className="font-medium text-foreground">{appointments.total}</span> registros
            </div>
            <Pagination links={appointments.links} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
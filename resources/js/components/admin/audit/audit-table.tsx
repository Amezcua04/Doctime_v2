import React from 'react';
import { CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Activity } from 'lucide-react';
import { ActionTooltip } from '@/components/shared/action-tooltip';

interface AuditTableProps {
  logs: any[];
  onViewDetails: (log: any) => void;
}

export function AuditTable({ logs, onViewDetails }: AuditTableProps) {
  const getEventBadge = (event: string) => {
    switch (event) {
      case 'created': return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">Creación</Badge>;
      case 'updated': return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">Actualización</Badge>;
      case 'deleted': return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">Eliminación</Badge>;
      default: return <Badge variant="outline">{event}</Badge>;
    }
  };

  return (
    <CardContent className="p-0">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Módulo (registro)</TableHead>
              <TableHead>Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  <Activity className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  No se encontraron registros de auditoría con estos filtros.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/50">
                  <TableCell className="whitespace-nowrap">
                    <div className="font-medium">{log.created_at}</div>
                    <div className="text-[10px] text-muted-foreground">{log.created_at_human}</div>
                  </TableCell>
                  <TableCell className="font-medium">{log.causer?.name || 'Sistema'}</TableCell>
                  <TableCell>{getEventBadge(log.event)}</TableCell>
                  <TableCell>
                    <div className="font-semibold text-foreground">{log.subject_type_human}</div>
                    <div className="text-xs text-muted-foreground">{log.subject_name}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1">
                      <ActionTooltip label="Ver cambios">
                        <Button variant="ghost" size="sm" onClick={() => onViewDetails(log)} className=" hover:text-blue-600 hover:bg-blue-50 cursor-pointer">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </ActionTooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  );
}
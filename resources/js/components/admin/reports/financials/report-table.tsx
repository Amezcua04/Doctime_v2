import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, Search, User, UserCircle, Banknote, CreditCard, Landmark, Wallet } from 'lucide-react';
import { Pagination } from '@/components/shared/pagination';

interface ReportTableProps {
  payments: {
    data: any[];
    links: any[];
    from: number;
    to: number;
    total: number;
  };
  formatCurrency: (amount: number) => string;
}

export function ReportTable({ payments, formatCurrency }: ReportTableProps) {
  const getMethodStyle = (methodName: string) => {
    const nameLower = methodName?.toLowerCase() || '';
    if (nameLower.includes('efectivo') || nameLower.includes('cash')) return { icon: <Banknote className="h-3.5 w-3.5 mr-1" />, style: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' };
    if (nameLower.includes('tarjeta') || nameLower.includes('card')) return { icon: <CreditCard className="h-3.5 w-3.5 mr-1" />, style: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' };
    if (nameLower.includes('transferencia') || nameLower.includes('spei')) return { icon: <Landmark className="h-3.5 w-3.5 mr-1" />, style: 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800' };
    return { icon: <Wallet className="h-3.5 w-3.5 mr-1" />, style: 'text-slate-700 bg-slate-100 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
  };

  const tableData = payments?.data || [];

  return (
    <Card className="shadow-sm overflow-hidden py-0 flex flex-col">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-lg">Movimientos Detallados</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableRow>
                <TableHead className="w-[140px]">Fecha</TableHead>
                <TableHead className="min-w-[140px]">Paciente</TableHead>
                <TableHead className="min-w-[140px]">Médico</TableHead>
                <TableHead className="min-w-[160px]">Servicio(s)</TableHead>
                <TableHead className="w-[140px]">Método</TableHead>
                <TableHead className="w-[130px]">Cobrado por</TableHead>
                <TableHead className="text-right w-[110px]">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-48 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 opacity-20" />
                      <p>No hay pagos en este periodo.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((group) => (
                  <React.Fragment key={`group-${group.appointment_id}`}>
                    {group.rows.map((row: any, index: number) => {
                      const isFirstRow = index === 0;
                      const isLastRow = index === group.rows.length - 1;
                      const visualData = row.method ? getMethodStyle(row.method) : null;
                      const [dateStr, timeStr] = group.date.split(' ');

                      return (
                        <TableRow 
                          key={row.key} 
                          className={`hover:bg-muted/10 ${!isLastRow ? 'border-b-0' : ''}`}
                        >
                          <TableCell className="whitespace-nowrap align-top pt-3 pb-2">
                            {isFirstRow && (
                              <div className="flex flex-col">
                                <span className="font-medium text-foreground text-sm">{dateStr}</span>
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                  <Clock className="h-3 w-3" /> {timeStr}
                                </span>
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="text-sm font-medium align-top pt-3 pb-2">
                            {isFirstRow && group.patient}
                          </TableCell>

                          <TableCell className="align-top pt-3 pb-2">
                            {isFirstRow && (
                              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                <User className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{group.doctor}</span>
                              </div>
                            )}
                          </TableCell>

                          <TableCell className="text-sm align-top pt-3 pb-2 text-muted-foreground">
                            {row.service ? row.service : <span className="opacity-30">-</span>}
                          </TableCell>

                          <TableCell className="align-top pt-2 pb-2">
                            {row.method ? (
                              <>
                                <Badge variant="outline" className={`flex w-fit items-center whitespace-nowrap ${visualData?.style}`}>
                                  {visualData?.icon} {row.method}
                                </Badge>
                                {row.reference && (
                                  <span className="block mt-1 text-[10px] text-muted-foreground truncate max-w-[120px]">
                                    Ref: {row.reference}
                                  </span>
                                )}
                              </>
                            ) : <span className="opacity-30">-</span>}
                          </TableCell>

                          <TableCell className="align-top pt-3 pb-2">
                            {row.recorded_by ? (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <UserCircle className="h-3.5 w-3.5" />
                                {row.recorded_by}
                              </div>
                            ) : <span className="opacity-30">-</span>}
                          </TableCell>

                          <TableCell className="text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap align-top pt-3 pb-2">
                            {row.amount !== null ? formatCurrency(row.amount) : <span className="opacity-30">-</span>}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* --- CONTROLES DE PAGINACIÓN REUTILIZABLES --- */}
        {payments.links && payments.links.length > 3 && (
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10 mt-auto">
            <div className="text-sm text-muted-foreground hidden sm:block">
              Mostrando <span className="font-medium text-foreground">{payments.from || 0}</span> a <span className="font-medium text-foreground">{payments.to || 0}</span> de <span className="font-medium text-foreground">{payments.total}</span> registros
            </div>
            {/* Aquí mandamos llamar a tu componente */}
            <Pagination links={payments.links} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
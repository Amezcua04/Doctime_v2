import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CreditCard, AlertCircle } from 'lucide-react';

interface ReportKpisProps {
  kpis: { ingreso_total: number; cuentas_por_cobrar: number; ticket_promedio: number };
  formatCurrency: (amount: number) => string;
}

export function ReportKpis({ kpis, formatCurrency }: ReportKpisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="shadow-sm border-l-4 border-l-emerald-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Ingresos (período)</CardTitle>
          <Wallet className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">{formatCurrency(kpis.ingreso_total)}</div></CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-red-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Cuentas por cobrar</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-red-600">{formatCurrency(kpis.cuentas_por_cobrar)}</div></CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Ticket promedio</CardTitle>
          <CreditCard className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold">{formatCurrency(kpis.ticket_promedio)}</div></CardContent>
      </Card>
    </div>
  );
}
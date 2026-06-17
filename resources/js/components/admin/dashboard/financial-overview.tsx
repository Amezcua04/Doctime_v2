import React from 'react';
import { CircleDollarSign, ReceiptText, TrendingUp, TrendingDown } from 'lucide-react';
import { FinancialOverviewProps } from '@/types';

export function FinancialOverview({ financialStats }: FinancialOverviewProps) {
  if (!financialStats) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-b py-5 my-2 dark:border-slate-800">
      <div className="flex items-center gap-4 px-2">
        <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
          <CircleDollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Ingresos mensuales</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(financialStats.ingresos_mes)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 px-2 border-l-0 md:border-l dark:border-slate-800 md:pl-6">
        <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
          <ReceiptText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Ticket promedio</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(financialStats.ticket_promedio)}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 px-2 border-l-0 md:border-l dark:border-slate-800 md:pl-6">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${financialStats.crecimiento_porcentaje >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
          {financialStats.crecimiento_porcentaje >= 0 ? (
            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">Crecimiento (vs mes ant.)</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold text-foreground">{Math.abs(financialStats.crecimiento_porcentaje)}%</p>
            <span className={`text-xs font-semibold ${financialStats.crecimiento_porcentaje >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {financialStats.crecimiento_porcentaje >= 0 ? 'Arriba' : 'Abajo'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ReportChartsProps {
  revenueData: any[];
  paymentMethodsData: any[];
  formatCurrency: (amount: number) => string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8b5cf6'];

export function ReportCharts({ revenueData, paymentMethodsData, formatCurrency }: ReportChartsProps) {
  const memoizedMethods = useMemo(() => Array.isArray(paymentMethodsData) ? paymentMethodsData : Object.values(paymentMethodsData), [paymentMethodsData]);
  const memoizedRevenue = useMemo(() => Array.isArray(revenueData) ? revenueData : Object.values(revenueData), [revenueData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-4 shadow-sm">
        <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Evolución de ingresos (6 meses)</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={memoizedRevenue}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
              <RechartsTooltip cursor={{ fill: 'transparent' }} formatter={(value: any) => [formatCurrency(Number(value)), 'Total']} />
              <Bar dataKey="ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4 shadow-sm">
        <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Distribución por método (período)</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={memoizedMethods}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                label={(entry: any) => {
                  const p = entry.percent || 0;
                  return `${entry.name} ${(p * 100).toFixed(0)}%`;
                }}
              >
                {memoizedMethods.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Ingreso']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
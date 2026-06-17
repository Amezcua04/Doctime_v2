import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface OperationalChartsProps {
  attendanceData: any[];
  peakHoursData: any[];
}

export function OperationalCharts({ attendanceData, peakHoursData }: OperationalChartsProps) {
  const memoizedAttendance = useMemo(() => Array.isArray(attendanceData) ? attendanceData : Object.values(attendanceData), [attendanceData]);
  const memoizedPeakHours = useMemo(() => Array.isArray(peakHoursData) ? peakHoursData : Object.values(peakHoursData), [peakHoursData]);

  const getChartColor = (name: string) => {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('confirmadas')) {
      return 'hsl(var(--chart-2))';
    }
    if (nameLower.includes('canceladas')) {
      return 'hsl(var(--chart-3))';
    }
    if (nameLower.includes('programadas')) {
      return 'hsl(var(--chart-1))';
    }

    return 'hsl(var(--muted))';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-4 shadow-sm">
        <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Tasa de asistencia vs cancelación</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={memoizedAttendance}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                label={(entry: any) => {
                  const p = entry.percent || 0;
                  return `${entry.name} ${(p * 100).toFixed(0)}%`;
                }}
              >
                {memoizedAttendance.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getChartColor(entry.name)}
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  borderRadius: '8px',
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4 shadow-sm">
        <h3 className="font-semibold mb-4 text-sm text-muted-foreground">Ocupación por horarios (horas pico)</h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={memoizedPeakHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="hora"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <RechartsTooltip
                cursor={{ stroke: 'hsl(var(--chart-1))', strokeWidth: 1, strokeDasharray: '3 3' }}
                contentStyle={{
                  borderRadius: '8px',
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))'
                }}
              />
              <Area
                type="monotone"
                dataKey="citas"
                name="Volumen de citas"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCitas)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  );
}
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Label } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { ActivityChartsProps } from '@/types';

const barChartConfig = {
  citas: { label: "Citas realizadas:", color: "var(--primary)" },
} satisfies ChartConfig;

const pieChartConfig = {
  scheduled: { label: "Programada", color: "hsl(var(--chart-1))" },
  confirmed: { label: "Confirmada", color: "hsl(var(--chart-2))" },
  cancelled: { label: "Cancelada", color: "hsl(var(--chart-3))" },
  completed: { label: "Completada", color: "hsl(var(--chart-4))" },
  no_show: { label: "No Asistió", color: "hsl(var(--chart-5))" },
  arrived: { label: "En Espera", color: "hsl(var(--chart-6))" },
  in_progress: { label: "En Consulta", color: "hsl(var(--chart-7))" },
} satisfies ChartConfig;

export function ActivityCharts({ chartData, statusDistribution }: ActivityChartsProps) {
  const pieData = useMemo(() => {
    return statusDistribution.map((item: any) => ({
      ...item,
      fill: `var(--color-${item.status})`,
    }));
  }, [statusDistribution]);

  const totalCitasMes = useMemo(() => {
    return statusDistribution.reduce((acc, curr) => acc + curr.value, 0);
  }, [statusDistribution]);

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
      <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Flujo de pacientes
          </CardTitle>
          <CardDescription>Citas atendidas en el mes seleccionado</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-[300px]">
          <ChartContainer key={JSON.stringify(chartData)} config={barChartConfig} className="h-full w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} minTickGap={30} />
              <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="citas" fill="var(--color-citas)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Estatus mensual</CardTitle>
          <CardDescription>Distribución de citas en el mes</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center pb-4 min-h-[300px]">
          <ChartContainer key={JSON.stringify(pieData)} config={pieChartConfig} className="mx-auto aspect-square w-full max-h-[280px]">
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

              {/* CORRECCIÓN: nameKey cambiado a "status" */}
              <Pie data={pieData} dataKey="value" nameKey="status" innerRadius={75} strokeWidth={5} paddingAngle={2}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                          <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                            {totalCitasMes.toLocaleString()}
                          </tspan>
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-xs">
                            Total
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </Pie>

              <ChartLegend content={<ChartLegendContent nameKey="status" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center text-[10px]" />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
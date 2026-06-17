import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { OperationalFilters } from '@/components/admin/reports/operational/operational-filters';
import { OperationalKpis } from '@/components/admin/reports/operational/operational-kpis';
import { OperationalCharts } from '@/components/admin/reports/operational/operational-charts';
import { OperationalTable } from '@/components/admin/reports/operational/operational-table';

interface Props {
  appointments: {
    data: any[];
    links: any[];
    from: number;
    to: number;
    total: number;
  };
  filters: any;
  kpis: {
    total_citas: number;
    tasa_cancelacion: number;
    horas_ahorradas_bot: number;
  };
  attendanceData: any[];
  peakHoursData: any[];
  doctors: any[];
}

export default function OperationalIndex({ appointments, filters, kpis, attendanceData, peakHoursData, doctors }: Props) {
  const [params, setParams] = useState({
    start_date: filters.startDate || '',
    end_date: filters.endDate || '',
    doctor_id: filters.doctorId || 'all',
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleSearch = useCallback(() => {
    router.get('/admin/reports/operational', params, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  }, [params]);

  useEffect(() => {
    const timeoutId = setTimeout(() => { handleSearch(); }, 400);
    return () => clearTimeout(timeoutId);
  }, [params, handleSearch]);

  const handleExport = () => {
    setIsExporting(true);
    const query = new URLSearchParams(params as any).toString();
    window.location.href = `/admin/reports/operational/export?${query}`;
    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <>
      <Head title="Reporte operativo" />

      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-4">

        <OperationalFilters
          params={params}
          setParams={setParams}
          filters={filters}
          doctors={doctors}
          isExporting={isExporting}
          onExport={handleExport}
        />

        <OperationalKpis kpis={kpis} />

        <OperationalCharts
          attendanceData={attendanceData}
          peakHoursData={peakHoursData}
        />

        <OperationalTable appointments={appointments} />

      </div>
    </>
  );
}

OperationalIndex.layout = {
  breadcrumbs: [
    {
      title: 'Reporte operacional',
      href: '/admin/reports/operational',
    },
  ],
};
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { ReportKpis } from '@/components/admin/reports/financials/report-kpis';
import { ReportCharts } from '@/components/admin/reports/financials/report-charts';
import { ReportTable } from '@/components/admin/reports/financials/report-table';
import { ReportFilters } from '@/components/admin/reports/financials/report-filters';

interface Props {
  payments: {
    data: any[];
    links: any[];
    from: number;
    to: number;
    total: number;
  };
  filters: any;
  summary: { total: number; by_method: Record<string, number> };
  kpis: { ingreso_total: number; cuentas_por_cobrar: number; ticket_promedio: number };
  revenueData: any[];
  paymentMethodsData: any[];
  doctors: any[];
  paymentMethods: any[];
}

export default function FinancialIndex({ payments, filters, kpis, revenueData, paymentMethodsData, doctors, paymentMethods = [] }: Props) {
  const [params, setParams] = useState({
    start_date: filters.startDate || '',
    end_date: filters.endDate || '',
    doctor_id: filters.doctorId || 'all',
    method_id: filters.methodId || 'all',
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleSearch = useCallback(() => {
    router.get('/admin/reports/financial', params, {
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
    window.location.href = `/admin/reports/financial/export?${query}`;
    setTimeout(() => setIsExporting(false), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount || 0);
  };

  return (
    <>
      <Head title="Reporte financiero" />

      <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-4">

        <ReportFilters
          params={params}
          setParams={setParams}
          filters={filters}
          doctors={doctors}
          paymentMethods={paymentMethods}
          isExporting={isExporting}
          onExport={handleExport}
        />

        <ReportKpis
          kpis={kpis}
          formatCurrency={formatCurrency}
        />

        <ReportCharts
          revenueData={revenueData}
          paymentMethodsData={paymentMethodsData}
          formatCurrency={formatCurrency}
        />

        <ReportTable
          payments={payments}
          formatCurrency={formatCurrency}
        />

      </div>
    </>
  );
}

FinancialIndex.layout = {
  breadcrumbs: [
    {
      title: 'Reporte financiero',
      href: '/admin/reports/financials',
    },
  ],
};
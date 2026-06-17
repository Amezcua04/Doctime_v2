import React, { useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { AuditDetailsModal } from '@/components/admin/audit/audit-details-modal';
import { AuditTable } from '@/components/admin/audit/audit-table';
import { AuditFilters } from '@/components/admin/audit/audit-filters';
import { Pagination } from '@/components/shared/pagination';
import { History } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Props {
  logs: any;
  filters: any;
  options: any;
}

export default function AuditIndex({ logs, filters, options }: Props) {
  const [currentFilters, setCurrentFilters] = useState(filters);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyFilters = (newFilters: any) => {
    router.get('/admin/audit', newFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const newFilters = { ...currentFilters, search: value };

    setCurrentFilters(newFilters);

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    searchTimerRef.current = setTimeout(() => {
      applyFilters(newFilters);
    }, 500);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...currentFilters, [key]: value };
    setCurrentFilters(newFilters);
    applyFilters(newFilters);
  };

  const resetFilters = () => {
    const emptyFilters = { search: '', type: 'all', event: 'all', user_id: 'all', date_from: '', date_to: '' };
    setCurrentFilters(emptyFilters);
    applyFilters(emptyFilters);
  };

  return (
    <>
      <Head title="Registro de auditoría" />
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 p-4 md:p-6 lg:p-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Registro de auditoría
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitoreo de todos los cambios y eventos críticos del sistema.
            </p>
          </div>
        </div>

        <Card className="shadow-sm border-border">
          <AuditFilters
            filters={currentFilters}
            options={options}
            onSearchChange={handleSearchChange}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />

          <AuditTable
            logs={logs.data}
            onViewDetails={setSelectedLog}
          />
        </Card>

        <Pagination
          links={logs.links}
        />
      </div>

      <AuditDetailsModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </>
  );
}

AuditIndex.layout = {
  breadcrumbs: [
    {
      title: 'Auditoría',
      href: '/admin/audit',
    },
  ],
};
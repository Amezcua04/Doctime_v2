import React, { useState, useCallback, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label as UILabel } from '@/components/ui/label';
import { StatCards } from '@/components/admin/dashboard/stat-cards';
import { FinancialOverview } from '@/components/admin/dashboard/financial-overview';
import { LiveOperations } from '@/components/admin/dashboard/live-operations';
import { ActivityCharts } from '@/components/admin/dashboard/activity-charts';
import { UpcomingAgenda } from '@/components/admin/dashboard/upcoming-agenda';
import {
  ChartDataRecord,
  ConfirmationItem,
  DashboardStats,
  FinancialStats,
  InConsultationPatient,
  NextAppointment,
  StatusDistribution,
  TopService,
  WaitingPatient
} from '@/types';

interface Props {
  stats: DashboardStats;
  financialStats: FinancialStats | null;
  chartData: ChartDataRecord[];
  statusDistribution: StatusDistribution[];
  nextAppointments: NextAppointment[];
  topServices: TopService[];
  confirmationList: ConfirmationItem[];
  waitingRoom: WaitingPatient[];
  inConsultation: InConsultationPatient[];
  userRoles: string[];
  filters: { month: string; };
}

export default function Dashboard({ stats, financialStats, chartData, statusDistribution, nextAppointments, confirmationList, waitingRoom, inConsultation, userRoles, filters }: Props) {
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(filters.month);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasRole = (role: string) => userRoles.includes(role) || userRoles.includes('super_admin') || userRoles.includes('admin');

  const debouncedReload = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      router.reload({
        only: ['stats',
          'chartData',
          'statusDistribution',
          'nextAppointments',
          'confirmationList',
          'waitingRoom',
          'inConsultation'
        ],
      });
    }, 1000);
  }, []);

  useEcho(
    'clinic.stats',
    '.ClinicUpdated',
    (e: any) => {
      debouncedReload();
    },
    [],
    'private'
  );

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSelectedMonth(val);
    router.get('/dashboard', { month: val }, { preserveState: true, preserveScroll: true });
  };

  const quickConfirm = (id: number) => {
    router.patch(`/admin/appointments/${id}/status`, { status: 'confirmed' }, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  const sendReminder = (id: number) => {
    setSendingId(id);
    router.post(`/admin/appointments/${id}/send-reminder`, {}, {
      preserveScroll: true,
      onFinish: () => setSendingId(null),
    });
  };

  return (
    <>
      <Head title="Dashboard" />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2 mb-2">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Resumen general</h1>
            <p className="text-sm text-muted-foreground">Monitorea el rendimiento operativo y financiero.</p>
          </div>
          <div className="flex items-center gap-2">
            <UILabel className="text-sm font-medium whitespace-nowrap">Ver mes:</UILabel>
            <Input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="w-[180px] bg-background shadow-sm cursor-pointer"
            />
          </div>
        </div>

        <StatCards stats={stats} />
        <FinancialOverview financialStats={financialStats} />
        <ActivityCharts chartData={chartData} statusDistribution={statusDistribution} />
        <LiveOperations waitingRoom={waitingRoom} inConsultation={inConsultation} hasRole={hasRole} />
        <UpcomingAgenda
          nextAppointments={nextAppointments}
          confirmationList={confirmationList}
          hasRole={hasRole}
          quickConfirm={quickConfirm}
          sendReminder={sendReminder}
          sendingId={sendingId}
        />
      </div>
    </>
  );
}

Dashboard.layout = {
  breadcrumbs: [
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
  ],
};
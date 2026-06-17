import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Pagination } from '@/components/shared/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  MessageSquare,
  Mail,
  Terminal,
  Clock,
  BarChart3,
  AlertTriangle,
  Send
} from 'lucide-react';

interface LogProperties {
  channel?: 'whatsapp' | 'email';
  target?: string;
  error_message?: string;
  metrics?: {
    total_processed: number;
    success_whatsapp: number;
    success_email: number;
    failed_all: number;
  };
}

interface ActivityLogItem {
  id: number;
  log_name: string;
  description: string;
  event: string;
  properties: LogProperties | null;
  created_at: string;
}

interface Props {
  cronJobs: ActivityLogItem[];
  patientLogs: {
    data: ActivityLogItem[];
    links: any[];
    current_page: number;
    total: number;
  };
}

export default function RemindersAuditIndex({ cronJobs, patientLogs }: Props) {
  const [selectedError, setSelectedError] = useState<LogProperties | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <>
      <Head title="Auditoría de recordatorios" />
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 p-4 md:p-6 lg:p-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Auditoría de recordatorios
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitoreo de notificaciones automatizadas y tareas programadas del sistema.
            </p>
          </div>
        </div>

        <Tabs defaultValue="pacientes" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="w-fit mb-2 shrink-0">
            <TabsTrigger value="pacientes">Bitácora de pacientes</TabsTrigger>
            <TabsTrigger value="sistema">Historial de cron jobs</TabsTrigger>
          </TabsList>

          <TabsContent value="pacientes" className="flex flex-col flex-1 overflow-hidden mt-0 gap-4">
            <Card className="shadow-sm border-border flex flex-col flex-1 overflow-hidden">
              <div className="overflow-auto flex-1 relative">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow>
                      <TableHead>Fecha y hora</TableHead>
                      <TableHead>Acción / descripción</TableHead>
                      <TableHead>Canal</TableHead>
                      <TableHead>Destinatario</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Detalles</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientLogs.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                          No se encontraron registros de envío.
                        </TableCell>
                      </TableRow>
                    ) : (
                      patientLogs.data.map((log) => {
                        const isFailed = log.event.includes('failed');
                        const channel = log.properties?.channel;

                        return (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" />
                                {formatDate(log.created_at)}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {log.description}
                            </TableCell>
                            <TableCell>
                              {channel === 'whatsapp' ? (
                                <Badge variant="outline" className="gap-1 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-200">
                                  <MessageSquare className="h-3 w-3" /> WhatsApp
                                </Badge>
                              ) : channel === 'email' ? (
                                <Badge variant="outline" className="gap-1 bg-blue-50/50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200">
                                  <Mail className="h-3 w-3" /> Email
                                </Badge>
                              ) : (
                                <Badge variant="secondary">N/A</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-sm font-mono text-muted-foreground">
                              {log.properties?.target || '—'}
                            </TableCell>
                            <TableCell>
                              {isFailed ? (
                                <Badge variant="destructive" className="gap-1">
                                  <XCircle className="h-3 w-3" /> Fallido
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800 dark:bg-emerald-900 dark:text-emerald-200 hover:bg-green-100">
                                  <CheckCircle2 className="h-3 w-3" /> Exitoso
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {isFailed && log.properties && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedError(log.properties)}
                                  className="h-8 gap-1 text-xs hover:bg-destructive/10 hover:text-destructive text-indigo-600 dark:text-indigo-400"
                                >
                                  <Terminal className="h-3.5 w-3.5" /> Inspeccionar
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <div className="shrink-0">
              <Pagination links={patientLogs.links} />
            </div>
          </TabsContent>

          <TabsContent value="sistema" className="overflow-auto flex-1 mt-0 pb-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cronJobs.length === 0 ? (
                <div className="col-span-full text-center p-8 text-muted-foreground border border-dashed rounded-lg">
                  No hay registros de ejecución del sistema aún.
                </div>
              ) : (
                cronJobs.map((job) => {
                  const metrics = job.properties?.metrics;
                  const isWarning = (metrics?.failed_all ?? 0) > 0;

                  return (
                    <Card key={job.id} className={`border shadow-sm ${isWarning ? 'border-amber-300 dark:border-amber-900 bg-amber-50/10' : 'border-border'}`}>
                      <div className="p-5">
                        <div className="flex flex-row items-center justify-between pb-2">
                          <div className="space-y-1">
                            <h3 className="font-semibold leading-none tracking-tight">
                              {job.event === 'cron_send_reminders' ? 'Recordatorios Diarios' : 'Campaña de Retención'}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" /> {formatDate(job.created_at)}
                            </div>
                          </div>
                          {isWarning ? (
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                          ) : (
                            <BarChart3 className="h-5 w-5 text-indigo-500" />
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-center border-t pt-4 mt-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground font-medium">Procesados</span>
                            <span className="text-2xl font-bold tracking-tight text-foreground">
                              {metrics?.total_processed ?? 0}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground font-medium">Errores</span>
                            <span className={`text-2xl font-bold tracking-tight ${isWarning ? 'text-destructive' : 'text-muted-foreground'}`}>
                              {metrics?.failed_all ?? 0}
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 bg-muted/50 rounded p-2 text-xs text-muted-foreground font-mono truncate">
                          {job.description}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={selectedError !== null} onOpenChange={(open) => !open && setSelectedError(null)}>
        <DialogContent className="max-w-2xl sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Terminal className="h-5 w-5" /> Análisis del payload de error
            </DialogTitle>
          </DialogHeader>
          <div className="relative mt-2">
            <div className="absolute top-3 right-3">
              <Badge variant="outline" className="bg-zinc-950 text-zinc-400 border-zinc-800 text-[10px]">
                METADATA_JSON
              </Badge>
            </div>
            <pre className="p-4 bg-zinc-950 text-zinc-100 rounded-lg font-mono text-xs overflow-x-auto max-h-[450px] shadow-inner leading-relaxed">
              {JSON.stringify(selectedError, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

RemindersAuditIndex.layout = {
  breadcrumbs: [
    {
      title: 'Auditoría',
      href: '/admin/audit',
    },
    {
      title: 'Recordatorios y cron jobs',
      href: '/admin/reminders',
    },
  ],
};
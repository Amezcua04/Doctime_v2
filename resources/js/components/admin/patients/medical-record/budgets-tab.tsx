import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Trash2, Printer, Search, ArrowUpDown, Loader2, Mail, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteModal } from '@/components/shared/delete-modal';
import { Pagination } from '@/components/shared/pagination';
import { Budget, PaginatedBudgets } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SendBudgetDropdown } from './utils/send-budget';
import { ActionTooltip } from '@/components/shared/action-tooltip';



interface Props {
  patientId: number;
  budgets: PaginatedBudgets;
  filters?: { search?: string; sortField?: string; sortDirection?: string };
}

export const BudgetsTab = ({ patientId, budgets, filters }: Props) => {
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState(filters?.search || '');
  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);
  const [sendingWhatsAppId, setSendingWhatsAppId] = useState<number | null>(null);
  const sortField = filters?.sortField || 'created_at';
  const sortDirection = filters?.sortDirection || 'desc';

  const statusConfig = {
    draft: { label: 'Borrador', classes: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200' },
    accepted: { label: 'Aceptado', classes: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200' },
    sent: { label: 'Enviado', classes: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200' },
    rejected: { label: 'Rechazado', classes: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200' },
  };

  const fetchData = (overrides: any) => {
    router.get(
      window.location.pathname,
      {
        search: overrides.search ?? search,
        sortField: overrides.sortField ?? sortField,
        sortDirection: overrides.sortDirection ?? sortDirection,
        page: overrides.page ?? budgets.current_page,
      },
      {
        preserveState: true,
        preserveScroll: true,
        only: ['budgets', 'filters'],
      }
    );
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (search !== (filters?.search || '')) {
        fetchData({ search, page: 1 });
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [search]);

  const handleSort = (field: string) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    fetchData({ sortField: field, sortDirection: newDirection, page: 1 });
  };

  const confirmDelete = () => {
    if (!budgetToDelete) return;
    setIsDeleting(true);
    router.delete(`/admin/patients/${patientId}/budgets/${budgetToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Presupuesto eliminado correctamente');
        setBudgetToDelete(null);
      },
      onError: () => toast.error('No se pudo eliminar el presupuesto'),
      onFinish: () => setIsDeleting(false),
    });
  };

  const handlePrint = (budgetId: number) => {
    window.open(`/admin/patients/${patientId}/budgets/${budgetId}/export`, '_blank');
  };

  const handleStatusChange = (budgetId: number, newStatus: string) => {
    router.put(`/admin/patients/${patientId}/budgets/${budgetId}`, { status: newStatus }, {
      preserveScroll: true,
      onSuccess: () => toast.success('Estado actualizado correctamente'),
      onError: () => toast.error('No se pudo actualizar el estado'),
    });
  };

  const handleSendEmail = (budgetId: number) => {
    setSendingEmailId(budgetId);
    router.post(`/admin/patients/${patientId}/budgets/${budgetId}/send-email`, {}, {
      preserveScroll: true,
      onSuccess: () => toast.success('Presupuesto enviado por correo electrónico'),
      onError: () => toast.error('Error al enviar el correo'),
      onFinish: () => setSendingEmailId(null),
    });
  };

  const handleSendWhatsApp = (budgetId: number) => {
    setSendingWhatsAppId(budgetId);
    router.post(`/admin/patients/${patientId}/budgets/${budgetId}/send-whatsapp`, {}, {
      preserveScroll: true,
      onSuccess: () => toast.success('Presupuesto enviado por WhatsApp'),
      onError: () => toast.error('Error al enviar por WhatsApp'),
      onFinish: () => setSendingWhatsAppId(null),
    });
  };

  const getFormattedDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

  const SortableHeader = ({ field, label }: { field: string, label: string }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 transition-colors select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
      </div>
    </TableHead>
  );

  return (
    <Card className="border-border shadow-sm overflow-hidden pb-0">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b bg-muted/10 pb-4 gap-4">
        <div>
          <CardTitle>Historial de presupuestos</CardTitle>
          <CardDescription>Consulta, imprime y gestiona las cotizaciones del paciente.</CardDescription>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar folio o total..."
            className="pl-8 bg-white dark:bg-slate-950"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <SortableHeader field="folio" label="Folio" />
                <SortableHeader field="created_at" label="Fecha" />
                <SortableHeader field="valid_until" label="Vigencia" />
                <SortableHeader field="total" label="Total" />
                <SortableHeader field="status" label="Estado" />
                <TableHead className="w-25 text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!budgets.data || budgets.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    {search ? 'No se encontraron presupuestos que coincidan con la búsqueda.' : 'No hay presupuestos generados. Crea uno nuevo desde el odontograma.'}
                  </TableCell>
                </TableRow>
              ) : (
                budgets.data.map((budget) => {
                  const status = statusConfig[budget.status] || statusConfig.draft;
                  const isAnyLoading = sendingEmailId === budget.id || sendingWhatsAppId === budget.id;

                  return (
                    <TableRow key={budget.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="border-r font-medium text-primary">
                        {budget.folio || `#${String(budget.id).padStart(5, '0')}`}
                      </TableCell>
                      <TableCell className="border-r text-muted-foreground">
                        {getFormattedDate(budget.created_at)}
                      </TableCell>
                      <TableCell className="border-r text-muted-foreground">
                        {getFormattedDate(budget.valid_until)}
                      </TableCell>
                      <TableCell className="border-r font-bold text-foreground">
                        ${Number(budget.total).toFixed(2)}
                      </TableCell>
                      
                      {/* CELDA DE ESTADO ACTUALIZADA */}
                      <TableCell className="border-r align-middle">
                        <div className="flex justify-center">
                          <Select defaultValue={budget.status} onValueChange={(value) => handleStatusChange(budget.id, value)}>
                            <SelectTrigger 
                              className={`h-7 w-[110px] px-2.5 flex items-center justify-between text-[11px] uppercase tracking-wider font-bold rounded-full border shadow-none transition-colors focus:ring-0 focus:ring-offset-0 [&>svg]:w-3 [&>svg]:h-3 [&>svg]:opacity-50 hover:[&>svg]:opacity-100 ${status.classes}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="center">
                              <SelectItem value="draft" className="text-gray-800 text-xs font-medium">Borrador</SelectItem>
                              <SelectItem value="accepted" className="text-emerald-800 text-xs font-medium">Aceptado</SelectItem>
                              <SelectItem value="sent" className="text-blue-800 text-xs font-medium">Enviado</SelectItem>
                              <SelectItem value="rejected" className="text-red-800 text-xs font-medium">Rechazado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>

                      <TableCell className="text-center p-2">
                        <div className="flex justify-center gap-1">
                          <ActionTooltip label="Imprimir">
                            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-blue-600 hover:bg-blue-50" onClick={() => handlePrint(budget.id)}>
                              <Printer className="h-4 w-4" />
                            </Button>
                          </ActionTooltip>

                          <SendBudgetDropdown
                            isLoading={isAnyLoading}
                            onSendEmail={() => handleSendEmail(budget.id)}
                            onSendWhatsApp={() => handleSendWhatsApp(budget.id)}
                          />

                          <ActionTooltip label="Eliminar" variant="destructive">
                            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-red-600 hover:bg-red-50" onClick={() => setBudgetToDelete(budget)} title="Eliminar">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </ActionTooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {budgets.total > 0 && (
          <CardFooter className="border-t [.border-t]:pt-2 py-2 flex justify-center">
            <Pagination links={budgets.links} />
          </CardFooter>
        )}
      </CardContent>

      <DeleteModal
        open={!!budgetToDelete}
        onOpenChange={(open) => !open && setBudgetToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="¿Eliminar presupuesto?"
        contextText="Estás a punto de eliminar permanentemente la cotización con folio:"
        itemName={budgetToDelete?.folio || `#${String(budgetToDelete?.id).padStart(5, '0')}`}
        warningText="Esta acción no se puede deshacer. Los registros financieros asociados se perderán."
      />
    </Card>
  );
};
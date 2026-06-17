import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Trash2, Plus, Receipt, Check, ChevronsUpDown, CreditCard, Banknote, Landmark, Wallet, FileX2, Coins, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { PaymentMethod, Service } from '@/types';
import { DeleteModal } from '@/components/shared/delete-modal';

interface Props {
  appointment: any;
  availableServices: Service[];
  paymentMethods: PaymentMethod[];
}

type ItemToDelete = { type: 'service' | 'payment'; id: number; name: string } | null;

export const AppointmentBilling = ({ appointment, availableServices, paymentMethods = [] }: Props) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [openPopover, setOpenPopover] = useState(false);
  const [isAddingService, setIsAddingService] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    payment_method_id: paymentMethods.length > 0 ? paymentMethods[0].id.toString() : '',
    reference: '',
    notes: ''
  });

  const [itemToDelete, setItemToDelete] = useState<ItemToDelete>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const changeDue = appointment.paid_amount - appointment.total;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };

  const getMethodIcon = (methodName: string) => {
    const nameLower = methodName?.toLowerCase() || '';
    if (nameLower.includes('efectivo') || nameLower.includes('cash')) return <Banknote className="h-4 w-4 text-emerald-600" />;
    if (nameLower.includes('tarjeta') || nameLower.includes('card')) return <CreditCard className="h-4 w-4 text-blue-600" />;
    if (nameLower.includes('transferencia') || nameLower.includes('spei')) return <Landmark className="h-4 w-4 text-indigo-600" />;
    return <Wallet className="h-4 w-4 text-slate-600" />;
  };

  const handleAddService = () => {
    if (!selectedServiceId) return;
    const service = availableServices.find(s => s.id.toString() === selectedServiceId);
    if (!service) return;

    setIsAddingService(true);
    router.post(`/admin/appointments/${appointment.id}/services`, {
      service_id: service.id,
      price: service.price,
      quantity: 1
    }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (page: any) => {
        setSelectedServiceId('');
      },
      onFinish: () => setIsAddingService(false)
    });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentForm.amount || !paymentForm.payment_method_id || isAddingPayment) return;

    setIsAddingPayment(true);
    router.post(`/admin/appointments/${appointment.id}/payments`, paymentForm, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (page: any) => {
        if (!page.props.errors || Object.keys(page.props.errors).length === 0) {
          setPaymentForm({ amount: '', payment_method_id: '', reference: '', notes: '' });
        }
      },
      onError: (errors: any) => {
        if (errors.amount) toast.error(errors.amount);
        else if (errors.payment_method_id) toast.error(errors.payment_method_id);
        else toast.error("Revisa los datos del pago.");
      },
      onFinish: () => setIsAddingPayment(false)
    });
  };

  const handlePayFullBalance = () => {
    if (appointment.balance > 0) {
      setPaymentForm({ ...paymentForm, amount: appointment.balance.toString() });
    }
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    const url = itemToDelete.type === 'service'
      ? `/admin/appointments/${appointment.id}/services/${itemToDelete.id}`
      : `/admin/appointments/${appointment.id}/payments/${itemToDelete.id}`;

    router.delete(url, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (page: any) => {
        setItemToDelete(null);
      },
      onFinish: () => setIsDeleting(false)
    });
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center bg-muted/30 p-3 rounded-xl border border-border">
        <span className="text-sm font-semibold text-muted-foreground">Opciones del estado de cuenta</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.open(`/admin/appointments/${appointment.id}/receipt`, '_blank')}
          className="cursor-pointer font-bold shadow-sm border-slate-300 hover:bg-slate-50 gap-2"
        >
          <Printer className="h-4 w-4 text-slate-600" />
          Imprimir recibo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col justify-center rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total a Pagar</p>
          <p className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(appointment.total || 0)}</p>
        </div>
        <div className="flex flex-col justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm transition-all hover:shadow-md">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">Pagado</p>
          <p className="text-3xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">{formatCurrency(appointment.paid_amount || 0)}</p>
        </div>
        {changeDue > 0 ? (
          <div className="flex flex-col justify-center rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1">
              <Coins className="h-3.5 w-3.5" /> Cambio a devolver
            </p>
            <p className="text-3xl font-bold tracking-tight text-blue-700 dark:text-blue-400">{formatCurrency(changeDue)}</p>
          </div>
        ) : (
          <div className="flex flex-col justify-center rounded-xl border border-orange-500/20 bg-orange-500/5 p-5 shadow-sm transition-all hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1">Saldo Pendiente</p>
            <p className="text-3xl font-bold tracking-tight text-orange-700 dark:text-orange-400">{formatCurrency(appointment.balance)}</p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
              <Receipt className="h-4 w-4 text-primary" /> Servicios
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Popover open={openPopover} onOpenChange={setOpenPopover}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openPopover} className="w-full justify-between font-normal bg-background cursor-pointer shadow-sm">
                    <span className="truncate">
                      {selectedServiceId ? availableServices.find((s) => s.id.toString() === selectedServiceId)?.name : "Buscar un servicio..."}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar por nombre..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                      <CommandGroup>
                        {availableServices.map((service) => (
                          <CommandItem
                            key={service.id}
                            value={service.name}
                            onSelect={() => {
                              setSelectedServiceId(service.id.toString());
                              setOpenPopover(false);
                            }}
                            className="cursor-pointer py-2.5"
                          >
                            <Check className={cn("mr-2 h-4 w-4 text-primary", selectedServiceId === service.id.toString() ? "opacity-100" : "opacity-0")} />
                            <div className="flex justify-between items-center w-full">
                              <span className="font-medium">{service.name}</span>
                              <span className="text-muted-foreground text-sm font-semibold">{formatCurrency(service.price)}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <Button type="button" onClick={handleAddService} disabled={!selectedServiceId || isAddingService} className="cursor-pointer shrink-0 shadow-sm">
              <Plus className="h-4 w-4 mr-2" /> Agregar
            </Button>
          </div>

          <div className="border rounded-xl overflow-y-auto bg-card shadow-sm max-h-[250px] relative">
            <Table>
              <TableHeader className="bg-muted/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                <TableRow>
                  <TableHead className="font-semibold text-foreground">Servicio</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Monto</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!appointment.services || appointment.services.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileX2 className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">Sin servicios agregados</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  appointment.services.map((service: any) => (
                    <TableRow key={service.id} className="group">
                      <TableCell className="font-medium">{service.name}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(service.pivot.price * service.pivot.quantity)}</TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setItemToDelete({ type: 'service', id: service.id, name: service.name })}
                          className="h-8 w-8 text-red-600 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-base font-bold flex items-center gap-2 text-foreground">
              <Wallet className="h-4 w-4 text-emerald-600" /> Registro de pagos
            </h3>
          </div>

          <form onSubmit={handleAddPayment} className="rounded-xl border bg-muted/20 p-4 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold">Nuevo abono</label>
              {appointment.balance > 0 && (
                <Button type="button" variant="link" onClick={handlePayFullBalance} className="h-auto p-0 text-xs text-primary font-bold cursor-pointer">
                  Liquidar saldo restante
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <Input
                  type="number"
                  step="1.00"
                  placeholder="Monto ($)"
                  value={paymentForm.amount}
                  onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  required
                  className="bg-background shadow-sm text-lg font-semibold"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <Select value={paymentForm.payment_method_id} onValueChange={val => setPaymentForm({ ...paymentForm, payment_method_id: val })}>
                  <SelectTrigger className="w-full cursor-pointer bg-background shadow-sm">
                    <SelectValue placeholder="Método..." />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.length === 0 ? (
                      <SelectItem value="none" disabled>No hay métodos activos</SelectItem>
                    ) : (
                      paymentMethods.map(method => (
                        <SelectItem key={method.id} value={method.id.toString()} className="cursor-pointer">
                          {method.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Input
                  type="text"
                  placeholder="Referencia (Ej. Folio SPEI, Terminación tarjeta)..."
                  value={paymentForm.reference}
                  onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  className="bg-background shadow-sm text-sm"
                />
              </div>
              <div className="col-span-2">
                <Button type="submit" disabled={isAddingPayment || !paymentForm.amount || !paymentForm.payment_method_id} className="w-full cursor-pointer shadow-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white">
                  Registrar Pago
                </Button>
              </div>
            </div>
          </form>

          <div className="border rounded-xl overflow-y-auto bg-card shadow-sm max-h-[250px] relative">
            <Table>
              <TableHeader className="bg-muted/90 sticky top-0 z-10 backdrop-blur-sm shadow-sm">
                <TableRow>
                  <TableHead className="font-semibold text-foreground">Fecha / Método</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Monto</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!appointment.payments || appointment.payments.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Wallet className="h-8 w-8 mb-2 opacity-20" />
                        <p className="text-sm">Sin pagos registrados</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  appointment.payments.map((payment: any) => {
                    const methodName = payment.method?.name || 'Desconocido';

                    return (
                      <TableRow key={payment.id} className="group">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-foreground">{format(new Date(payment.created_at), 'dd/MM/yyyy')}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 font-medium">
                              {getMethodIcon(methodName)} {methodName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-base text-emerald-600">{formatCurrency(Number(payment.amount))}</TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setItemToDelete({ type: 'payment', id: payment.id, name: `${formatCurrency(Number(payment.amount))} (${methodName})` })}
                            className="h-8 w-8 text-red-600 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <DeleteModal
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title={itemToDelete?.type === 'service' ? '¿Quitar servicio?' : '¿Eliminar pago?'}
        contextText={itemToDelete?.type === 'service' ? 'Estás a punto de quitar el servicio:' : 'Estás a punto de eliminar el abono de:'}
        itemName={itemToDelete?.name || ''}
        warningText={
          itemToDelete?.type === 'service'
            ? 'Este concepto se descontará del saldo total. Verifica que el paciente no lo requiera en su cuenta final.'
            : 'Este pago se borrará del historial financiero. Asegúrate de tener los comprobantes o hacer las devoluciones pertinentes en caja.'
        }
      />
    </div>
  );
};
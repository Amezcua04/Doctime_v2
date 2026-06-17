import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Lock, CreditCard, Edit2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PaymentMethod } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  methodToEdit: PaymentMethod | null;
}

export const PaymentMethodModal = ({ isOpen, onClose, methodToEdit }: Props) => {
  const isEdit = !!methodToEdit;

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      clearErrors();
      if (methodToEdit) {
        setData({
          name: methodToEdit.name,
          is_active: Boolean(methodToEdit.is_active),
        });
      } else {
        reset();
      }
    }
  }, [isOpen, methodToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const url = isEdit ? `/admin/payment-methods/${methodToEdit.id}` : '/admin/payment-methods';
    const method = isEdit ? put : post;

    method(url, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (page: any) => {
        onClose();
        reset();
      },
      onError: (errs: any) => {
        if (errs.name) toast.error(errs.name);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              {methodToEdit ? (
                <Edit2 className="h-4 w-4 text-primary" />
              ) : (
                <CreditCard className="h-4 w-4 text-primary" />
              )}
            </div>
            {methodToEdit ? 'Editar método de pago' : 'Nuevo método'}
          </DialogTitle>
          <DialogDescription>
            {methodToEdit
              ? 'Modifica los detalles del método de pago existente.'
              : 'Registra una nueva opción de pago para la caja registradora.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del método</Label>
            <div className="relative">
              <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder="Ej. Efectivo, Tarjeta de débito..."
                className={`pl-9 ${errors.name ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
          </div>

          <div className="bg-muted/30 p-4 rounded-lg space-y-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  {data.is_active ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  Estado del método
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  {data.is_active
                    ? 'Visible para seleccionarlo en la caja registradora al registrar abonos.'
                    : 'Oculto. El historial de pagos anteriores se mantendrá intacto.'}
                </p>
              </div>
              <Switch
                className='cursor-pointer'
                checked={data.is_active}
                onCheckedChange={(checked) => setData('is_active', checked)}
              />
            </div>
          </div>

          <DialogFooter className="px-2 py-2 border-t shrink-0 flex flex-col-reverse sm:flex-row gap-2">
            <Button
              className="w-full sm:w-auto cursor-pointer"
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto min-w-[140px] cursor-pointer"
              type="submit"
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                isEdit ? 'Actualizar' : 'Guardar'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
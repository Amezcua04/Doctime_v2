import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tag, DollarSign, Clock, Loader2, Lock, Globe, Edit2 } from 'lucide-react';
import { Service } from '@/types';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit: Service | null;
}

export const ServiceModal = ({ isOpen, onClose, serviceToEdit }: Props) => {
  const isEdit = !!serviceToEdit;

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    description: '',
    price: '',
    duration_min: 30,
    is_active: true,
    is_public: false,
  });

  useEffect(() => {
    if (isOpen) {
      clearErrors();
      if (serviceToEdit) {
        setData({
          name: serviceToEdit.name,
          description: serviceToEdit.description || '',
          price: serviceToEdit.price.toString(),
          duration_min: serviceToEdit.duration_min,
          is_active: Boolean(serviceToEdit.is_active),
          is_public: Boolean(serviceToEdit.is_public),
        });
      } else {
        reset();
      }
    }
  }, [isOpen, serviceToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const url = isEdit ? `/admin/services/${serviceToEdit.id}` : '/admin/services';
    const method = isEdit ? put : post;

    method(url, {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
        reset();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !processing && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              {serviceToEdit ? (
                <Edit2 className="h-4 w-4 text-primary" />
              ) : (
                <Tag className="h-4 w-4 text-primary" />
              )}
            </div>
            {serviceToEdit ? 'Editar servicio' : 'Nuevo servicio'}
          </DialogTitle>
          <DialogDescription>
            {serviceToEdit
              ? 'Modifica los detalles del servicio existente.'
              : 'Registra un nuevo servicio en el catálogo.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del tratamiento <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="Ej. Limpieza dental"
              className={errors.name ? 'border-red-500' : ''}
              disabled={processing}
              required
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Precio ($) <span className="text-destructive">*</span></Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.price}
                  onChange={(e) => setData('price', e.target.value)}
                  className={`pl-8 ${errors.price ? 'border-red-500' : ''}`}
                  placeholder="0.00"
                  disabled={processing}
                  required
                />
              </div>
              {errors.price && <span className="text-xs text-red-500">{errors.price}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duración (min) <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  step="5"
                  value={data.duration_min}
                  onChange={(e) => setData('duration_min', parseInt(e.target.value) || 0)}
                  className={`pl-8 ${errors.duration_min ? 'border-red-500' : ''}`}
                  disabled={processing}
                  required
                />
              </div>
              {errors.duration_min && <span className="text-xs text-red-500">{errors.duration_min}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (pública)</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
              placeholder="Detalles que verá el paciente en la web..."
              className="resize-none h-20"
              disabled={processing}
            />
          </div>

          <div className="bg-muted/30 p-4 rounded-lg space-y-4 border border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" /> Visibilidad pública
                </Label>
                <p className="text-xs text-muted-foreground">
                  Mostrar este servicio en la landing page.
                </p>
              </div>
              <Switch
                className="cursor-pointer"
                checked={data.is_public}
                onCheckedChange={(checked) => setData('is_public', checked)}
                disabled={processing}
              />
            </div>

            <div className="flex items-center justify-between border-t border-dashed pt-4 border-border">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  {data.is_active ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  Estado del servicio
                </Label>
                <p className="text-xs text-muted-foreground">
                  {data.is_active ? 'Servicio activo para agendar.' : 'Servicio oculto temporalmente.'}
                </p>
              </div>
              <Switch
                className="cursor-pointer"
                checked={data.is_active}
                onCheckedChange={(checked) => setData('is_active', checked)}
                disabled={processing}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={processing}
              className="w-full sm:w-auto cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto min-w-[140px] cursor-pointer"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                isEdit ? 'Actualizar' : 'Guardar servicio'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
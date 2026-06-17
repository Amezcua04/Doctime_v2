import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Stethoscope, Edit2, Palette, Lock, Loader2 } from 'lucide-react';
import { Specialty } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  specialtyToEdit: Specialty | null;
}

const presetColors = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#64748b',
];

export const SpecialtyModal = ({ isOpen, onClose, specialtyToEdit }: Props) => {
  const isEdit = !!specialtyToEdit;

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    color: '#3b82f6',
    description: '',
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      clearErrors();
      if (specialtyToEdit) {
        setData({
          name: specialtyToEdit.name,
          color: specialtyToEdit.color || '#3b82f6',
          is_active: Boolean(specialtyToEdit.is_active),
        });
      } else {
        reset();
      }
    }
  }, [isOpen, specialtyToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const url = isEdit ? `/admin/specialties/${specialtyToEdit.id}` : '/admin/specialties';
    const method = isEdit ? put : post;

    method(url, {
      onSuccess: () => {
        onClose();
        reset();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              {specialtyToEdit ? (
                <Edit2 className="h-4 w-4 text-primary" />
              ) : (
                <Stethoscope className="h-4 w-4 text-primary" />
              )}
            </div>
            {specialtyToEdit ? 'Editar especialidad' : 'Nueva especialidad'}
          </DialogTitle>
          <DialogDescription>
            {specialtyToEdit
              ? 'Modifica los detalles de esta especialidad médica.'
              : 'Registra una nueva especialidad para asignarla a los doctores.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la especialidad</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
              placeholder="Ej. Odontología General, Ortodoncia..."
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color" className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-muted-foreground" /> Color identificador
            </Label>
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-md border shadow-sm shrink-0 overflow-hidden"
                style={{ backgroundColor: data.color }}
              >
                <Input
                  type="color"
                  value={data.color}
                  onChange={(e) => setData('color', e.target.value)}
                  className="h-12 w-12 cursor-pointer opacity-0 -ml-1 -mt-1"
                />
              </div>

              <div className="flex flex-wrap gap-2 flex-1 border rounded-md p-2 bg-slate-50 dark:bg-slate-900/50">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setData('color', c)}
                    className={`h-6 w-6 rounded-full cursor-pointer transition-transform hover:scale-110 ${data.color === c ? 'ring-2 ring-offset-1 ring-slate-400 dark:ring-offset-slate-900' : ''}`}
                    style={{ backgroundColor: c }}
                    aria-label={`Seleccionar color ${c}`}
                  />
                ))}
              </div>
            </div>
            {errors.color && <span className="text-xs text-red-500">{errors.color}</span>}
          </div>

          <div className="bg-muted/30 p-4 rounded-lg border border-border mt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  {data.is_active ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  Estado de la especialidad
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  {data.is_active ? 'Disponible para ser asignada.' : 'Oculta en el sistema.'}
                </p>
              </div>
              <Switch
                className='cursor-pointer'
                checked={data.is_active}
                onCheckedChange={(checked) => setData('is_active', checked)}
              />
            </div>
          </div>

          <DialogFooter className="px-2 py-2 border-t shrink-0 flex flex-col-reverse sm:flex-row gap-2 mt-4">
            <Button className="w-full sm:w-auto cursor-pointer" type="button" variant="ghost" onClick={onClose} disabled={processing}>
              Cancelar
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto min-w-[140px] cursor-pointer" type="submit" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                isEdit ? 'Actualizar' : 'Guardar especialidad'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
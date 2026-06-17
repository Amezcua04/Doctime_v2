import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Activity, Edit2, Loader2, DollarSign, Image as ImageIcon, ShieldAlert, Syringe } from 'lucide-react';
import { CatalogItem, Category } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit: CatalogItem | null;
  categories: Category[];
}

export const CatalogItemModal = ({ isOpen, onClose, itemToEdit, categories }: Props) => {
  const isEdit = !!itemToEdit;
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    type: 'lesion' as 'lesion' | 'preexistence' | 'treatment',
    name: '',
    treatment_category_id: '',
    default_cost: '0',
    requires_surface: true,
    image: null as File | null,
    _method: 'post',
  });

  useEffect(() => {
    if (isOpen) {
      clearErrors();
      if (itemToEdit) {
        setData({
          type: itemToEdit.type,
          name: itemToEdit.name,
          treatment_category_id: itemToEdit.treatment_category_id?.toString() || '',
          default_cost: itemToEdit.default_cost?.toString() || '',
          requires_surface: Boolean(itemToEdit.requires_surface),
          image: null,
          _method: 'put', 
        });
        setImagePreview(itemToEdit.image_path ? `/storage/${itemToEdit.image_path}` : null);
      } else {
        reset();
        setData('_method', 'post');
        setImagePreview(null);
      }
    }
  }, [isOpen, itemToEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('image', file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const url = isEdit ? `/admin/catalogs/${itemToEdit.id}` : '/admin/catalogs';

    post(url, {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => {
        onClose();
        reset();
      }
    });
  };

  const getTypeIcon = () => {
    if (isEdit) return <Edit2 className="h-4 w-4 text-primary" />;
    if (data.type === 'lesion') return <Activity className="h-4 w-4 text-red-500" />;
    if (data.type === 'preexistence') return <ShieldAlert className="h-4 w-4 text-amber-500" />;
    return <Syringe className="h-4 w-4 text-blue-500" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !processing && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-background max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${isEdit ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
              {getTypeIcon()}
            </div>
            {isEdit ? 'Editar registro clínico' : 'Nuevo registro clínico'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifica los detalles, costo o icono de este registro.'
              : 'Agrega una nueva condición, lesión o tratamiento al catálogo.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de registro <span className="text-destructive">*</span></Label>
              <select
                id="type"
                value={data.type}
                onChange={(e) => setData('type', e.target.value as any)}
                disabled={processing || isEdit}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="lesion">Lesión</option>
                <option value="preexistence">Preexistencia</option>
                <option value="treatment">Tratamiento</option>
              </select>
              {errors.type && <span className="text-xs text-red-500">{errors.type}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                placeholder={data.type === 'treatment' ? "Ej. Resina Fotocurable" : "Ej. Caries Profunda"}
                className={errors.name ? 'border-red-500' : ''}
                disabled={processing}
                required
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
            </div>
          </div>
          {data.type === 'treatment' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in zoom-in duration-200">
              <div className="space-y-2">
                <Label htmlFor="treatment_category_id">Categoría <span className="text-destructive">*</span></Label>
                <select
                  id="treatment_category_id"
                  value={data.treatment_category_id}
                  onChange={(e) => setData('treatment_category_id', e.target.value)}
                  disabled={processing}
                  required={data.type === 'treatment'}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Seleccionar...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.treatment_category_id && <span className="text-xs text-red-500">{errors.treatment_category_id}</span>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="default_cost">Costo base ($) <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="default_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={data.default_cost}
                    onChange={(e) => setData('default_cost', e.target.value)}
                    className={`pl-8 ${errors.default_cost ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                    disabled={processing}
                    required={data.type === 'treatment'}
                  />
                </div>
                {errors.default_cost && <span className="text-xs text-red-500">{errors.default_cost}</span>}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="image">Icono Visual (PNG sin fondo o SVG)</Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 rounded-md border flex items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-10 w-10 object-contain" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
                )}
              </div>

              <div className="flex-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/png, image/svg+xml"
                  onChange={handleImageChange}
                  disabled={processing}
                  className="cursor-pointer file:cursor-pointer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Recomendado: Imágenes cuadradas, PNG transparente para superponer en el diente.
                </p>
                {errors.image && <span className="text-xs text-red-500">{errors.image}</span>}
              </div>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg space-y-4 border border-border mt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium flex items-center gap-2">
                  ¿Aplica a caras específicas?
                </Label>
                <p className="text-xs text-muted-foreground pr-4">
                  Desactiva esto si la condición aplica al diente completo (ej. Extracción, Implante) en lugar de a una cara (V, L, M, D, O).
                </p>
              </div>
              <Switch
                className="cursor-pointer"
                checked={data.requires_surface}
                onCheckedChange={(checked) => setData('requires_surface', checked)}
                disabled={processing}
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t">
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
                isEdit ? 'Actualizar registro' : 'Guardar en catálogo'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layers, Plus, Trash2, Edit2, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Category } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

export const CategoryModal = ({ isOpen, onClose, categories }: Props) => {
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      put(`/admin/categories/${editingId}`, {
        preserveScroll: true,
        onSuccess: () => {
          reset();
          setEditingId(null);
          clearErrors();
        }
      });
    } else {
      post('/admin/categories', {
        preserveScroll: true,
        onSuccess: () => {
          reset();
          clearErrors();
        }
      });
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setData('name', cat.name);
    clearErrors();
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset();
    clearErrors();
  };

  const handleDelete = (id: number) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      router.delete(`/admin/categories/${id}`, {
        preserveScroll: true,
        onError: (err) => {
          if (err.error) toast.error(err.error);
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !processing && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20">
              <Layers className="h-4 w-4" />
            </div>
            Categorías de Tratamientos
          </DialogTitle>
          <DialogDescription>
            Administra las clasificaciones para agrupar tus tratamientos.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2 space-y-4">
          {/* Formulario rápido de creación/edición */}
          <form onSubmit={handleSubmit} className="flex gap-2 items-start">
            <div className="flex-1 space-y-1">
              <Input
                placeholder="Nombre de la categoría..."
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
                disabled={processing}
                required
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
            </div>
            {editingId ? (
              <div className="flex gap-1">
                <Button type="submit" disabled={processing} className="cursor-pointer">
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
                </Button>
                <Button type="button" variant="outline" size="icon" onClick={cancelEdit} className="cursor-pointer">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button type="submit" disabled={processing} className="cursor-pointer">
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            )}
          </form>

          {/* Lista de categorías existentes */}
          <div className="border rounded-md divide-y max-h-[40vh] overflow-y-auto">
            {categories.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No hay categorías registradas.
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-3 bg-card hover:bg-accent/50 transition-colors">
                  <span className="text-sm font-medium">{cat.name}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer hover:text-yellow-600" onClick={() => handleEdit(cat)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer hover:text-red-600" onClick={() => handleDelete(cat.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
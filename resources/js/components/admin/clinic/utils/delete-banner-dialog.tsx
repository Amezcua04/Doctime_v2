import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Loader2, Trash2, ImageOff } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bannerId: number | null;
}

export function DeleteBannerDialog({ open, onOpenChange, bannerId }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    if (!bannerId) return;

    setIsDeleting(true);

    router.delete(`/admin/settings/banners/${bannerId}`, {
      preserveScroll: true,
      onSuccess: () => {
        setIsDeleting(false);
        onOpenChange(false);
        toast.success('Banner eliminado correctamente');
      },
      onError: () => {
        setIsDeleting(false);
        toast.error('Error al eliminar el banner');
      },
      onFinish: () => {
        setIsDeleting(false);
      }
    });
  };

  if (!bannerId) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[450px] bg-background border-border">
        <AlertDialogHeader className="gap-3">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <ImageOff className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <AlertDialogTitle className="text-lg font-semibold text-foreground">
                ¿Eliminar banner?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                Esta imagen se eliminará del carrusel de inicio.
              </AlertDialogDescription>
            </div>
          </div>

          <div className="pt-2 text-sm text-muted-foreground text-left">
            Estás a punto de eliminar permanentemente esta imagen del servidor.
            <br className="mb-2" />

            <div className="mt-3 rounded-md bg-muted/50 p-3 text-xs border border-border flex gap-2 items-start">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong>Nota:</strong> Si eliminas este banner, la landing page se actualizará automáticamente para los visitantes.
              </span>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={isDeleting} className="bg-background text-foreground hover:bg-muted cursor-pointer">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            variant="destructive"
            className="w-full sm:w-auto cursor-pointer"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Sí, eliminar imagen'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
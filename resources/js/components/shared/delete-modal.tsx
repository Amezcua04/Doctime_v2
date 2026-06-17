import React from 'react';
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
import { Loader2, Trash2, FileWarning } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title: string;
  contextText: string;
  itemName: string;
  warningText: string;
}

export function DeleteModal({
  open, onOpenChange, onConfirm, isDeleting, title, contextText, itemName, warningText
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={(val) => !isDeleting && onOpenChange(val)}>
      <AlertDialogContent className="sm:max-w-[450px] bg-background border-border">
        <AlertDialogHeader className="gap-3">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex flex-col gap-1 text-left">
              <AlertDialogTitle className="text-lg font-semibold text-foreground">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground">
                Esta acción es irreversible.
              </AlertDialogDescription>
            </div>
          </div>

          <div className="pt-2 text-sm text-muted-foreground text-left">
            {contextText} <span className="font-semibold text-foreground">{itemName}</span>.
            <br className="mb-2" />

            <div className="mt-3 rounded-md bg-amber-50 dark:bg-amber-900/10 p-3 text-xs border border-amber-200 dark:border-amber-800 flex gap-2 items-start text-amber-800 dark:text-amber-200">
              <FileWarning className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>Advertencia:</strong> {warningText}
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
              onConfirm();
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
              'Sí, eliminar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
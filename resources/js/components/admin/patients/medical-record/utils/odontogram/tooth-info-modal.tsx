import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { OdontogramItemState } from '@/types';

interface ToothInfoModalProps {
  toothNumber: number | null;
  items: OdontogramItemState[];
  onClose: () => void;
  onDelete: (itemId: number) => void;
}

export const ToothInfoModal = ({ toothNumber, items, onClose, onDelete }: ToothInfoModalProps) => {
  const toothItems = items.filter(i => i.tooth_number === toothNumber);

  return (
    <Dialog open={toothNumber !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalles del diente {toothNumber}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          {toothItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay registros clínicos en este diente.
            </p>
          ) : (
            <div className="space-y-3">
              {toothItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${item.catalog_item.type === 'lesion' ? 'bg-red-500' :
                        item.catalog_item.type === 'treatment' ? 'bg-blue-500' : 'bg-amber-500'
                      }`} />
                    <div>
                      <p className="text-sm font-semibold">{item.catalog_item.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">Cara: {item.surface}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      if (item.id) onDelete(item.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
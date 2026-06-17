import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BookOpen } from 'lucide-react';

const NOMENCLATURE_DICT = [
  { abbr: 'CM', meaning: 'Cambio de módulos' },
  { abbr: 'S', meaning: 'Superior' },
  { abbr: 'I', meaning: 'Inferior' },
  { abbr: 'SS', meaning: 'Acero (Stainless Steel)' },
  { abbr: 'OC', meaning: 'Open Coil' },
  { abbr: 'CC', meaning: 'Close Coil' },
  { abbr: 'TP', meaning: 'Topes' },
  { abbr: 'GC', meaning: 'Ganchos Clínicos' },
  { abbr: 'SIP', meaning: 'Cinchado' },
  { abbr: 'G', meaning: 'Gomas Intermaxilares' },
  { abbr: 'IPR', meaning: 'Reducción Interproximal (Stripping)' },
  { abbr: 'CE', meaning: 'Cadena Elástica' },
  { abbr: 'L', meaning: 'Ligadura Metálica' },
  { abbr: 'M', meaning: 'Mantenedor' },
  { abbr: 'R', meaning: 'Reposición' },
  { abbr: 'CB', meaning: 'Colocación de Brackets' },
  { abbr: '*', meaning: 'A considerar' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const OrthodonticNomenclature = ({ isOpen, onClose }: Props) => {
  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-background">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Glosario de indicadores
          </DialogTitle>
          <DialogDescription>
            Abreviaturas estandarizadas utilizadas en el control de aparatología y ortodoncia.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-4 max-h-[60vh] overflow-y-auto p-1 text-sm">
          {NOMENCLATURE_DICT.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 border-b border-border/50 pb-2 mb-2">
              <span className="font-bold text-emerald-600 min-w-[35px]">{item.abbr}</span>
              <span className="text-muted-foreground">{item.meaning}</span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
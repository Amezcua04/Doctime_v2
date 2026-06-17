import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signatureBase64: string) => void;
  onCancel: () => void;
}

export const SignaturePad = ({ onSave, onCancel }: SignaturePadProps) => {
  const padRef = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    if (padRef.current) {
      padRef.current.clear();
      setIsEmpty(true);
    }
  };

  const handleSave = () => {
    if (padRef.current && !padRef.current.isEmpty()) {
      const dataURL = padRef.current.getCanvas().toDataURL('image/png');
      onSave(dataURL);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="border-2 border-dashed border-border rounded-xl bg-white overflow-hidden relative touch-none">
        <SignatureCanvas
          ref={padRef}
          penColor="black"
          canvasProps={{
            className: 'w-full h-[200px] cursor-crosshair',
          }}
          onBegin={() => setIsEmpty(false)}
        />
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <span className="text-sm text-muted-foreground select-none">Firme aquí...</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="ghost"
          onClick={handleClear}
          className="text-muted-foreground hover:text-red-600"
        >
          <Eraser className="mr-2 h-4 w-4" />
          Limpiar lienzo
        </Button>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isEmpty}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Check className="mr-2 h-4 w-4" />
            Confirmar firma
          </Button>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Patient, Contract } from '@/types';
import { SignaturePad } from './signature-pad';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  contract: Contract | null;
}

export const SignContractModal = ({ isOpen, onClose, patient, contract }: Props) => {
  const [processing, setProcessing] = useState(false);

  const handleSignatureSave = (signatureBase64: string) => {
    if (!contract) return;
    setProcessing(true);

    router.patch(`/admin/patients/${patient.id}/contracts/${contract.id}/sign`, {
      signature: signatureBase64,
    }, {
      preserveScroll: true,
      onSuccess: () => {
        onClose();
      },
      onFinish: () => setProcessing(false)
    });
  };

  if (!contract) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && !processing && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-background">
        <DialogHeader>
          <DialogTitle>Firma del paciente</DialogTitle>
          <DialogDescription>
            Firmando documento: <span className="font-semibold text-foreground">{contract.title}</span>
          </DialogDescription>
        </DialogHeader>

        <div className={`space-y-4 py-4 ${processing ? "opacity-50 pointer-events-none" : ""}`}>
          <SignaturePad
            onSave={handleSignatureSave}
            onCancel={onClose}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
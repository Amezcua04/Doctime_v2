import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Patient } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export const UploadContractModal = ({ isOpen, onClose, patient }: Props) => {
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    title: '',
    file: null as File | null,
  });

  useEffect(() => {
    if (isOpen) {
      reset();
      clearErrors();
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setData('file', e.target.files[0]);
    }
  };

  const submitUpload = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/admin/patients/${patient.id}/contracts`, {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[450px] bg-background">
        <DialogHeader>
          <DialogTitle>Subir nuevo contrato</DialogTitle>
          <DialogDescription>
            Sube un consentimiento informado o contrato para {patient.name}. Por defecto se marcará como pendiente de firma.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitUpload} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del documento <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              value={data.title}
              onChange={e => setData('title', e.target.value)}
              placeholder="Ej. Consentimiento Informado Ortodoncia"
              required
            />
            {errors.title && <span className="text-xs text-destructive">{errors.title}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Archivo (PDF o Word) <span className="text-destructive">*</span></Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="cursor-pointer file:cursor-pointer"
              required
            />
            {errors.file && <span className="text-xs text-destructive">{errors.file}</span>}
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processing} className="cursor-pointer">
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {processing ? 'Subiendo...' : 'Subir contrato'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
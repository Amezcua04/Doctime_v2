import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Patient } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
}

export const UploadAttachmentModal = ({ isOpen, onClose, patient }: Props) => {
  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    title: '',
    category: 'Radiografía',
    notes: '',
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
    post(`/admin/patients/${patient.id}/attachments`, {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => {
        toast.success('Archivo subido correctamente.');
        onClose();
        reset();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-background">
        <DialogHeader>
          <DialogTitle>Subir nuevo anexo</DialogTitle>
          <DialogDescription>
            Agrega un documento o imagen al expediente de {patient.name}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitUpload} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título del documento <span className="text-destructive">*</span></Label>
            <Input
              id="title"
              value={data.title}
              onChange={e => setData('title', e.target.value)}
              placeholder="Ej. Radiografía panorámica"
              required
            />
            {errors.title && <span className="text-xs text-destructive">{errors.title}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoría <span className="text-destructive">*</span></Label>
            <Select value={data.category} onValueChange={(val) => setData('category', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Radiografía">Radiografía</SelectItem>
                <SelectItem value="Laboratorio">Estudio de laboratorio</SelectItem>
                <SelectItem value="Receta">Receta médica</SelectItem>
                <SelectItem value="Fotografía Clínica">Fotografía clínica</SelectItem>
                <SelectItem value="Otro">Otro documento</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <span className="text-xs text-destructive">{errors.category}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Archivo <span className="text-destructive">*</span></Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="cursor-pointer file:cursor-pointer"
              required
            />
            {errors.file && <span className="text-xs text-destructive">{errors.file}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales (opcional)</Label>
            <Textarea
              id="notes"
              value={data.notes}
              onChange={e => setData('notes', e.target.value)}
              placeholder="Observaciones sobre este archivo..."
              className="resize-none h-20"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processing} className="cursor-pointer">
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {processing ? 'Subiendo...' : 'Subir archivo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
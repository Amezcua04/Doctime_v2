import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Patient, Template } from '@/types';
import { Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  templates: Template[];
}

const SYSTEM_VARIABLES = [
  'clinica_nombre',
  'patient_name',
  'dia_actual',
  'mes_actual',
  'anio_actual',
  'signature_image',
  'date',
  'clinica_logo'
];

export const GenerateContractModal = ({ isOpen, onClose, patient, templates }: Props) => {
  const [dynamicFields, setDynamicFields] = useState<string[]>([]);

  const { data, setData, post, processing, reset } = useForm({
    template_id: '',
    variables: {} as Record<string, string>,
  });

  useEffect(() => {
    if (!data.template_id) {
      setDynamicFields([]);
      setData('variables', {});
      return;
    }

    const selectedTemplate = templates.find(t => t.id.toString() === data.template_id);

    if (selectedTemplate && selectedTemplate.content) {
      const regex = /{{\s*([a-zA-Z0-9_]+)\s*}}/g;
      const matches = [...selectedTemplate.content.matchAll(regex)].map(m => m[1]);
      const requiredVariables = [...new Set(matches)].filter(v => !SYSTEM_VARIABLES.includes(v));

      setDynamicFields(requiredVariables);

      const initialVariables: Record<string, string> = {};
      requiredVariables.forEach(field => {
        initialVariables[field] = '';
      });

      setData('variables', initialVariables);
    }
  }, [data.template_id, templates]);

  const handleVariableChange = (field: string, value: string) => {
    setData('variables', {
      ...data.variables,
      [field]: value
    });
  };

  const formatFieldName = (field: string) => {
    const formatted = field.replace(/_/g, ' ');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const handleClose = () => {
    reset();
    setDynamicFields([]);
    onClose();
  };

  const submitGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    post(`/admin/patients/${patient.id}/contracts/generate`, {
      preserveScroll: true,
      onSuccess: () => {
        handleClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && !processing && handleClose()}>
      <DialogContent className="sm:max-w-[500px] bg-background max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generar documento</DialogTitle>
          <DialogDescription>
            El documento se generará en formato PDF para que el paciente lo lea antes de firmarlo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submitGenerate} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Plantilla de documento <span className="text-destructive">*</span></Label>
            <Select
              value={data.template_id}
              onValueChange={(val) => setData('template_id', val)}
              disabled={processing}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione una plantilla..." />
              </SelectTrigger>
              <SelectContent>
                {templates.map(tpl => (
                  <SelectItem key={tpl.id} value={tpl.id.toString()}>
                    {tpl.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {dynamicFields.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">Información específica</h4>
                <p className="text-sm text-muted-foreground">
                  Esta plantilla requiere datos adicionales para completarse.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {dynamicFields.map((field) => (
                  <div key={field} className="space-y-2">
                    <Label htmlFor={field}>{formatFieldName(field)} <span className="text-destructive">*</span></Label>
                    <Input
                      id={field}
                      value={data.variables[field] || ''}
                      onChange={(e) => handleVariableChange(field, e.target.value)}
                      placeholder={`Ingresa ${formatFieldName(field).toLowerCase()}`}
                      required
                      disabled={processing}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={processing}>
              Cancelar
            </Button>
            <Button type="submit" disabled={processing || !data.template_id} className="cursor-pointer">
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generar PDF
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Patient } from '@/types';
import { Loader2 } from 'lucide-react';

export const ClinicalHistoryTab = ({ patient }: { patient: Patient }) => {
  const { data, setData, put, processing } = useForm({
    blood_type: patient.medical_record?.blood_type || '',
    allergies: patient.medical_record?.allergies || '',
    pathological_history: patient.medical_record?.pathological_history || '',
    non_pathological_history: patient.medical_record?.non_pathological_history || '',
    family_history: patient.medical_record?.family_history || '',
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/admin/patients/${patient.id}/medical-record`, {
      preserveScroll: true,
    });
  };

  return (
    <Card className="my-2 border-border shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 pb-4">
        <CardTitle>Antecedentes e historia clínica</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo de Sangre</Label>
              <Input
                value={data.blood_type}
                onChange={e => setData('blood_type', e.target.value)}
                placeholder="Ej: O+"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alergias</Label>
            <Textarea
              value={data.allergies}
              onChange={e => setData('allergies', e.target.value)}
              placeholder="Describa alergias a medicamentos o sustancias..."
            />
          </div>

          <div className="space-y-2">
            <Label>Antecedentes Patológicos</Label>
            <Textarea
              value={data.pathological_history}
              onChange={e => setData('pathological_history', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Antecedentes No Patológicos</Label>
            <Textarea
              value={data.non_pathological_history}
              onChange={e => setData('non_pathological_history', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Antecedentes Familiares</Label>
            <Textarea
              value={data.family_history}
              onChange={e => setData('family_history', e.target.value)}
            />
          </div>

          <Button type="submit" disabled={processing} className="cursor-pointer">
            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar cambios
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
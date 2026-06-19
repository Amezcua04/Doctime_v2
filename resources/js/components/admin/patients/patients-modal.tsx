import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { User, Phone, MapPin, Calendar, Loader2, Mail } from 'lucide-react';
import { Patient } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingPatient: Patient | null;
}

export const PatientModal = ({ isOpen, onClose, editingPatient }: Props) => {
  const isEdit = !!editingPatient;
  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: 'M',
    address: '',
  });

  useEffect(() => {
    if (editingPatient) {
      const cleanDate = editingPatient.birth_date
        ? editingPatient.birth_date.split('T')[0]
        : '';

      setData({
        name: editingPatient.name,
        email: editingPatient.email || '',
        phone: editingPatient.phone || '',
        birth_date: cleanDate,
        gender: (editingPatient.gender as 'M' | 'F' | 'O') || 'M',
        address: editingPatient.address || '',
      });
    } else {
      reset();
      setData('gender', 'M');
    }
    clearErrors();
  }, [editingPatient, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEdit ? `/admin/patients/${editingPatient.id}` : '/admin/patients';
    const method = isEdit ? put : post;

    method(url, {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border">
        <DialogHeader className="px-6 py-4 border-b bg-muted/40 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            {isEdit ? 'Editar datos del paciente' : 'Registrar nuevo paciente'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Actualiza la información de contacto y datos demográficos básicos.'
              : 'Ingresa los datos personales. El expediente médico se generará automáticamente.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id="patient-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label htmlFor="name">Nombre completo <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Ej. Juan Pérez"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    required
                    className="pl-9 bg-background"
                  />
                </div>
                {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
              </div>

              <div className="space-y-2 col-span-1">
                <Label htmlFor="gender">Género <span className="text-destructive">*</span></Label>
                <Select value={data.gender} onValueChange={(val) => setData('gender', val)}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                    <SelectItem value="O">Otro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <span className="text-xs text-destructive">{errors.gender}</span>}
              </div>

              <div className="space-y-2 col-span-1">
                <Label htmlFor="birth_date">Fecha de nacimiento <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="birth_date"
                    type="date"
                    className="pl-9 bg-background"
                    value={data.birth_date}
                    onChange={e => setData('birth_date', e.target.value)}
                    required
                  />
                </div>
                {errors.birth_date && <span className="text-xs text-destructive">{errors.birth_date}</span>}
              </div>

              <div className="space-y-2 col-span-1">
                <Label htmlFor="phone">Teléfono</Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    placeholder="Ej. 3114000218"
                    className="pl-9 bg-background"
                    value={data.phone}
                    onChange={e => {
                      const soloNumeros = e.target.value.replace(/\D/g, '');
                      setData('phone', soloNumeros.slice(0, 10));
                    }}
                  />
                </div>
                {errors.phone && <span className="text-xs text-destructive">{errors.phone}</span>}
              </div>

              <div className="space-y-2 col-span-1">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@gmail.com"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    className="pl-9 bg-background"
                  />
                </div>
                {errors.email && <span className="text-xs text-destructive">{errors.email}</span>}
              </div>

              <div className="space-y-2 col-span-1 sm:col-span-2">
                <Label htmlFor="address">Dirección física</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="address"
                    placeholder="Calle, Número, Colonia, Ciudad..."
                    className="pl-9 min-h-[80px] bg-background resize-none"
                    value={data.address}
                    onChange={e => setData('address', e.target.value)}
                  />
                </div>
                {errors.address && <span className="text-xs text-destructive">{errors.address}</span>}
              </div>

            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/40 shrink-0 flex flex-col-reverse sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={processing} className="w-full sm:w-auto cursor-pointer">
            Cancelar
          </Button>
          <Button
            type="submit"
            form="patient-form"
            disabled={processing}
            className="w-full sm:w-auto min-w-[140px] cursor-pointer"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              isEdit ? 'Actualizar' : 'Guardar paciente'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
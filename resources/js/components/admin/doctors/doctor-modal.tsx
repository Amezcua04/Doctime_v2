import React, { useEffect, useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Lock, Stethoscope, FileText, Globe, Upload, ChevronsUpDown, Check, X, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User as UserType, Specialty } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingDoctor: UserType | null;
  specialties: Specialty[];
}

const presetColors = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#64748b',
];

export const DoctorModal = ({ isOpen, onClose, editingDoctor, specialties }: Props) => {
  const isEdit = !!editingDoctor;
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [openSpecialties, setOpenSpecialties] = useState(false);

  const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    specialty_ids: [] as number[],
    license: '',
    bio: '',
    is_public: false,
    photo: null as File | null,
    color: '#3b82f6',
    _method: 'post',
  });

  useEffect(() => {
    if (isOpen) {
      clearErrors();
      if (editingDoctor) {
        const currentSpecialties = editingDoctor.medical_profile?.specialties?.map(s => s.id) || [];

        setData({
          name: editingDoctor.name,
          email: editingDoctor.email,
          password: '',
          password_confirmation: '',
          specialty_ids: currentSpecialties,
          license: editingDoctor.medical_profile?.license || '',
          bio: editingDoctor.medical_profile?.bio || '',
          is_public: Boolean(editingDoctor.medical_profile?.is_public),
          photo: null,
          color: editingDoctor.color || '#3b82f6',
          _method: 'put',
        });

        setPhotoPreview(
          editingDoctor.medical_profile?.photo_path
            ? `/storage/${editingDoctor.medical_profile.photo_path}`
            : null
        );
      } else {
        reset();
        setPhotoPreview(null);
      }
    }
  }, [editingDoctor, isOpen]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData('photo', file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const toggleSpecialty = (id: number) => {
    const currentIds = data.specialty_ids;
    if (currentIds.includes(id)) {
      setData('specialty_ids', currentIds.filter(item => item !== id));
    } else {
      setData('specialty_ids', [...currentIds, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = isEdit ? `/admin/doctors/${editingDoctor?.id}` : '/admin/doctors';

    post(url, {
      onSuccess: () => {
        reset();
        onClose();
      },
      preserveScroll: true
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border">

        <DialogHeader className="px-6 py-4 border-b bg-muted/40 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Stethoscope className="h-5 w-5 text-blue-500" />
            {isEdit ? 'Editar perfil médico' : 'Nuevo médico'}
          </DialogTitle>
          <DialogDescription>
            Complete la información de la cuenta y asigne las especialidades del doctor.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id="doctor-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex flex-col items-center gap-2 w-full md:w-auto shrink-0">
                <Label>Foto de perfil</Label>
                <div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-50">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white mb-1" />
                    <span className="text-[10px] text-white font-medium">Subir foto</span>
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handlePhotoChange} />
                  </div>
                </div>
                {errors.photo && <span className="text-xs text-destructive">{errors.photo}</span>}
              </div>

              <div className="flex-1 w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ej. Daniel Velazquez" required />
                  {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input id="email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} placeholder="doctor@sunrise-dentalmx.com" required />
                  {errors.email && <span className="text-xs text-destructive">{errors.email}</span>}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/20">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña {isEdit && <span className="text-muted-foreground font-normal">(opcional)</span>}</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} required={!isEdit} className="pl-9" placeholder="••••••••" />
                </div>
                {errors.password && <span className="text-xs text-destructive">{errors.password}</span>}
              </div>
              <div className="space-y-2">
                <Label>Confirmar contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="password" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} required={!isEdit || data.password.length > 0} className="pl-9" placeholder="••••••••" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 border-b pb-2">
                <FileText className="h-4 w-4 text-primary" /> Información profesional
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-4 items-start">
                
                <div className="space-y-2 flex flex-col md:col-span-1">
                  <Label>Especialidad(es) médicas</Label>
                  <Popover open={openSpecialties} onOpenChange={setOpenSpecialties}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={openSpecialties}
                        className={`w-full justify-between hover:bg-transparent ${data.specialty_ids.length > 0 ? 'h-auto py-1.5' : 'h-10'}`}
                      >
                        {data.specialty_ids.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {data.specialty_ids.map(id => {
                              const spec = specialties.find(s => s.id === id);
                              return spec ? (
                                <Badge
                                  key={id}
                                  variant="secondary"
                                  className="font-normal text-[10px] pr-1.5"
                                  style={{ backgroundColor: `${spec.color}15`, color: spec.color, borderColor: `${spec.color}30` }}
                                >
                                  {spec.name}
                                  <div
                                    role="button"
                                    className="ml-1 ring-offset-background rounded-full outline-none hover:bg-black/20 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                    onKeyDown={(e) => { if (e.key === "Enter") toggleSpecialty(id) }}
                                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSpecialty(id) }}
                                  >
                                    <X className="h-3 w-3" />
                                  </div>
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <span className="text-muted-foreground font-normal">Seleccionar...</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar especialidad..." />
                        <CommandList>
                          <CommandEmpty>No se encontró ninguna especialidad.</CommandEmpty>
                          <CommandGroup className="max-h-64 overflow-y-auto">
                            {specialties?.map((specialty) => (
                              <CommandItem
                                key={specialty.id}
                                value={specialty.name}
                                onSelect={() => toggleSpecialty(specialty.id)}
                                className="cursor-pointer"
                              >
                                <div className={cn("mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary", data.specialty_ids.includes(specialty.id) ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible")}>
                                  <Check className={cn("h-4 w-4")} />
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: specialty.color }} />
                                  {specialty.name}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.specialty_ids && <span className="text-xs text-destructive">Selecciona una especialidad.</span>}
                </div>

                <div className="space-y-2 md:col-span-1">
                  <Label>Cédula profesional</Label>
                  <Input value={data.license} onChange={e => setData('license', e.target.value)} placeholder="Opcional" />
                </div>

              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color" className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" /> Color identificador (Agenda)
                </Label>
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-md border shadow-sm shrink-0 overflow-hidden"
                    style={{ backgroundColor: data.color }}
                  >
                    <Input
                      type="color"
                      id="color"
                      value={data.color}
                      onChange={(e) => setData('color', e.target.value)}
                      className="h-12 w-12 cursor-pointer opacity-0 -ml-1 -mt-1"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 flex-1 border rounded-md p-2 bg-slate-50 dark:bg-slate-900/50">
                    {presetColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setData('color', c)}
                        className={`h-6 w-6 rounded-full cursor-pointer transition-transform hover:scale-110 ${data.color === c ? 'ring-2 ring-offset-1 ring-slate-400 dark:ring-offset-slate-900' : ''}`}
                        style={{ backgroundColor: c }}
                        aria-label={`Seleccionar color ${c}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Se usará como fondo en las citas de este médico dentro del calendario.
                </div>
                {errors.color && <span className="text-xs text-red-500">{errors.color}</span>}
              </div>

              <div className="space-y-2">
                <Label>Biografía / Resumen</Label>
                <Textarea value={data.bio} onChange={e => setData('bio', e.target.value)} placeholder="Breve presentación para el paciente..." className="h-20 resize-none" />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/30">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                    <Globe className="h-4 w-4" /> Mostrar en la página web
                  </Label>
                  <p className="text-[10px] text-muted-foreground">Si se activa, el doctor aparecerá en la sección "Nuestro Equipo" públicamente.</p>
                </div>
                <Switch className='cursor-pointer' checked={data.is_public} onCheckedChange={(val) => setData('is_public', val)} />
              </div>
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/40 shrink-0">
          <Button type="button" variant="outline" onClick={onClose} disabled={processing} className='cursor-pointer'>Cancelar</Button>
          <Button type="submit" form="doctor-form" disabled={processing} className="min-w-[140px] cursor-pointer">
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              isEdit ? 'Actualizar' : 'Guardar médico'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
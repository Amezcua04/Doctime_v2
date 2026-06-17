import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Info, Loader2, Stethoscope, UserCog, Mail, Lock, Shield, FileText } from 'lucide-react';
import { Role, User as UserType } from '@/types';
import { MultiSelect } from '@/components/shared/multi-select';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingUser: UserType | null;
  doctorsList: UserType[];
  roles: Role[];
}

export const StaffModal = ({ isOpen, onClose, editingUser, doctorsList, roles }: Props) => {
  const isEdit = !!editingUser;

  const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
    assigned_doctor_ids: [] as number[],
  });

  useEffect(() => {
    if (editingUser) {
      setData({
        name: editingUser.name,
        email: editingUser.email,
        password: '',
        password_confirmation: '',
        role: editingUser.roles?.[0]?.name || '',
        assigned_doctor_ids: editingUser.doctors?.map(d => d.id) || [],
      });
    } else {
      reset();
      if (roles.length === 1) {
        setData('role', roles[0].name);
      }
    }
    clearErrors();
  }, [editingUser, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const url = isEdit ? `/admin/staff/${editingUser.id}` : '/admin/staff';
    const method = isEdit ? put : post;

    method(url, {
      onSuccess: () => {
        reset();
        onClose();
      }
    });
  };

  const doctorOptions = doctorsList.map(doc => {
    const specialtiesText = doc.medical_profile?.specialties?.length
      ? doc.medical_profile.specialties.map(s => s.name).join(' | ')
      : 'Sin especialidad';

    return {
      label: doc.name,
      value: doc.id,
      description: specialtiesText,
    };
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background border-border">

        <DialogHeader className="px-6 py-4 border-b bg-muted/40 shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              {isEdit ? <UserCog className="h-4 w-4 text-primary" /> : <User className="h-4 w-4 text-primary" />}
            </div>
            {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
          </DialogTitle>
          <DialogDescription>
            Administre la información de acceso del personal administrativo o de asistencia.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form id="user-form" onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    required
                    className="pl-9 bg-background"
                    placeholder="Ej. Ana Laura M."
                  />
                </div>
                {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={e => setData('email', e.target.value)}
                    required
                    className="pl-9 bg-background"
                    placeholder="recepcion@clinica.com"
                  />
                </div>
                {errors.email && <span className="text-xs text-destructive">{errors.email}</span>}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Shield className="h-4 w-4" /> Seguridad
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Contraseña {isEdit && <span className="text-[10px] font-normal text-muted-foreground">(Opcional)</span>}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={data.password}
                      onChange={e => setData('password', e.target.value)}
                      required={!isEdit}
                      className="pl-9 bg-background"
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.password && <span className="text-xs text-destructive">{errors.password}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password_confirmation">Confirmar</Label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password_confirmation"
                      type="password"
                      value={data.password_confirmation}
                      onChange={e => setData('password_confirmation', e.target.value)}
                      required={!isEdit || data.password.length > 0}
                      className="pl-9 bg-background"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rol del usuario</Label>
                <Select
                  value={data.role}
                  onValueChange={(val) => setData('role', val)}
                  disabled={isEdit || roles.length === 1}
                  required
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name === 'admin' ? 'Administrador' : 'Asistente / Recepción'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <span className="text-xs text-destructive">{errors.role}</span>}
              </div>

              {data.role === 'assistant' && (
                <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/20 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <UserCog className="h-4 w-4" />
                      <span className="font-medium text-sm">Asignación de médicos</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-muted-foreground bg-background p-2 rounded border border-border">
                    <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
                    <p>
                      Seleccione los médicos que este asistente gestionará.
                    </p>
                  </div>

                  <MultiSelect
                    options={doctorOptions}
                    selected={data.assigned_doctor_ids}
                    onChange={(selected) => setData('assigned_doctor_ids', selected as number[])}
                    placeholder="Buscar médicos..."
                    className="bg-background"
                  />

                  <p className="text-[10px] text-right text-muted-foreground">
                    {data.assigned_doctor_ids.length} médicos seleccionados
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/40 shrink-0 flex flex-col-reverse sm:flex-row gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={processing} className="w-full sm:w-auto cursor-pointer">
            Cancelar
          </Button>
          <Button
            type="submit"
            form="user-form"
            disabled={processing}
            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto min-w-[140px] cursor-pointer"
          >
            {processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? 'Actualizando...' : 'Guardando...'}
              </>
            ) : (
              isEdit ? 'Actualizar' : 'Guardar usuario'
            )}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
};
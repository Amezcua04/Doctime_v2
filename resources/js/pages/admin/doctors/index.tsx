import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  ArrowUpDown,
  Stethoscope,
  ChevronUp,
  ChevronDown,
  Globe,
  Lock,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Specialty } from '@/types';
import { Pagination } from '@/components/shared/pagination';
import { DoctorModal } from '@/components/admin/doctors/doctor-modal';
import { DeleteModal } from '@/components/shared/delete-modal';
import { ActionTooltip } from '@/components/shared/action-tooltip';

type DoctorsIndexProps = {
  doctors: {
    data: any[];
    links: any[];
  };
  specialties: Specialty[];
  filters: {
    search?: string;
    sort?: string;
    direction?: string;
  };
};

export default function DoctorsIndex({ doctors, specialties, filters }: DoctorsIndexProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any | null>(null);
  const [search, setSearch] = useState(filters.search || '');
  const [doctorToDelete, setDoctorToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        router.get('/admin/doctors', { search, sort: filters.sort, direction: filters.direction }, { preserveState: true, replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openCreateModal = () => {
    setEditingDoctor(null);
    setIsModalOpen(true);
  };

  const openEditModal = (doctor: any) => {
    setEditingDoctor(doctor);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (doctor: any) => {
    setDoctorToDelete(doctor);
  };

  const confirmDelete = () => {
    if (!doctorToDelete) return;

    setIsDeleting(true);

    router.delete(`/admin/doctors/${doctorToDelete.id}`, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setDoctorToDelete(null);
      },
      onFinish: () => {
        setIsDeleting(false);
      }
    });
  };

  const handleSort = (field: string) => {
    let direction = 'asc';
    if (filters.sort === field && filters.direction === 'asc') {
      direction = 'desc';
    }
    router.get('/admin/doctors', {
      search: search,
      sort: field,
      direction: direction
    }, { preserveState: true, replace: true });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (filters.sort !== field) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/30" />;
    return filters.direction === 'asc'
      ? <ChevronUp className="ml-2 h-4 w-4 text-primary" />
      : <ChevronDown className="ml-2 h-4 w-4 text-primary" />;
  };

  return (
    <>
      <Head title="Directorio médico" />
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 p-4 md:p-6 lg:p-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">Directorio de médicos</h1>
            <p className="text-sm text-muted-foreground">Administra los perfiles de los especialistas y su visibilidad pública.</p>
          </div>
          <Button onClick={openCreateModal} className="w-full sm:w-auto shadow-sm cursor-pointer mt-4 sm:mt-0">
            <UserPlus className="mr-2 h-4 w-4" /> Nuevo médico
          </Button>
        </div>

        <Card className="shadow-sm overflow-hidden pb-0">
          <CardHeader className="px-4 pb-0">
            <div className="flex w-full items-center">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, correo o especialidad..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {doctors.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <Stethoscope className="h-8 w-8 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No se encontraron médicos</h3>
                <p className="text-sm">Intenta ajustar tu búsqueda o registra un nuevo especialista.</p>
                {search && (
                  <Button variant="link" onClick={() => setSearch('')} className="mt-2 cursor-pointer">
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead
                        className="w-[300px] cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Médico <SortIcon field="name" />
                        </div>
                      </TableHead>
                      <TableHead>Especialidad</TableHead>
                      <TableHead>Visibilidad web</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {doctors.data.map((doctor) => (
                      <TableRow key={doctor.id} className="hover:bg-muted/50">

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10 border border-slate-200">
                                <AvatarImage src={doctor.medical_profile?.photo_path ? `/storage/${doctor.medical_profile.photo_path}` : ''} />
                                <AvatarFallback className="bg-blue-50 text-blue-600 font-medium">
                                  {doctor.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {!doctor.medical_profile?.photo_path && (
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-[2px] border" title="Sin foto de perfil">
                                  <ImageIcon className="h-3 w-3 text-slate-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{doctor.name}</span>
                                <div 
                                  className="h-2 w-2 rounded-full border border-black/10 shadow-sm shrink-0" 
                                  style={{ backgroundColor: doctor.color || '#3b82f6' }}
                                  title="Color asignado para la agenda"
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">{doctor.email}</span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {doctor.medical_profile?.specialties && doctor.medical_profile.specialties.length > 0 ? (
                              doctor.medical_profile.specialties.map((spec: any) => (
                                <Badge
                                  key={spec.id}
                                  variant="secondary"
                                  className="font-normal text-[10px]"
                                  style={{
                                    backgroundColor: `${spec.color}15`,
                                    color: spec.color,
                                    borderColor: `${spec.color}30`
                                  }}
                                >
                                  {spec.name}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="secondary" className="bg-slate-50 text-slate-500 font-normal dark:bg-slate-800/50">
                                General
                              </Badge>
                            )}
                          </div>
                          {doctor.medical_profile?.license && (
                            <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">
                              Céd: {doctor.medical_profile.license}
                            </p>
                          )}
                        </TableCell>

                        <TableCell>
                          {doctor.medical_profile?.is_public ? (
                            <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50 gap-1 font-normal">
                              <Globe className="h-3 w-3" /> Público
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground gap-1 border-dashed font-normal">
                              <Lock className="h-3 w-3" /> Oculto
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">

                            <ActionTooltip label="Editar">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 cursor-pointer" onClick={() => openEditModal(doctor)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </ActionTooltip>

                            <ActionTooltip label="Eliminar" variant="destructive">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer" onClick={() => openDeleteDialog(doctor)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </ActionTooltip>
                          </div>
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {doctors.data.length > 0 && (
            <CardFooter className="border-t [.border-t]:pt-2 py-2 flex justify-center">
              <Pagination links={doctors.links} />
            </CardFooter>
          )}
        </Card>
      </div>

      <DoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingDoctor={editingDoctor}
        specialties={specialties}
      />

      <DeleteModal
        open={!!doctorToDelete}
        onOpenChange={(open) => !open && setDoctorToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Eliminar médico"
        contextText="Estás a punto de eliminar permanentemente al médico:"
        itemName={doctorToDelete?.name || ''}
        warningText="Esta acción borrará su acceso al sistema, su perfil público y todas sus asignaciones. Los asistentes perderán la vinculación con este médico."
      />
    </>
  );
}

DoctorsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Médicos',
      href: '/admin/doctors',
    },
  ],
};
import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Phone,
  Mail,
  Calendar,
  FolderOpen,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Patient } from '@/types';
import { Pagination } from '@/components/shared/pagination';
import { PatientModal } from '@/components/admin/patients/patients-modal';
import { ActionTooltip } from '@/components/shared/action-tooltip';
import { DeleteModal } from '@/components/shared/delete-modal';

interface IndexProps {
  patients: {
    data: Patient[];
    links: any[];
  };
  filters: {
    search?: string;
    sort?: string;
    direction?: string;
  };
}

export default function PatientsIndex({ patients, filters }: IndexProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        router.get('/admin/patients', {
          search,
          sort: filters.sort,
          direction: filters.direction
        }, { preserveState: true, replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const confirmDelete = () => {
    if (!patientToDelete) return;

    setIsDeleting(true);

    router.delete(`/admin/patients/${patientToDelete.id}`, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setPatientToDelete(null);
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

    router.get('/admin/patients', {
      search,
      sort: field,
      direction
    }, { preserveState: true, replace: true });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (filters.sort !== field) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/30" />;
    return filters.direction === 'asc'
      ? <ChevronUp className="ml-2 h-4 w-4 text-primary" />
      : <ChevronDown className="ml-2 h-4 w-4 text-primary" />;
  };

  const calculateAge = (dateString: string) => {
    if (!dateString) return 0;
    const today = new Date();
    const birthDate = new Date(dateString.split('T')[0] + 'T00:00:00');

    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const openCreateModal = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (patient: Patient) => {
    setPatientToDelete(patient);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const datePart = dateString.split('T')[0];
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <>
      <Head title="Directorio de pacientes" />
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 p-4 md:p-6 lg:p-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">Directorio de pacientes</h1>
            <p className="text-sm text-muted-foreground">Gestión de expedientes e información médica.</p>
          </div>
          <Button onClick={openCreateModal} className="w-full sm:w-auto shadow-sm cursor-pointer mt-4 sm:mt-0">
            <UserPlus className="mr-2 h-4 w-4" /> Nuevo paciente
          </Button>
        </div>

        <Card className="shadow-sm overflow-hidden py-4">
          <CardHeader className="px-4 pb-0">
            <div className="flex w-full items-center">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, teléfono o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {patients.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <Users className="h-8 w-8 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No se encontraron pacientes</h3>
                <p className="text-sm">Intenta ajustar tu búsqueda o agrega un nuevo paciente.</p>
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
                        className="w-75 cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">Paciente <SortIcon field="name" /></div>
                      </TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead
                        className="cursor-pointer hover:text-primary transition-colors"
                        onClick={() => handleSort('birth_date')}
                      >
                        <div className="flex items-center">Edad <SortIcon field="birth_date" /></div>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.data.map((patient) => (
                      <TableRow key={patient.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border">
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {patient.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">{patient.name}</span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                {patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-1 text-xs">
                            {patient.phone ? (
                              <div className="flex items-center text-muted-foreground">
                                <Phone className="mr-1 h-3 w-3" /> {patient.phone}
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">Sin teléfono</span>
                            )}
                            {patient.email && (
                              <div className="flex items-center text-muted-foreground">
                                <Mail className="mr-1 h-3 w-3" /> {patient.email}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{calculateAge(patient.birth_date)} años</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(patient.birth_date)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">

                            <ActionTooltip label="Ver expediente">
                              <Button variant="ghost" size="icon" asChild className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50 cursor-pointer">
                                <Link href={`/admin/patients/${patient.id}/medical-record`}>
                                  <FolderOpen className="h-4 w-4" />
                                </Link>
                              </Button>
                            </ActionTooltip>

                            <ActionTooltip label="Editar">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-yellow-600 hover:bg-yellow-50 cursor-pointer" onClick={() => openEditModal(patient)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </ActionTooltip>

                            <ActionTooltip label="Eliminar" variant="destructive">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50 cursor-pointer" onClick={() => openDeleteDialog(patient)}>
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

          {patients.data.length > 0 && (
            <CardFooter className="border-t [.border-t]:pt-2 py-2 flex justify-center">
              <Pagination links={patients.links} />
            </CardFooter>
          )}
        </Card>
      </div>

      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingPatient={editingPatient}
      />
      <DeleteModal
        open={!!patientToDelete}
        onOpenChange={(open) => !open && setPatientToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="¿Eliminar paciente?"
        contextText="Estás a punto de eliminar permanentemente el registro del paciente:"
        itemName={patientToDelete?.name || ''}
        warningText="Al eliminar este paciente, toda su información clínica, archivos adjuntos y contratos asociados serán removidos del sistema de forma permanente."
      />
    </>
  );
}

PatientsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Pacientes',
      href: '/admin/patients',
    },
  ],
};
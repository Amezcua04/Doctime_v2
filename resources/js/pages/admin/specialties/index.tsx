import React, { useState, useCallback, useRef } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, Edit2, Stethoscope, Palette, AlignLeft, Award } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Specialty } from '@/types';
import { Pagination } from '@/components/shared/pagination';
import { SpecialtyModal } from '@/components/admin/specialties/specialty-modal';
import { DeleteModal } from '@/components/shared/delete-modal';
import { ActionTooltip } from '@/components/shared/action-tooltip';

interface Props {
  specialties: {
    data: Specialty[];
    links: any[];
  };
  filters: {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
  };
}

export default function SpecialtiesIndex({ specialties, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [specialtyToDelete, setSpecialtyToDelete] = useState<Specialty | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useCallback(
    (query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        router.get(
          '/admin/specialties',
          { search: query, sort: filters.sort, direction: filters.direction },
          { preserveState: true, replace: true }
        );
      }, 500);
    },
    [filters.sort, filters.direction]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleSort = (field: string) => {
    let direction = 'asc';
    if (filters.sort === field && filters.direction === 'asc') {
      direction = 'desc';
    }

    router.get('/admin/specialties', {
      search,
      sort: field,
      direction: direction
    }, { preserveState: true, replace: true });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (filters.sort !== field) return <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground/30" />;
    return filters.direction === 'asc'
      ? <ArrowUp className="ml-2 h-3.5 w-3.5 text-primary" />
      : <ArrowDown className="ml-2 h-3.5 w-3.5 text-primary" />;
  };

  const openCreateModal = () => {
    setEditingSpecialty(null);
    setIsModalOpen(true);
  };

  const openEditModal = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setIsModalOpen(true);
  };

  const handleDelete = (specialty: Specialty) => {
    setSpecialtyToDelete(specialty);
  };

  const confirmDelete = () => {
    if (!specialtyToDelete) return;

    setIsDeleting(true);

    router.delete(`/admin/specialties/${specialtyToDelete.id}`, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setSpecialtyToDelete(null);
      },
      onFinish: () => {
        setIsDeleting(false);
      }
    });
  };

  return (
    <>
      <Head title="Directorio de especialidades" />
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 p-4 md:p-6 lg:p-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Directorio de especialidades</h1>
            <p className="text-sm text-muted-foreground">Gestiona las ramas médicas asignables a los doctores.</p>
          </div>
          <Button onClick={openCreateModal} className="w-full sm:w-auto shadow-sm cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Nueva especialidad
          </Button>
        </div>

        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="border-b px-4 py-3">
            <div className="flex w-full items-center">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar especialidad..."
                  className="pl-9 bg-background"
                  value={search}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {specialties.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <Award className="h-8 w-8 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No se encontraron especialidades</h3>
                <p className="text-sm">Agrega ramas médicas para comenzar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">
                        <Button variant="ghost" className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('name')}>
                          Nombre de especialidad <SortIcon field="name" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        Color etiqueta
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('is_active')}>
                          Estado <SortIcon field="is_active" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialties.data.map((specialty) => (
                      <TableRow key={specialty.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${specialty.color}20`, color: specialty.color }}>
                              <Stethoscope className="h-4 w-4" />
                            </div>
                            <span className="text-foreground">{specialty.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm"
                              style={{ backgroundColor: specialty.color }}
                            />
                            <span className="text-xs text-muted-foreground font-mono">{specialty.color}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {specialty.is_active ? (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                              Activa
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-muted-foreground">
                              Inactiva
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">

                            <ActionTooltip label="Editar">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 cursor-pointer" onClick={() => openEditModal(specialty)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </ActionTooltip>

                            <ActionTooltip label="Eliminar" variant="destructive">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer" onClick={() => handleDelete(specialty)}>
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

          {specialties.data.length > 0 && (
            <CardFooter className="border-t py-4 flex justify-center">
              <Pagination links={specialties.links} />
            </CardFooter>
          )}
        </Card>
      </div>

      <SpecialtyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        specialtyToEdit={editingSpecialty}
      />

      <DeleteModal
        open={!!specialtyToDelete}
        onOpenChange={(open) => !open && setSpecialtyToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Eliminar especialidad"
        contextText="Estás a punto de eliminar la especialidad:"
        itemName={specialtyToDelete?.name || ''}
        warningText="Si hay doctores asignados a esta especialidad, perderán dicha vinculación en el sistema. Asegúrate de actualizar los perfiles médicos si es necesario."
      />
    </>
  );
}

SpecialtiesIndex.layout = {
  breadcrumbs: [
    {
      title: 'Especialidades',
      href: '/admin/specialties',
    },
  ],
};
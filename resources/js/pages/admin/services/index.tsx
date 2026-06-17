import React, { useState, useCallback, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Plus, Search, Tag, ArrowUpDown, ArrowUp, ArrowDown, Sparkles, Clock, Globe, Lock, Edit2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Service } from '@/types';
import { Pagination } from '@/components/shared/pagination';
import { ServiceModal } from '@/components/admin/services/service-modal';
import { ActionTooltip } from '@/components/shared/action-tooltip';
import { DeleteModal } from '@/components/shared/delete-modal';
import { toast } from 'sonner';

interface Props {
  services: {
    data: Service[];
    links: any[];
  };
  filters: {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
  };
}

export default function ServicesIndex({ services, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        router.get('/admin/services', {
          search,
          sort: filters.sort,
          direction: filters.direction
        }, { preserveState: true, replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSort = (field: string) => {
    let direction = 'asc';
    if (filters.sort === field && filters.direction === 'asc') {
      direction = 'desc';
    }

    router.get('/admin/services', {
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
    setEditingService(null);
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = (service: Service) => {
    setServiceToDelete(service);
  };

  const confirmDelete = () => {
    if (!serviceToDelete) return;

    setIsDeleting(true);
    router.delete(`/admin/services/${serviceToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setServiceToDelete(null);
      },
      onError: () => {
        toast.error('No se pudo eliminar el servicio. Asegúrate de que no tenga citas asociadas.');
      },
      onFinish: () => setIsDeleting(false),
    });
  };

  return (
    <>
      <Head title="Directorio de servicios" />
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 p-4 md:p-6 lg:p-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Directorio de servicios</h1>
            <p className="text-sm text-muted-foreground">Gestiona los precios y códigos de tus tratamientos.</p>
          </div>
          <Button onClick={openCreateModal} className="w-full sm:w-auto shadow-sm cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Nuevo servicio
          </Button>
        </div>

        <Card className="border-border shadow-sm overflow-hidden">
          <CardHeader className="border-b px-4 py-3">
            <div className="flex w-full items-center">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre..."
                  className="pl-9 bg-background"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {services.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <Tag className="h-8 w-8 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No se encontraron servicios</h3>
                <p className="text-sm">Agrega nuevos tratamientos para comenzar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">
                        <Button variant="ghost" className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('name')}>
                          Nombre del servicio <SortIcon field="name" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('duration_min')}>
                          Duración <SortIcon field="duration_min" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('is_public')}>
                          Web pública <SortIcon field="is_public" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('price')}>
                          Precio <SortIcon field="price" />
                        </Button>
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
                    {services.data.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <Sparkles className="h-4 w-4" />
                            </div>
                            <span className="text-foreground">{service.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {service.duration_min} min
                          </div>
                        </TableCell>
                        <TableCell>
                          {service.is_public ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex w-fit items-center gap-1 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400">
                              <Globe className="h-3 w-3" /> Visible
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground flex w-fit items-center gap-1 border-dashed">
                              <Lock className="h-3 w-3" /> Privado
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          ${Number(service.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {service.is_active ? (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400">
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-muted-foreground">
                              Inactivo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">

                            <ActionTooltip label="Editar">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 cursor-pointer" onClick={() => openEditModal(service)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </ActionTooltip>

                            <ActionTooltip label="Eliminar" variant="destructive">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer" onClick={() => handleDelete(service)}>
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

          {services.data.length > 0 && (
            <CardFooter className="border-t py-4 flex justify-center">
              <Pagination links={services.links} />
            </CardFooter>
          )}
        </Card>
      </div>

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceToEdit={editingService}
      />

      <DeleteModal
        open={!!serviceToDelete}
        onOpenChange={(open) => !open && setServiceToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="¿Eliminar servicio?"
        contextText="Estás a punto de eliminar el tratamiento:"
        itemName={serviceToDelete?.name || ''}
        warningText="Si este servicio ya fue utilizado en citas previas o agendadas, eliminarlo podría afectar el historial. Se recomienda marcarlo como inactivo en lugar de borrarlo."
      />
    </>
  );
}

ServicesIndex.layout = {
  breadcrumbs: [
    {
      title: 'Servicios',
      href: '/admin/services',
    },
  ],
};
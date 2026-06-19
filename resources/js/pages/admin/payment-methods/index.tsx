import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Search, Edit2, Wallet, CreditCard, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { PaymentMethod } from '@/types';
import { Pagination } from '@/components/shared/pagination';
import { PaymentMethodModal } from '@/components/admin/payment-methods/payment-method-modal';
import { DeleteModal } from '@/components/shared/delete-modal';
import { ActionTooltip } from '@/components/shared/action-tooltip';

interface Props {
  methods: {
    data: PaymentMethod[];
    links: any[];
  };
  filters: {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
  };
}

export default function PaymentMethodsIndex({ methods, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PaymentMethod | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        router.get('/admin/payment-methods', {
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

    router.get('/admin/payment-methods', {
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
    setEditingMethod(null);
    setIsModalOpen(true);
  };

  const openEditModal = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    router.delete(`/admin/payment-methods/${itemToDelete.id}`, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: (page: any) => {
        toast.success(page.props.flash?.success || "Método eliminado");
        setItemToDelete(null);
      },
      onError: (errors: any) => {
        if (errors.error) toast.error(errors.error);
        setItemToDelete(null);
      },
      onFinish: () => setIsDeleting(false)
    });
  };

  return (
    <>
      <Head title="Métodos de Pago" />
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 p-4 md:p-6 lg:p-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">Métodos de pago</h1>
            <p className="text-sm text-muted-foreground">Gestiona los métodos disponibles en tu punto de venta.</p>
          </div>
          <Button onClick={openCreateModal} className="w-full sm:w-auto shadow-sm cursor-pointer">
            <Plus className="mr-2 h-4 w-4" /> Nuevo método
          </Button>
        </div>

        <Card className="shadow-sm overflow-hidden pb-0">
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
            {methods.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <CreditCard className="h-8 w-8 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No se encontraron métodos</h3>
                <p className="text-sm">Intenta buscar con otra palabra o agrega un método nuevo.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60%]">
                        <Button variant="ghost" className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('name')}>
                          Nombre del método <SortIcon field="name" />
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
                    {methods.data.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                              <Wallet className="h-4 w-4" />
                            </div>
                            <span className="text-foreground">{method.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {method.is_active ? (
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
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 cursor-pointer" onClick={() => openEditModal(method)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </ActionTooltip>

                            <ActionTooltip label="Eliminar" variant="destructive">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer" onClick={() => setItemToDelete(method)}>
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

          {methods.data.length > 0 && (
            <CardFooter className="border-t [.border-t]:pt-2 py-2 flex justify-center">
              <Pagination links={methods.links} />
            </CardFooter>
          )}
        </Card>
      </div>

      <PaymentMethodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        methodToEdit={editingMethod}
      />

      <DeleteModal
        open={itemToDelete !== null}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="¿Eliminar método de pago?"
        contextText="Estás a punto de eliminar el método:"
        itemName={itemToDelete?.name || ''}
        warningText="Solo podrás eliminarlo si no tiene cobros asociados en el historial de la clínica. Si ya tiene cobros, el sistema bloqueará la acción y te pedirá que mejor lo edites y lo apagues."
      />
    </>
  );
}

PaymentMethodsIndex.layout = {
  breadcrumbs: [
    {
      title: 'Métodos de pago',
      href: '/admin/payment-methods',
    },
  ],
};
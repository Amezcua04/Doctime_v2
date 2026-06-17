import React, { useState, useCallback, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Search, Tag, ArrowUpDown, ArrowUp, ArrowDown, Edit2, Activity, ShieldAlert, Syringe, Image as ImageIcon, Layers } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Pagination } from '@/components/shared/pagination';
import { ActionTooltip } from '@/components/shared/action-tooltip';
import { DeleteModal } from '@/components/shared/delete-modal';
import { toast } from 'sonner';
import { CatalogItem } from '@/types';
import { CatalogItemModal } from '@/components/admin/catalogs/catalog-item-modal';
import { CategoryModal } from '@/components/admin/categories/category-modal';

interface Props {
  items: { data: CatalogItem[]; links: any[] };
  categories: any[];
  filters: { search?: string; type?: string; sort?: string; direction?: 'asc' | 'desc' };
}

export default function ClinicalCatalogIndex({ items, categories, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        router.get('/admin/catalogs', {
          search,
          type: filters.type,
          sort: filters.sort,
          direction: filters.direction
        }, { preserveState: true, replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSort = (field: string) => {
    let direction = 'asc';
    if (filters.sort === field && filters.direction === 'asc') direction = 'desc';
    router.get('/admin/catalogs', { search, type: filters.type, sort: field, direction }, { preserveState: true, replace: true });
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (filters.sort !== field) return <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground/30" />;
    return filters.direction === 'asc' ? <ArrowUp className="ml-2 h-3.5 w-3.5 text-primary" /> : <ArrowDown className="ml-2 h-3.5 w-3.5 text-primary" />;
  };

  const openCreateModal = () => { setEditingItem(null); setIsModalOpen(true); };
  const openEditModal = (item: CatalogItem) => { setEditingItem(item); setIsModalOpen(true); };
  const handleDelete = (item: CatalogItem) => setItemToDelete(item);

  const confirmDelete = () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    router.delete(`/admin/catalogs/${itemToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => setItemToDelete(null),
      onError: () => toast.error('No se pudo eliminar el ítem.'),
      onFinish: () => setIsDeleting(false),
    });
  };

  const getTypeVisuals = (type: string) => {
    switch (type) {
      case 'lesion': return { label: 'Lesión', color: 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', icon: <Activity className="h-3 w-3 mr-1" /> };
      case 'preexistence': return { label: 'Preexistencia', color: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800', icon: <ShieldAlert className="h-3 w-3 mr-1" /> };
      case 'treatment': return { label: 'Tratamiento', color: 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', icon: <Syringe className="h-3 w-3 mr-1" /> };
      default: return { label: type, color: '', icon: null };
    }
  };

  return (
    <>
      <Head title="Catálogo del Odontograma" />
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 p-4 md:p-6 lg:p-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Catálogo clínico</h1>
            <p className="text-sm text-muted-foreground">Gestiona condiciones, lesiones y tratamientos para el odontograma.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setIsCategoryModalOpen(true)}
              className="w-full sm:w-auto shadow-sm cursor-pointer"
            >
              <Layers className="mr-2 h-4 w-4" /> Categorías
            </Button>
            <Button
              onClick={openCreateModal}
              className="w-full sm:w-auto shadow-sm cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" /> Nuevo ítem
            </Button>
          </div>
        </div>

        <Card className="border-border shadow-sm overflow-hidden flex-1 flex flex-col">
          <CardHeader className="border-b px-4 py-3 shrink-0">
            <div className="flex w-full items-center">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar condición..."
                  className="pl-9 bg-background"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1 overflow-auto">
            {items.data.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <Tag className="h-8 w-8 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No se encontraron ítems</h3>
                <p className="text-sm">Agrega nuevas condiciones o tratamientos para comenzar.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Ícono</TableHead>
                    <TableHead>
                      <Button variant="ghost" className="cursor-pointer hover:text-primary transition-colors px-0" onClick={() => handleSort('name')}>
                        Nombre <SortIcon field="name" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" className="cursor-pointer hover:text-primary transition-colors px-0" onClick={() => handleSort('type')}>
                        Tipo <SortIcon field="type" />
                      </Button>
                    </TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">
                      <Button variant="ghost" className="cursor-pointer hover:text-primary transition-colors px-0" onClick={() => handleSort('default_cost')}>
                        Costo base <SortIcon field="default_cost" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.data.map((item) => {
                    const visual = getTypeVisuals(item.type);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="h-10 w-10 rounded-md border flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                            {item.image_path ? (
                              <img src={`/storage/${item.image_path}`} alt={item.name} className="h-6 w-6 object-contain" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`flex w-fit items-center ${visual.color}`}>
                            {visual.icon} {visual.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.type === 'treatment' ? (item.category?.name || 'Sin categoría') : '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {item.type === 'treatment' ? `$${Number(item.default_cost).toFixed(2)}` : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <ActionTooltip label="Editar">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-yellow-600 hover:bg-yellow-50 cursor-pointer" onClick={() => openEditModal(item)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </ActionTooltip>
                            <ActionTooltip label="Eliminar" variant="destructive">
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50 cursor-pointer" onClick={() => handleDelete(item)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </ActionTooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {items.data.length > 0 && (
            <CardFooter className="border-t py-4 flex justify-center shrink-0">
              <Pagination links={items.links} />
            </CardFooter>
          )}
        </Card>
      </div>

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
      />

      <CatalogItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemToEdit={editingItem}
        categories={categories}
      />

      <DeleteModal
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="¿Eliminar ítem clínico?"
        contextText="Estás a punto de eliminar el registro:"
        itemName={itemToDelete?.name || ''}
        warningText="Esta acción no se puede deshacer. Los odontogramas históricos que utilicen esta condición podrían perder su referencia visual."
      />
    </>
  );
}

ClinicalCatalogIndex.layout = {
  breadcrumbs: [
    {
      title: 'Catálogo clínico',
      href: '/admin/catalogs'
    },
  ],
};
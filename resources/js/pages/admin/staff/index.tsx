import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  ArrowUpDown,
  Stethoscope,
  UserCheck,
  ChevronUp,
  ChevronDown,
  Users,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Role, User } from '@/types';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Pagination } from '@/components/shared/pagination';
import { StaffModal } from '@/components/admin/staff/staff-modal';
import { DeleteModal } from '@/components/shared/delete-modal';
import { ActionTooltip } from '@/components/shared/action-tooltip';

type StaffIndexProps = {
  users: {
    data: User[];
    links: any[];
  };
  roles: Role[];
  doctors: User[];
  filters: {
    search?: string;
    sort?: string;
    direction?: string;
  };
};

const roleTranslations: Record<string, string> = {
  super_admin: 'Súper Administrador',
  admin: 'Administrador',
  doctor: 'Médico',
  assistant: 'Asistente / Recepción',
};

export default function StaffIndex({ users, roles, doctors, filters }: StaffIndexProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [search, setSearch] = useState(filters.search || '');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        router.get('/admin/staff', { search }, { preserveState: true, replace: true });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const openCreateModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDelete = () => {
    if (!userToDelete) return;

    setIsDeleting(true);

    router.delete(`/admin/staff/${userToDelete.id}`, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setUserToDelete(null);
      },
      onFinish: () => {
        setIsDeleting(false);
      }
    });
  };

  const renderDetails = (user: User) => {
    const role = user.roles?.[0]?.name;

    if (role === 'assistant') {
      const assignedDoctors = user.doctors || [];
      const displayLimit = 2;
      const visibleDoctors = assignedDoctors.slice(0, displayLimit);
      const remainingCount = assignedDoctors.length - displayLimit;

      return (
        <div className="flex flex-col gap-1">
          <span className="flex items-center text-xs text-muted-foreground mb-1">
            <UserCheck className="mr-1.5 h-3.5 w-3.5" />
            Asignado a {assignedDoctors.length} médicos
          </span>

          <div className="flex flex-wrap gap-1 items-center">
            {visibleDoctors.map(doc => (
              <Badge key={doc.id} variant="outline" className="text-[10px] border-border bg-muted/50 font-normal">
                {doc.name}
              </Badge>
            ))}

            {remainingCount > 0 && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="text-[10px] cursor-help hover:bg-muted transition-colors"
                  >
                    +{remainingCount} más...
                  </Badge>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-3 shadow-lg">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground mb-2 border-b pb-1">
                      Médicos Asignados
                    </h4>
                    <div className="grid gap-2 max-h-[200px] overflow-y-auto pr-1">
                      {assignedDoctors.map((doc) => {
                        const specialtyName = doc.medical_profile?.specialties?.[0]?.name || 'General';

                        return (
                          <div key={doc.id} className="flex items-start gap-3 p-1 rounded hover:bg-muted/50 transition-colors">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {doc.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium leading-none">
                                {doc.name}
                              </span>
                              <span className="text-xs text-muted-foreground mt-1">
                                {specialtyName}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}

            {assignedDoctors.length === 0 && (
              <span className="text-[10px] italic text-muted-foreground">Sin asignar</span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic">
        <ShieldCheck className="h-3.5 w-3.5" />
        Gestión Administrativa
      </div>
    );
  };

  const handleSort = (field: string) => {
    let direction = 'asc';
    if (filters.sort === field && filters.direction === 'asc') {
      direction = 'desc';
    }
    router.get('/admin/staff', {
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
      <Head title="Directorio de usuarios" />
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 p-4 md:p-6 lg:p-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">Directorio de usuarios</h1>
            <p className="text-sm text-muted-foreground">Administra accesos, roles y asignaciones del personal.</p>
          </div>
          <Button onClick={openCreateModal} className="w-full sm:w-auto shadow-sm cursor-pointer mt-4 sm:mt-0">
            <UserPlus className="mr-2 h-4 w-4" /> Nuevo usuario
          </Button>
        </div>

        <Card className="shadow-sm overflow-hidden py-4">
          <CardHeader className="px-4 pb-0">
            <div className="flex w-full items-center">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o correo..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {users.data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <Users className="h-8 w-8 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No se encontraron usuarios</h3>
                <p className="text-sm">Intenta ajustar tu búsqueda o agrega un nuevo miembro al equipo.</p>
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
                        <div className="flex items-center">
                          Usuario <SortIcon field="name" />
                        </div>
                      </TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Detalle / Asignación</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.data.map((user) => {
                      const roleName = user.roles?.[0]?.name || '';

                      return (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border">
                                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                  {user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground">{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize bg-primary/10 text-primary font-medium">
                              {roleTranslations[roleName] || roleName.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {renderDetails(user)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">

                              <ActionTooltip label="Editar">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 cursor-pointer" onClick={() => openEditModal(user)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </ActionTooltip>

                              <ActionTooltip label="Eliminar" variant="destructive">
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer" onClick={() => openDeleteDialog(user)}>
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
              </div>
            )}
          </CardContent>

          {users.data.length > 0 && (
            <CardFooter className="border-t [.border-t]:pt-2 py-2 flex justify-center">
              <Pagination links={users.links} />
            </CardFooter>
          )}
        </Card>
      </div>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={editingUser}
        doctorsList={doctors}
        roles={roles}
      />

      <DeleteModal
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Eliminar usuario"
        contextText="Estás a punto de revocar el acceso a:"
        itemName={userToDelete?.name || ''}
        warningText="Esta acción eliminará permanentemente al usuario del sistema. Todas sus configuraciones de perfil, sesiones activas y asignaciones médicas (en caso de ser asistente) se perderán."
      />
    </>
  );
}

StaffIndex.layout = {
  breadcrumbs: [
    {
      title: 'Usuarios',
      href: '/admin/staff',
    },
  ],
};
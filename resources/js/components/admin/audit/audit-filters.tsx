import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FilterX } from 'lucide-react';
import { ActionTooltip } from '@/components/shared/action-tooltip';

interface AuditFiltersProps {
  filters: any;
  options: any;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

export function AuditFilters({ filters, options, onSearchChange, onFilterChange, onReset }: AuditFiltersProps) {
  return (
    <CardHeader className="px-4 pb-0">
      <CardTitle className="text-sm">Filtros de búsqueda</CardTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
        <div className="relative col-span-1 md:col-span-2 lg:col-span-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar descripción..."
            className="pl-9 bg-background"
            value={filters.search || ''}
            onChange={onSearchChange}
          />
        </div>

        <Select value={filters.type || 'all'} onValueChange={(val) => onFilterChange('type', val)}>
          <SelectTrigger><SelectValue placeholder="Módulo" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los módulos</SelectItem>
            {options.types.map((type: any) => (
              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.event || 'all'} onValueChange={(val) => onFilterChange('event', val)}>
          <SelectTrigger><SelectValue placeholder="Evento" /></SelectTrigger>
          <SelectContent>
            {options.events.map((event: any) => (
              <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.user_id || 'all'} onValueChange={(val) => onFilterChange('user_id', val)}>
          <SelectTrigger><SelectValue placeholder="Usuario" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cualquier usuario</SelectItem>
            {options.users.map((user: any) => (
              <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center justify-end sm:justify-start">
          <ActionTooltip label="Limpiar filtros">
            <Button variant="ghost" onClick={onReset} size="icon" className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-50 cursor-pointer shrink-0">
              <FilterX className="h-4 w-4" />
            </Button>
          </ActionTooltip>
        </div>
      </div>
    </CardHeader>
  );
}
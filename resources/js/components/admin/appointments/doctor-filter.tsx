import React from 'react';
import { Check, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Doctor {
  id: number;
  name: string;
  color?: string;
}

interface Props {
  doctors: Doctor[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
}

export function DoctorFilter({ doctors, selectedIds, onChange }: Props) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const clearFilter = () => onChange([]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 border-dashed cursor-pointer max-w-full">
          <Filter className="mr-2 h-4 w-4 shrink-0" />
          <span className="hidden sm:inline">Médicos</span>
          <span className="sm:hidden">Filtro</span>
          
          {selectedIds.length > 0 && (
            <>
              <div className="mx-2 h-4 w-[1px] bg-slate-200 shrink-0" />
              <div className="flex space-x-1 overflow-hidden">
                {selectedIds.length > 1 ? (
                  // Si hay más de 1, mostramos el contador
                  <Badge variant="secondary" className="rounded-sm px-1.5 font-normal whitespace-nowrap">
                    {selectedIds.length} <span className="hidden sm:inline ml-1">seleccionados</span>
                  </Badge>
                ) : (
                  // Si solo hay 1, mostramos el nombre truncado para que no rompa el diseño en móviles
                  doctors
                    .filter((doc) => selectedIds.includes(doc.id))
                    .map((doc) => (
                      <Badge
                        variant="secondary"
                        key={doc.id}
                        className="rounded-sm px-1.5 font-normal flex items-center gap-1.5 max-w-[100px] sm:max-w-[150px]"
                      >
                        <div 
                          className="h-2 w-2 shrink-0 rounded-full shadow-sm border border-black/10" 
                          style={{ backgroundColor: doc.color || '#3b82f6' }}
                        />
                        <span className="truncate">{doc.name}</span>
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar médico..." />
          <CommandList>
            <CommandEmpty>No encontrado.</CommandEmpty>
            <CommandGroup>
              {doctors.map((doc) => {
                const isSelected = selectedIds.includes(doc.id);
                return (
                  <CommandItem
                    key={doc.id}
                    onSelect={() => handleSelect(doc.id)}
                    className="cursor-pointer flex items-center"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className={cn("h-4 w-4")} />
                    </div>
                    <div 
                      className="mr-2 h-2.5 w-2.5 shrink-0 rounded-full shadow-sm border border-black/10" 
                      style={{ backgroundColor: doc.color || '#3b82f6' }}
                    />
                    <span className="truncate">{doc.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedIds.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={clearFilter}
                    className="justify-center text-center font-medium cursor-pointer"
                  >
                    Limpiar filtros
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
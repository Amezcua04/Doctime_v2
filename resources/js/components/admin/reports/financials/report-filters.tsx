import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { CalendarDays, FilterX, FileSpreadsheet, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportFiltersProps {
  params: { start_date: string; end_date: string; doctor_id: string; method_id: string };
  setParams: React.Dispatch<React.SetStateAction<{ start_date: string; end_date: string; doctor_id: string; method_id: string }>>;
  filters: any;
  doctors: any[];
  paymentMethods: any[];
  isExporting: boolean;
  onExport: () => void;
}

export function ReportFilters({ params, setParams, filters, doctors, paymentMethods, isExporting, onExport }: ReportFiltersProps) {
  const [openDoctorPopover, setOpenDoctorPopover] = useState(false);

  const hasActiveFilters =
    params.start_date !== filters.startDate ||
    params.end_date !== filters.endDate ||
    params.doctor_id !== 'all' ||
    params.method_id !== 'all';

  const clearFilters = () => {
    setParams({
      start_date: filters.startDate,
      end_date: filters.endDate,
      doctor_id: 'all',
      method_id: 'all',
    });
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">Finanzas y movimientos</h1>
          <p className="text-sm text-muted-foreground">Analiza ingresos, rentabilidad y audita pagos.</p>
        </div>
        <Button
          variant="outline"
          onClick={onExport}
          disabled={isExporting}
          className="w-full sm:w-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all cursor-pointer"
        >
          <FileSpreadsheet className={`mr-2 h-4 w-4 ${isExporting ? 'animate-bounce text-emerald-600' : ''}`} />
          {isExporting ? 'Procesando...' : 'Exportar a Excel'}
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="grid grid-cols-2 gap-4 flex-1">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Fecha inicio</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-9 h-10 w-full cursor-pointer" value={params.start_date} onChange={e => setParams({ ...params, start_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Fecha fin</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-9 h-10 w-full cursor-pointer" value={params.end_date} onChange={e => setParams({ ...params, end_date: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {doctors.length > 0 && (
                <div className="space-y-1.5 flex-1">
                  <Label className="text-xs text-muted-foreground">Médico</Label>
                  <Popover open={openDoctorPopover} onOpenChange={setOpenDoctorPopover}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={openDoctorPopover} className="w-full justify-between h-10 cursor-pointer">
                        <span className="truncate">{params.doctor_id === 'all' ? 'Todos' : doctors.find(d => d.id.toString() === params.doctor_id)?.name || 'Seleccionar...'}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar médico..." />
                        <CommandList>
                          <CommandEmpty>Sin resultados.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem onSelect={() => { setParams({ ...params, doctor_id: 'all' }); setOpenDoctorPopover(false); }}>
                              <Check className={cn("mr-2 h-4 w-4", params.doctor_id === 'all' ? "opacity-100" : "opacity-0")} />
                              Todos los médicos
                            </CommandItem>
                            {doctors.map((doc) => (
                              <CommandItem key={doc.id} value={doc.name} onSelect={() => { setParams({ ...params, doctor_id: doc.id.toString() }); setOpenDoctorPopover(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", params.doctor_id === doc.id.toString() ? "opacity-100" : "opacity-0")} />
                                {doc.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
              <div className="space-y-1.5 flex-1">
                <Label className="text-xs text-muted-foreground">Método</Label>
                <Select value={params.method_id} onValueChange={val => setParams({ ...params, method_id: val })}>
                  <SelectTrigger className="h-10 cursor-pointer"><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem className="cursor-pointer" value="all">Todos</SelectItem>
                    {paymentMethods.map(method => (
                      <SelectItem className="cursor-pointer" key={method.id} value={method.id.toString()}>{method.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpiar filtros" className="h-10 w-10 text-muted-foreground hover:text-red-500 hover:bg-red-50 cursor-pointer">
                    <FilterX className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
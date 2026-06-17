import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar, Stethoscope, Check, ChevronsUpDown, AlertCircle, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User, Patient } from '@/types';

interface Props {
  data: any;
  setData: (key: string, value: any) => void;
  errors: any;
  patients: Patient[];
  doctors: User[];
  isAuthDoctor: boolean | undefined;
  isEdit: boolean;
}

export const AppointmentForm = ({ data, setData, errors, patients, doctors, isAuthDoctor, isEdit }: Props) => {
  const [patientOpen, setPatientOpen] = React.useState(false);
  const [doctorOpen, setDoctorOpen] = React.useState(false);
  const selectedPatientName = patients.find(p => p.id.toString() === data.patient_id)?.name;
  const selectedDoctorName = doctors.find(d => d.id.toString() === data.doctor_id)?.name;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2 md:col-span-2">
          <Label className="text-xs font-bold text-slate-500 uppercase">Paciente</Label>
          <Popover open={patientOpen} onOpenChange={setPatientOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={patientOpen} className="w-full justify-between h-11">
                <div className="flex items-center gap-2 truncate">
                  <UserIcon className="h-4 w-4 opacity-50" />
                  {selectedPatientName || "Buscar paciente..."}
                </div>
                <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[550px] p-0">
              <Command>
                <CommandInput placeholder="Buscar paciente..." />
                <CommandList>
                  <CommandEmpty>No encontrado.</CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-auto">
                    {patients.map((patient) => (
                      <CommandItem key={patient.id} value={patient.name} onSelect={() => { setData('patient_id', patient.id.toString()); setPatientOpen(false); }}>
                        <Check className={cn("mr-2 h-4 w-4", data.patient_id === patient.id.toString() ? "opacity-100" : "opacity-0")} />
                        {patient.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.patient_id && <span className="text-xs text-red-500">{errors.patient_id}</span>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase">Médico</Label>
          <Popover open={doctorOpen} onOpenChange={setDoctorOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" disabled={isAuthDoctor} className="w-full justify-between h-11">
                <div className="flex items-center gap-2 truncate">
                  <Stethoscope className="h-4 w-4 opacity-50" />
                  {selectedDoctorName ? `Dr. ${selectedDoctorName}` : "Seleccione..."}
                </div>
                {!isAuthDoctor && <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[260px] p-0">
              <Command>
                <CommandInput placeholder="Buscar médico..." />
                <CommandList>
                  <CommandEmpty>No encontrado.</CommandEmpty>
                  <CommandGroup>
                    {doctors.map((doc) => (
                      <CommandItem key={doc.id} value={doc.name} onSelect={() => { setData('doctor_id', doc.id.toString()); setDoctorOpen(false); }}>
                        <Check className={cn("mr-2 h-4 w-4", data.doctor_id === doc.id.toString() ? "opacity-100" : "opacity-0")} />
                        {doc.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.doctor_id && <span className="text-xs text-red-500">{errors.doctor_id}</span>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-500 uppercase">Fecha</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input type="date" className="pl-9 h-11" value={data.date} onChange={e => setData('date', e.target.value)} />
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label className="text-xs font-bold text-slate-500 uppercase">Horario</Label>
          <div className="flex items-center gap-4">
            <Input type="time" className={cn("flex-1 text-center bg-slate-50", errors.start_time && "border-red-500")} value={data.start_time} onChange={e => setData('start_time', e.target.value)} />
            <span className="text-slate-300 text-2xl">→</span>
            <Input type="time" className={cn("flex-1 text-center bg-slate-50", errors.end_time && "border-red-500")} value={data.end_time} onChange={e => setData('end_time', e.target.value)} />
          </div>
          {(errors.start_time || errors.end_time) && (
            <div className="flex flex-col gap-1 mt-1">
              {errors.start_time && <span className="text-xs text-red-500">{errors.start_time}</span>}
              {errors.end_time && <span className="text-xs text-red-500">{errors.end_time}</span>}
            </div>
          )}
        </div>
      </div>
      {errors.schedule && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-sm text-red-700 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-600" />
          <div className="flex flex-col">
            <span className="font-bold">No se puede agendar esta cita:</span>
            <span className="text-red-600/90 mt-0.5">{errors.schedule}</span>
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-500 uppercase">Notas</Label>
        <Textarea placeholder="Detalles..." className="min-h-[80px]" value={data.notes} onChange={e => setData('notes', e.target.value)} />
      </div>
      {isEdit && (
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs font-bold text-slate-500 uppercase">Estado</Label>
          <Select value={data.status} onValueChange={(val) => setData('status', val)}>
            <SelectTrigger className="h-10 cursor-pointer"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem className='cursor-pointer' value="scheduled">Programada</SelectItem>
              <SelectItem className='cursor-pointer' value="confirmed">Confirmada</SelectItem>
              <SelectItem className='cursor-pointer' value="arrived">En sala de espera</SelectItem>
              <SelectItem className='cursor-pointer' value="in_progress">En consulta</SelectItem>
              <SelectItem className='cursor-pointer' value="completed">Completada</SelectItem>
              <SelectItem className='cursor-pointer' value="cancelled">Cancelada</SelectItem>
              <SelectItem className='cursor-pointer' value="no_show">No asistió</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
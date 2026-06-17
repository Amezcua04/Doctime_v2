import React from 'react';
import { User, Phone, MapPin, AlertCircle, Droplet, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Patient } from '@/types';

interface Props {
  patient: Patient;
}

export function PatientHeader({ patient }: Props) {
  const calculateAge = (dateString: string) => {
    if (!dateString) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateString.split('T')[0] + 'T00:00:00');
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-border shadow-sm p-5 md:p-6">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            {patient.name}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant="secondary" className="font-normal">
              {patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'}, {calculateAge(patient.birth_date)} años
            </Badge>

            {patient.medical_record?.blood_type && (
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800 font-normal">
                <Droplet className="w-3 h-3 mr-1" /> {patient.medical_record.blood_type}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
            <Phone className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 w-full overflow-hidden">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-500 uppercase tracking-wider">Contacto del Paciente</span>
              {patient.phone ? (
                <span className="text-blue-950 dark:text-blue-200 font-medium leading-tight truncate">{patient.phone}</span>
              ) : (
                <span className="text-blue-700/60 dark:text-blue-400/60 text-xs italic">Sin teléfono registrado</span>
              )}
              {patient.email && (
                <span className="text-blue-700/80 dark:text-blue-400/80 text-xs truncate" title={patient.email}>{patient.email}</span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
            <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 w-full overflow-hidden">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-wider">Dirección</span>
              {patient.address ? (
                <span className="text-emerald-950 dark:text-emerald-200 font-medium leading-tight line-clamp-2" title={patient.address}>
                  {patient.address}
                </span>
              ) : (
                <span className="text-emerald-700/60 dark:text-emerald-400/60 text-xs italic mt-0.5">Sin dirección registrada</span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 w-full overflow-hidden">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-500 uppercase tracking-wider">Alergias Conocidas</span>
              {patient.medical_record?.allergies ? (
                <span className="text-rose-950 dark:text-rose-200 font-medium leading-tight line-clamp-2" title={patient.medical_record.allergies}>
                  {patient.medical_record.allergies}
                </span>
              ) : (
                <span className="text-rose-700/60 dark:text-rose-400/60 italic font-normal text-xs mt-0.5">Ninguna registrada</span>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
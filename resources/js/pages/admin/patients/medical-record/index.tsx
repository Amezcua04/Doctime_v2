import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Patient, ProgressNote, Template } from '@/types';
import { ClinicalHistoryTab } from '@/components/admin/patients/medical-record/clinical-history-tab';
import { PatientHeader } from '@/components/admin/patients/medical-record/utils/patient-header';
import { AttachmentsTab } from '@/components/admin/patients/medical-record/attachments-tab';
import { ContractsTab } from '@/components/admin/patients/medical-record/contracts-tab';
import { OrthodonticProgress } from '@/components/admin/patients/medical-record/utils/orthodontic-progress';

interface Props {
  patient: Patient & {
    orthodontic_notes?: ProgressNote[];
  };
  templates: Template[];
}

export default function MedicalRecordIndex({ patient, templates }: Props) {
  return (
    <>
      <Head title={`Expediente: ${patient.name}`} />
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 p-4 md:p-6 lg:p-4">

        <div className="flex items-center">
          <Link href="/admin/patients" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al directorio
          </Link>
        </div>

        <PatientHeader patient={patient} />

        <Tabs defaultValue="orthodontic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-[700px] mb-6">
            <TabsTrigger value="orthodontic">Ortodoncia</TabsTrigger>
            <TabsTrigger value="clinical_history">Historia clínica</TabsTrigger>
            <TabsTrigger value="attachments">Anexos y estudios</TabsTrigger>
            <TabsTrigger value="contracts">Contratos y firmas</TabsTrigger>
          </TabsList>

          <TabsContent value="orthodontic" className="space-y-6">
            <OrthodonticProgress
              patientId={patient.id}
              initialNotes={patient.orthodontic_notes || []}
            />
          </TabsContent>

          <TabsContent value="clinical_history" className="space-y-6">
            <ClinicalHistoryTab patient={patient} />
          </TabsContent>

          <TabsContent value="attachments" className="space-y-6">
            <AttachmentsTab patient={patient} />
          </TabsContent>

          <TabsContent value="contracts" className="space-y-6">
            <ContractsTab patient={patient} contracts={patient.contracts || []} templates={templates} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

MedicalRecordIndex.layout = (page: React.ReactElement<Props>) => (
  <AppLayout
    breadcrumbs={[
      {
        title: 'Pacientes',
        href: '/admin/patients',
      },
      {
        title: `Expediente: ${page?.props?.patient?.name}`,
        href: '#',
      },
    ]}
  >
    {page}
  </AppLayout>
);
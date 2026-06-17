import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
  ArrowLeft,
  Syringe,
  Smile,
  ClipboardList,
  Paperclip,
  FileSignature
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CatalogItem, Patient, ProgressNote, Template } from '@/types';
import { ClinicalHistoryTab } from '@/components/admin/patients/medical-record/clinical-history-tab';
import { PatientHeader } from '@/components/admin/patients/medical-record/utils/patient-header';
import { AttachmentsTab } from '@/components/admin/patients/medical-record/attachments-tab';
import { ContractsTab } from '@/components/admin/patients/medical-record/contracts-tab';
import { OrthodonticProgress } from '@/components/admin/patients/medical-record/utils/orthodontic-progress';
import { OdontogramTab } from '@/components/admin/patients/medical-record/odontogram-tab';

interface Props {
  patient: Patient & {
    orthodontic_notes?: ProgressNote[];
    odontogram_items?: any[];
  };
  templates: Template[];
  catalogItems: CatalogItem[];
}

export default function MedicalRecordIndex({ patient, templates, catalogItems }: Props) {
  return (
    <>
      <Head title={`Expediente: ${patient.name}`} />
      <div className="flex min-h-[calc(100vh-6rem)] flex-col gap-4 sm:gap-6 p-4 md:p-6 lg:p-4 w-full max-w-[100vw] overflow-x-hidden">

        <div className="flex items-center">
          <Link href="/admin/patients" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Volver al directorio</span>
            <span className="sm:hidden">Volver</span>
          </Link>
        </div>

        <PatientHeader patient={patient} />

        <Tabs defaultValue="odontogram" className="w-full flex flex-col">
          <div className="w-full overflow-x-auto pb-2 -mb-2 custom-scrollbar">

            <TabsList className="flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-5 lg:max-w-[1000px] mb-6 h-auto px-1 gap-1">

              <TabsTrigger value="odontogram" className="flex items-center justify-center gap-2 px-3 py-0 min-w-12">
                <Syringe className="h-4 w-4 shrink-0" />
                <span className="hidden sm:block truncate">Odontograma</span>
              </TabsTrigger>

              <TabsTrigger value="orthodontic" className="flex items-center justify-center px-3 py-0 min-w-12">
                <Smile className="h-4 w-4 shrink-0" />
                <span className="hidden sm:block truncate">Ortodoncia</span>
              </TabsTrigger>

              <TabsTrigger value="clinical_history" className="flex items-center justify-center px-3 py-0 min-w-12">
                <ClipboardList className="h-4 w-4 shrink-0" />
                <span className="hidden sm:block truncate">Historia clínica</span>
              </TabsTrigger>

              <TabsTrigger value="attachments" className="flex items-center justify-center px-3 py-0 min-w-12">
                <Paperclip className="h-4 w-4 shrink-0" />
                <span className="hidden sm:block truncate">Anexos y estudios</span>
              </TabsTrigger>

              <TabsTrigger value="contracts" className="flex items-center justify-center px-3 py-0 min-w-12">
                <FileSignature className="h-4 w-4 shrink-0" />
                <span className="hidden sm:block truncate">Contratos y firmas</span>
              </TabsTrigger>

            </TabsList>
          </div>

          <TabsContent value="odontogram" className="space-y-6 mt-4 sm:mt-0">
            <OdontogramTab
              patientId={patient.id}
              initialItems={patient.odontogram_items || []}
              catalogItems={catalogItems}
            />
          </TabsContent>

          <TabsContent value="orthodontic" className="space-y-6 mt-4 sm:mt-0">
            <OrthodonticProgress
              patientId={patient.id}
              initialNotes={patient.orthodontic_notes || []}
            />
          </TabsContent>

          <TabsContent value="clinical_history" className="space-y-6 mt-4 sm:mt-0">
            <ClinicalHistoryTab patient={patient} />
          </TabsContent>

          <TabsContent value="attachments" className="space-y-6 mt-4 sm:mt-0">
            <AttachmentsTab patient={patient} />
          </TabsContent>

          <TabsContent value="contracts" className="space-y-6 mt-4 sm:mt-0">
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
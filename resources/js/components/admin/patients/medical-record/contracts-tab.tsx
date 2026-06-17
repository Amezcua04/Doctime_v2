import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Patient, Contract, Template } from '@/types';
import { FileSignature, FilePlus, Trash2, Download, Eye, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { DeleteModal } from '@/components/shared/delete-modal';
import { ActionTooltip } from '@/components/shared/action-tooltip';
import { UploadContractModal } from './utils/upload-contract-modal';
import { GenerateContractModal } from './utils/generate-contract-modal';
import { SignContractModal } from './utils/sign-contract-modal';

interface Props {
  patient: Patient;
  contracts: Contract[];
  templates: Template[];
}

export const ContractsTab = ({ patient, contracts, templates }: Props) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [contractToSign, setContractToSign] = useState<Contract | null>(null);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = () => {
    if (!contractToDelete) return;
    setIsDeleting(true);

    router.delete(`/admin/patients/${patient.id}/contracts/${contractToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setContractToDelete(null);
      },
      onFinish: () => setIsDeleting(false),
    });
  };

  const markAsSigned = (contractId: number) => {
    router.patch(`/admin/patients/${patient.id}/contracts/${contractId}/sign`, {}, {
      preserveScroll: true,
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <Card className="my-2 border-border shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 pb-4">
          <div>
            <CardTitle>Contratos y consentimientos</CardTitle>
            <CardDescription>
              Gestione los documentos legales y el estatus de firma del paciente.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsUploadModalOpen(true)} className="cursor-pointer bg-white">
              <FilePlus className="mr-2 h-4 w-4" />
              Subir PDF
            </Button>
            <Button onClick={() => setIsGenerateModalOpen(true)} className="cursor-pointer">
              <FileSignature className="mr-2 h-4 w-4" />
              Generar plantilla
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/5">
              <div className="rounded-full bg-muted p-4 mb-3">
                <FileSignature className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No hay contratos registrados</h3>
              <p className="text-sm max-w-sm mt-1">Este paciente aún no tiene consentimientos informados o contratos asociados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="flex flex-col p-4 border border-border rounded-xl bg-card hover:shadow-md transition-shadow relative group">

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-3 pr-2">
                      <div className={`p-2.5 rounded-lg ${contract.status === 'signed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                        <FileSignature className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-semibold text-sm leading-tight" title={contract.title}>{contract.title}</h4>
                        <span className="text-xs text-muted-foreground mt-1">
                          Creado: {formatDate(contract.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    {contract.status === 'signed' ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800">
                        <CheckCircle className="mr-1 h-3 w-3" /> Firmado {contract.signed_at && `el ${formatDate(contract.signed_at)}`}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                        <Clock className="mr-1 h-3 w-3" /> Pendiente de firma
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t mt-auto">
                    <div className="flex gap-1">
                      <ActionTooltip label="Ver documento">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50 cursor-pointer" asChild>
                          <a
                            href={`/admin/patients/${patient.id}/contracts/${contract.id}/view`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      </ActionTooltip>

                      <ActionTooltip label="Descargar">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50 cursor-pointer" asChild>
                          <a href={`/admin/patients/${patient.id}/contracts/${contract.id}/download`} >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </ActionTooltip>
                    </div>

                    <div className="flex gap-1">
                      {contract.status !== 'signed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs cursor-pointer text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          onClick={() => {
                            if (contract.is_generated) {
                              setContractToSign(contract);
                            } else {
                              markAsSigned(contract.id);
                            }
                          }}
                        >
                          {contract.is_generated ? 'Firmar Documento' : 'Marcar Firmado'}
                        </Button>
                      )}

                      <ActionTooltip label="Eliminar" variant="destructive">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          onClick={() => setContractToDelete(contract)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </ActionTooltip>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <UploadContractModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        patient={patient}
      />

      <GenerateContractModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        patient={patient}
        templates={templates}
      />

      <SignContractModal
        isOpen={!!contractToSign}
        onClose={() => setContractToSign(null)}
        patient={patient}
        contract={contractToSign}
      />

      <DeleteModal
        open={!!contractToDelete}
        onOpenChange={(open) => !open && setContractToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="¿Eliminar contrato?"
        contextText="Estás a punto de eliminar el contrato:"
        itemName={contractToDelete?.title || ''}
        warningText="Esta acción eliminará el archivo del servidor de manera permanente."
      />
    </div>
  );
};
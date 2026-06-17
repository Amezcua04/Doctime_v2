import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Patient, Attachment } from '@/types';
import { FileText, Image as ImageIcon, FilePlus, Trash2, Download, Eye, FileArchive } from 'lucide-react';
import { DeleteModal } from '@/components/shared/delete-modal';
import { UploadAttachmentModal } from './utils/upload-attachment-modal';
import { ActionTooltip } from '@/components/shared/action-tooltip';

interface Props {
  patient: Patient;
}

export const AttachmentsTab = ({ patient }: Props) => {
  const attachments = patient.medical_record?.attachments || [];

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<Attachment | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = () => {
    if (!fileToDelete) return;
    setIsDeleting(true);

    router.delete(`/admin/patients/${patient.id}/attachments/${fileToDelete.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        setFileToDelete(null);
      },
      onFinish: () => setIsDeleting(false),
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Radiografía': return <ImageIcon className="h-5 w-5 text-indigo-500" />;
      case 'Laboratorio': return <FileText className="h-5 w-5 text-emerald-500" />;
      default: return <FileArchive className="h-5 w-5 text-blue-500" />;
    }
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
            <CardTitle>Anexos y estudios</CardTitle>
            <CardDescription>
              Gestione radiografías, resultados de laboratorio y otros documentos clínicos.
            </CardDescription>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)} className="cursor-pointer">
            <FilePlus className="mr-2 h-4 w-4" />
            Subir archivo
          </Button>
        </CardHeader>

        <CardContent className="p-6">
          {attachments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl bg-muted/5">
              <div className="rounded-full bg-muted p-4 mb-3">
                <FileArchive className="h-8 w-8 opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-foreground">No hay archivos anexos</h3>
              <p className="text-sm max-w-sm mt-1">Este expediente aún no contiene documentos o estudios. Sube el primero haciendo clic en el botón superior.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex flex-col p-4 border border-border rounded-xl bg-card hover:shadow-md transition-shadow relative group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-muted rounded-lg">
                        {getCategoryIcon(attachment.category)}
                      </div>
                      <div className="flex flex-col">
                        <h4 className="font-semibold text-sm line-clamp-1" title={attachment.title}>{attachment.title}</h4>
                        <span className="text-xs text-muted-foreground">{formatDate(attachment.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <Badge variant="secondary" className="w-fit text-[10px] mb-3">
                    {attachment.category}
                  </Badge>

                  {attachment.notes && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4 flex-1">
                      {attachment.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t mt-auto">
                    <div className="flex gap-2">
                      <ActionTooltip label="Ver anexo">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50 cursor-pointer" asChild>
                          <a
                            href={`/admin/patients/${patient.id}/attachments/${attachment.id}/view`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      </ActionTooltip>

                      <ActionTooltip label="Descargar">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600 hover:bg-blue-50 cursor-pointer" asChild>
                          <a href={`/admin/patients/${patient.id}/attachments/${attachment.id}/download`} >
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </ActionTooltip>
                    </div>

                    <ActionTooltip label="Eliminar" variant="destructive">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        onClick={() => setFileToDelete(attachment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </ActionTooltip>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <UploadAttachmentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        patient={patient}
      />

      <DeleteModal
        open={!!fileToDelete}
        onOpenChange={(open) => !open && setFileToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="¿Eliminar archivo adjunto?"
        contextText="Estás a punto de eliminar el archivo:"
        itemName={fileToDelete?.title || ''}
        warningText="Esta acción eliminará el archivo del servidor de manera permanente y no podrá recuperarse."
      />
    </div>
  );
};
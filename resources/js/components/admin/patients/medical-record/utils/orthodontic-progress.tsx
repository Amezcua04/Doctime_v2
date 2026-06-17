import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Save, Trash2, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { ProgressNote } from '@/types';
import { DeleteModal } from '@/components/shared/delete-modal';
import { OrthodonticNomenclature } from './orthodontic-nomenclature';

export const OrthodonticProgress = ({ patientId, initialNotes = [] }: { patientId: number, initialNotes?: ProgressNote[] }) => {

  const sortNotesDesc = (notesArray: ProgressNote[]) => {
    return [...notesArray].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  };

  const [notes, setNotes] = useState<ProgressNote[]>(sortNotesDesc(initialNotes));
  const [isSaving, setIsSaving] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<{ index: number; id?: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setNotes(sortNotesDesc(initialNotes));
  }, [initialNotes]);

  const addRow = () => {
    const today = new Date().toISOString().split('T')[0];
    setNotes([
      { date: today, upper_arch: '', lower_arch: '', others: '', planned_operation: '', isNew: true },
      ...notes
    ]);
  };

  const handleChange = (index: number, field: keyof ProgressNote, value: string) => {
    const newNotes = [...notes];
    newNotes[index] = { ...newNotes[index], [field]: value };
    setNotes(newNotes);
  };

  const requestDelete = (index: number, id?: number) => {
    setNoteToDelete({ index, id });
  };

  const confirmDelete = () => {
    if (!noteToDelete) return;

    if (noteToDelete.id) {
      setIsDeleting(true);
      router.delete(`/admin/patients/${patientId}/orthodontic-notes/${noteToDelete.id}`, {
        preserveScroll: true,
        onSuccess: () => {
          setNoteToDelete(null);
        },
        onFinish: () => setIsDeleting(false),
      });
    } else {
      const newNotes = [...notes];
      newNotes.splice(noteToDelete.index, 1);
      setNotes(newNotes);
      setNoteToDelete(null);
    }
  };

  const saveNotes = () => {
    setIsSaving(true);

    const payload = notes.map(note => ({
      id: note.id,
      date: note.date,
      upper_arch: note.upper_arch,
      lower_arch: note.lower_arch,
      others: note.others,
      planned_operation: note.planned_operation
    }));

    router.post(`/admin/patients/${patientId}/orthodontic-notes`, {
      notes: payload as any
    }, {
      preserveScroll: true,
      onSuccess: () => {
        setIsSaving(false);
      },
      onError: () => {
        toast.error('Ocurrió un error al guardar la bitácora');
        setIsSaving(false);
      }
    });
  };

  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
    });
  };

  return (
    <Card className="my-2 border-border shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/10 pb-4">
        <div>
          <CardTitle>Aparatología y evolución</CardTitle>
          <CardDescription>Control de citas, arcos y mecánica de ortodoncia.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setIsDictionaryOpen(true)} className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
            <BookOpen className="mr-2 h-4 w-4" />
            Nomenclatura
          </Button>

          <Button variant="outline" onClick={addRow} className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Nueva cita
          </Button>
          <Button onClick={saveNotes} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Guardar
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[140px] border-r">Fecha</TableHead>
                <TableHead className="min-w-[200px] border-r">Arcada superior</TableHead>
                <TableHead className="min-w-[200px] border-r">Arcada inferior</TableHead>
                <TableHead className="min-w-[150px] border-r">Otros</TableHead>
                <TableHead className="min-w-[250px]">Operación planeada</TableHead>
                <TableHead className="w-[50px] text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                    No hay registros de evolución. Presiona "Nueva cita" para comenzar.
                  </TableCell>
                </TableRow>
              ) : (
                notes.map((note, index) => (
                  <TableRow key={note.id || index} className={note.isNew ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}>
                    <TableCell className="border-r p-2">
                      <Input
                        type="date"
                        value={note.date}
                        onChange={(e) => handleChange(index, 'date', e.target.value)}
                        className="h-8 border-transparent focus-visible:ring-1 focus-visible:border-input bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border-r p-2">
                      <Input
                        value={note.upper_arch || ''}
                        onChange={(e) => handleChange(index, 'upper_arch', e.target.value)}
                        placeholder="Ej. 16 X 16 SS SUP"
                        className="h-8 border-transparent focus-visible:ring-1 focus-visible:border-input bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border-r p-2">
                      <Input
                        value={note.lower_arch || ''}
                        onChange={(e) => handleChange(index, 'lower_arch', e.target.value)}
                        placeholder="Ej. 14 NITI INF"
                        className="h-8 border-transparent focus-visible:ring-1 focus-visible:border-input bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="border-r p-2">
                      <Input
                        value={note.others || ''}
                        onChange={(e) => handleChange(index, 'others', e.target.value)}
                        placeholder="..."
                        className="h-8 border-transparent focus-visible:ring-1 focus-visible:border-input bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="p-2 border-r">
                      <Input
                        value={note.planned_operation || ''}
                        onChange={(e) => handleChange(index, 'planned_operation', e.target.value)}
                        placeholder="Ej. Cambio de ligas..."
                        className="h-8 border-transparent focus-visible:ring-1 focus-visible:border-input bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="text-center p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600 cursor-pointer"
                        onClick={() => requestDelete(index, note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <OrthodonticNomenclature
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />

      <DeleteModal
        open={!!noteToDelete}
        onOpenChange={(open) => !open && setNoteToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="¿Eliminar registro de evolución?"
        contextText="Estás a punto de eliminar el registro del día:"
        itemName={noteToDelete ? getFormattedDate(notes[noteToDelete.index]?.date) : ''}
        warningText="Esta acción eliminará los datos de esta cita permanentemente."
      />
    </Card>
  );
};
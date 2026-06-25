import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { CatalogItem, OdontogramItemState } from '@/types';
import { toast } from 'sonner';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, X } from 'lucide-react';

interface BudgetPanelProps {
  patientId: number;
  odontogramId: number;
  plannedItems: OdontogramItemState[];
  catalogItems: CatalogItem[];
  // NUEVAS PROPS PARA CONTROLAR LA VISIBILIDAD DESDE EL PADRE
  onSuccessSave?: () => void;
  onCancel?: () => void;
}

export const BudgetPanel = ({ patientId, odontogramId, plannedItems, catalogItems, onSuccessSave, onCancel }: BudgetPanelProps) => {
  const buildInitialItems = () => {
    return plannedItems.map(item => {
      const catalog = item.catalog_item;
      
      return {
        odontogram_item_id: item.id,
        catalog_item_id: catalog?.id || 0,
        name: catalog?.name || 'Tratamiento',
        tooth_number: item.tooth_number,
        surface: item.surface,
        unit_price: Number(catalog?.default_cost || 0),
        quantity: 1,
        discount: 0,
        is_included: true,
      };
    });
  };

  const getDefaultValidDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  const { data, setData, post, processing, transform, reset } = useForm({
    patient_id: patientId,
    odontogram_id: odontogramId === 0 ? null : odontogramId,
    valid_until: getDefaultValidDate(),
    global_discount: 0,
    notes: '',
    internal_notes: '',
    items: buildInitialItems(),
  });

  useEffect(() => {
    setData('items', buildInitialItems());
  }, [plannedItems]);

  transform((formData) => ({
    ...formData,
    odontogram_id: formData.odontogram_id === 0 ? null : formData.odontogram_id,
    items: formData.items
      .filter(item => item.is_included)
      .map(item => ({
        ...item,
        discount: (item.unit_price * item.quantity) * (item.discount / 100)
      }))
  }));

  const activeItems = data.items.filter(i => i.is_included);
  const subtotal = activeItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
  const totalItemDiscounts = activeItems.reduce((acc, item) => acc + ((item.unit_price * item.quantity) * (item.discount / 100)), 0);
  const finalTotal = Math.max(0, subtotal - totalItemDiscounts - Number(data.global_discount));

  const handleToggleInclude = (index: number, checked: boolean) => {
    const newItems = [...data.items];
    newItems[index].is_included = checked;
    setData('items', newItems);
  };

  const handlePercentageChange = (index: number, value: string) => {
    let val = Number(value);
    if (val < 0) val = 0;
    if (val > 100) val = 100;

    const newItems = [...data.items];
    newItems[index].discount = val;
    setData('items', newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    post(`/admin/patients/${patientId}/budgets`, {
      preserveScroll: true,
      onSuccess: (page: any) => {
        const newBudgetId = page.props.flash?.new_budget_id;
        if (newBudgetId) {
          window.open(`/admin/patients/${patientId}/budgets/${newBudgetId}/export`, '_blank');
        }
        
        reset(); // Limpia los campos
        
        // Ejecutamos la función del padre para ocultar el panel
        if (onSuccessSave) {
          onSuccessSave();
        }
      },
      onError: (errors) => {
        console.error(" Errores de validación de Laravel:", errors);
        toast.error("Faltan campos obligatorios en el formulario");
      }
    });
  };

  return (
    <Card className="w-full shadow-sm border-muted">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold">Generar presupuesto</CardTitle>
          <CardDescription>
            Selecciona los tratamientos a cotizar y ajusta los descuentos.
          </CardDescription>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-muted-foreground">Total Estimado</p>
          <p className="text-3xl font-extrabold text-primary">${finalTotal.toFixed(2)}</p>
        </div>
      </CardHeader>

      <CardContent>
        <form id="budget-form" onSubmit={handleSubmit} className="space-y-8">
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-12.5 text-center">Incluir</TableHead>
                  <TableHead>Tratamiento a realizar</TableHead>
                  <TableHead className="text-right">Precio</TableHead>
                  <TableHead className="text-right w-[120px]">Descuento (%)</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((item, idx) => {
                  const itemTotal = (item.unit_price * item.quantity) * (1 - (item.discount / 100));

                  return (
                    <TableRow key={idx} className={!item.is_included ? 'bg-muted/20 opacity-60 grayscale-[50%]' : ''}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={item.is_included}
                          onCheckedChange={(checked) => handleToggleInclude(idx, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {item.name}
                        <span className="text-muted-foreground text-xs block mt-0.5">
                          Pieza: {item.tooth_number} {item.surface !== 'general' ? `| Cara: ${item.surface}` : ''}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="relative flex items-center justify-end">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            disabled={!item.is_included}
                            className="h-8 text-right pr-6 w-full"
                            value={item.discount || ''}
                            onChange={(e) => handlePercentageChange(idx, e.target.value)}
                          />
                          <span className="absolute right-2 text-muted-foreground text-sm">%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">${itemTotal.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col md:flex-row gap-8 justify-between items-start">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="notes">Notas para el paciente</Label>
                <Textarea id="notes" placeholder="Ej. Este presupuesto tiene una vigencia de 30 días..." className="resize-none h-24" value={data.notes} onChange={e => setData('notes', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="valid_until">Vigencia del Presupuesto (Opcional)</Label>
                <Input id="valid_until" type="date" className="w-full md:w-[200px]" value={data.valid_until} onChange={e => setData('valid_until', e.target.value)} />
              </div>
            </div>

            <div className="w-full md:w-1/3 space-y-4 bg-muted/30 p-5 rounded-lg border border-muted">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <Label htmlFor="global_discount" className="text-muted-foreground font-normal">Descuento Global ($):</Label>
                <Input id="global_discount" type="number" min="0" className="h-8 w-24 text-right bg-background" value={data.global_discount || ''} onChange={e => setData('global_discount', Number(e.target.value))} />
              </div>
              <div className="pt-4 mt-2 border-t flex justify-between items-center">
                <span className="text-base font-semibold">Total a Pagar:</span>
                <span className="text-lg font-bold text-primary">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex justify-end border-t pt-6 bg-muted/10 rounded-b-xl gap-3">
        {/* Botón de Cancelar */}
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={processing}>
            Cancelar
          </Button>
        )}
        <Button type="submit" form="budget-form" disabled={processing || activeItems.length === 0} className="min-w-[200px]">
          {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {processing ? 'Procesando...' : 'Guardar presupuesto'}
        </Button>
      </CardFooter>
    </Card>
  );
};
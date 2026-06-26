import React, { useState, useEffect } from 'react';
import { CatalogItem, OdontogramItemState, Surface } from '@/types';
import { toast } from 'sonner';
import { router } from '@inertiajs/react';
import { OdontogramGrid } from './utils/odontogram/odontogram-grid';
import { ActionMenuPanel } from './utils/odontogram/action-menu-panel';
import { ToothInfoModal } from './utils/odontogram/tooth-info-modal';
import { BudgetPanel } from './utils/odontogram/budget-panel';
import { Calculator } from 'lucide-react'; 
import { Button } from '@/components/ui/button'; 

interface Props {
  patientId: number;
  odontogramId: number;
  initialItems: OdontogramItemState[];
  catalogItems: CatalogItem[];
}

type InteractionMode = 'select' | 'info';

interface SelectionZone {
  tooth_number: number;
  surface: Surface | 'general';
}

export const OdontogramTab = ({ patientId, odontogramId, initialItems, catalogItems }: Props) => {
  const [items, setItems] = useState<OdontogramItemState[]>(initialItems);
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('select');
  const [selectedToothInfo, setSelectedToothInfo] = useState<number | null>(null);
  const [selectedZones, setSelectedZones] = useState<SelectionZone[]>([]);
  
  const [showBudget, setShowBudget] = useState(false);

  // ✅ FILTRO ACTUALIZADO: Solo planificados que NO están en un presupuesto activo
  const plannedItems = items.filter(item => 
    item.status === 'planned' && !(item as any).is_active_in_budget
  );

  useEffect(() => {
    setItems(initialItems);
    
    // ✅ SEGURIDAD ACTUALIZADA: Verifica la misma lógica de exclusión
    const availablePlanned = initialItems.filter(item => 
      item.status === 'planned' && !(item as any).is_active_in_budget
    );

    if (availablePlanned.length === 0) {
      setShowBudget(false);
    }
  }, [initialItems]);

  const handleSelectMode = (mode: InteractionMode) => {
    setInteractionMode(mode);
    setSelectedZones([]);
  };

  const handleSurfaceClick = (toothNumber: number, surface: Surface | 'general') => {
    if (interactionMode === 'info') {
      setSelectedToothInfo(toothNumber);
      return;
    }

    if (interactionMode === 'select') {
      setSelectedZones(prev => {
        const exists = prev.find(z => z.tooth_number === toothNumber && z.surface === surface);
        if (exists) {
          return prev.filter(z => !(z.tooth_number === toothNumber && z.surface === surface));
        }
        return [...prev, { tooth_number: toothNumber, surface }];
      });
    }
  };

  const handleSelectTool = (tool: CatalogItem) => {
    if (selectedZones.length === 0) {
      toast.info('Selecciona al menos una cara o diente primero.');
      return;
    }

    const validZones = selectedZones.filter(zone => {
      if (tool.requires_surface && zone.surface === 'general') return false;
      if (!tool.requires_surface && zone.surface !== 'general') return false;
      return true;
    });

    if (validZones.length === 0) {
      toast.error('Esta herramienta no aplica para la selección actual.');
      return;
    }

    router.post(`/admin/patients/${patientId}/odontogram/items`, {
      catalog_item_id: tool.id,
      zones: validZones as any[],
    }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setSelectedZones([]);
      },
    });
  };

  const handleBatchErase = () => {
    if (selectedZones.length === 0) {
      toast.info('Selecciona las zonas que deseas borrar primero.');
      return;
    }

    const idsToDelete = items.filter(item =>
      selectedZones.some(z => z.tooth_number === item.tooth_number && z.surface === item.surface)
    ).map(item => item.id);

    if (idsToDelete.length === 0) {
      toast.error('No hay registros clínicos para borrar en esta selección.');
      return;
    }

    router.post(`/admin/patients/${patientId}/odontogram/items/batch-delete`, {
      ids: idsToDelete as any[],
    }, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setSelectedZones([]);
      },
    });
  };

  const handleDeleteSingleItem = (itemId: number) => {
    router.delete(`/admin/patients/${patientId}/odontogram/items/${itemId}`, {
      preserveScroll: true,
      preserveState: true,
    });
  };

  return (
    <div className={`transition-all duration-300 w-full h-full relative flex flex-col
      ${interactionMode === 'info' ? 'ring-4 ring-indigo-100 rounded-xl' : ''}
    `}>

      {selectedZones.length > 0 && interactionMode === 'select' && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm md:absolute md:top-4 md:bottom-auto md:w-auto z-50 bg-primary text-primary-foreground px-4 py-2.5 md:py-1.5 rounded-full shadow-xl text-sm font-medium animate-in slide-in-from-bottom-4 md:slide-in-from-top-2 flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/90"
          onClick={() => setSelectedZones([])}
        >
          <span className="truncate">
            {selectedZones.length} {selectedZones.length > 1 ? 'zonas seleccionadas' : 'zona seleccionada'}
          </span>
          <span className="opacity-70 text-xs shrink-0">— Clic para cancelar</span>
        </div>
      )}

      <OdontogramGrid
        items={items}
        selectedZones={selectedZones}
        onSurfaceClick={handleSurfaceClick}
        catalogItems={catalogItems}
        interactionMode={interactionMode}
        onSelectTool={handleSelectTool}
        onSelectMode={handleSelectMode}
        onErase={handleBatchErase}
      />

      <ToothInfoModal
        toothNumber={selectedToothInfo}
        items={items}
        onClose={() => setSelectedToothInfo(null)}
        onDelete={handleDeleteSingleItem}
      />

      {plannedItems.length > 0 && (
        <div className="mt-8 border-t border-gray-200 pt-8 animate-in fade-in duration-300">
          {!showBudget ? (
            <div className="flex flex-col items-center justify-center space-y-3 bg-muted/20 p-6 rounded-xl border border-dashed border-muted-foreground/30">
              <p className="text-sm font-medium text-muted-foreground">
                Tienes {plannedItems.length} tratamiento(s) sin presupuestar
              </p>
              <Button onClick={() => setShowBudget(true)} size="lg" className="shadow-sm">
                <Calculator className="w-4 h-4 mr-2" />
                Preparar Presupuesto
              </Button>
            </div>
          ) : (
            <BudgetPanel
              patientId={patientId}
              odontogramId={odontogramId}
              plannedItems={plannedItems}
              catalogItems={catalogItems}
              onSuccessSave={() => setShowBudget(false)}
              onCancel={() => setShowBudget(false)} 
            />
          )}
        </div>
      )}

    </div>
  );
};
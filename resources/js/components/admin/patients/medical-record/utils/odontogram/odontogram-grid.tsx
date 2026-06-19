import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Activity, PanelRightClose, PanelRightOpen, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { CatalogItem, OdontogramItemState, SelectionZone, Surface } from '@/types';
import { ToolsPanel } from './tools-panel';
import { InteractiveTooth } from './interactive-tooth';
import { ActionMenuPanel } from './action-menu-panel'; // <-- Inyectado directamente

const PERMANENT = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
  lowerLeft: [31, 32, 33, 34, 35, 36, 37, 38]
};

const TEMPORARY = {
  upperRight: [55, 54, 53, 52, 51],
  upperLeft: [61, 62, 63, 64, 65],
  lowerRight: [85, 84, 83, 82, 81],
  lowerLeft: [71, 72, 73, 74, 75]
};

interface OdontogramGridProps {
  items: OdontogramItemState[];
  selectedZones: SelectionZone[];
  onSurfaceClick: (toothNumber: number, surface: Surface | 'general') => void;
  catalogItems: CatalogItem[];
  interactionMode: 'select' | 'info';
  onSelectTool: (tool: CatalogItem) => void;
  onSelectMode: (mode: 'select' | 'info') => void;
  onErase: () => void;
}

export const OdontogramGrid = ({
  items,
  selectedZones,
  onSurfaceClick,
  catalogItems,
  interactionMode,
  onSelectTool,
  onSelectMode,
  onErase
}: OdontogramGridProps) => {
  const [activeTab, setActiveTab] = useState('permanente');
  const [activeSidePanel, setActiveSidePanel] = useState<'left' | 'right' | null>(
    typeof window !== 'undefined' && window.innerWidth > 1024 ? 'left' : null
  );
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeTypeFilter, setActiveTypeFilter] = useState<'lesion' | 'treatment' | 'preexistence' | null>(null);

  const layout = activeTab === 'permanente' ? PERMANENT : TEMPORARY;

  const checkVisibility = (num: number) => {
    if (!activeFilter) return true;
    switch (activeFilter) {
      case 'upper': return (num >= 11 && num <= 28) || (num >= 51 && num <= 65);
      case 'lower': return (num >= 31 && num <= 48) || (num >= 71 && num <= 85);
      case 's1': return [18, 17, 16, 15, 14, 55, 54].includes(num);
      case 's2': return [13, 12, 11, 21, 22, 23, 53, 52, 51, 61, 62, 63].includes(num);
      case 's3': return [24, 25, 26, 27, 28, 64, 65].includes(num);
      case 's4': return [38, 37, 36, 35, 34, 75, 74].includes(num);
      case 's5': return [33, 32, 31, 41, 42, 43, 73, 72, 71, 81, 82, 83].includes(num);
      case 's6': return [44, 45, 46, 47, 48, 84, 85].includes(num);
      default: return true;
    }
  };

  const handleFilterToggle = (filterId: string) => setActiveFilter(activeFilter === filterId ? null : filterId);
  const handleTypeFilterToggle = (type: 'lesion' | 'treatment' | 'preexistence') => setActiveTypeFilter(activeTypeFilter === type ? null : type);
  const toggleLeftPanel = () => setActiveSidePanel(prev => prev === 'left' ? null : 'left');
  const toggleRightPanel = () => setActiveSidePanel(prev => prev === 'right' ? null : 'right');

  const renderQuadrant = (teethArray: number[], isUpper: boolean) => (
    <div className="flex gap-1 sm:gap-2">
      {teethArray.map(num => {
        const filteredItems = items.filter(i =>
          i.tooth_number === num &&
          (!activeTypeFilter || i.catalog_item.type === activeTypeFilter)
        );

        const surfacesForThisTooth = selectedZones
          .filter(z => z.tooth_number === num)
          .map(z => z.surface);

        return (
          <InteractiveTooth
            key={num}
            number={num}
            isUpper={isUpper}
            isVisible={checkVisibility(num)}
            items={filteredItems}
            selectedSurfaces={surfacesForThisTooth}
            onSurfaceClick={onSurfaceClick}
          />
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col w-full bg-white dark:bg-slate-950 rounded-xl border border-border shadow-sm overflow-hidden">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 border-b border-border bg-slate-50/50 dark:bg-slate-900/50">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="bg-slate-200/50 dark:bg-slate-800">
            <TabsTrigger value="permanente" className="text-xs sm:text-sm font-semibold">Permanente (32)</TabsTrigger>
            <TabsTrigger value="temporal" className="text-xs sm:text-sm font-semibold">Temporal (20)</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-border bg-white dark:bg-slate-950 text-xs font-bold uppercase tracking-wider text-slate-600">
          <Activity className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">
            {activeTab === 'temporal' ? 'Odontograma Pediátrico' : 'Odontograma Permanente'}
          </span>
          <span className="sm:hidden">
            {activeTab === 'temporal' ? 'Pediátrico' : 'Permanente'}
          </span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row relative">

        {/* Panel izquierdo */}
        {activeSidePanel === 'left' && (
          <div className="w-full lg:w-60 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-slate-50/30 dark:bg-slate-900/30 max-h-[50vh] lg:max-h-none overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-2 lg:slide-in-from-right-2">
            <ActionMenuPanel
              catalogItems={catalogItems}
              interactionMode={interactionMode}
              onSelectTool={onSelectTool}
              onSelectMode={onSelectMode}
              onErase={onErase}
            />
          </div>
        )}

        <div className="flex-1 relative flex flex-col min-h-[500px] overflow-hidden">

          {/* Botón flotante izquierdo */}
          <div className="absolute top-4 left-4 z-20">
            <Button
              variant="outline"
              size="icon"
              className={`w-8 h-8 rounded-full shadow-md transition-all duration-300 cursor-pointer ${activeSidePanel === 'left' ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              onClick={toggleLeftPanel}
              title="Herramientas del Odontograma"
            >
              {activeSidePanel === 'left' ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>
          </div>

          {/* Botón flotante derecho */}
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="outline"
              size="icon"
              className={`w-8 h-8 rounded-full shadow-md transition-all duration-300 cursor-pointer ${activeSidePanel === 'right' ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              onClick={toggleRightPanel}
              title="Filtros del Odontograma"
            >
              {activeSidePanel === 'right' ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </Button>
          </div>

          <div className="w-full h-full overflow-auto custom-scrollbar">

            <div className="flex min-w-max min-h-full p-6 pt-20 lg:pt-6">

              <div className="m-auto flex flex-col justify-center items-center gap-12">
                <div className="flex gap-4 sm:gap-6 items-end">
                  {renderQuadrant(layout.upperRight, true)}
                  <div className="w-px h-32 bg-slate-300 dark:bg-slate-700 shrink-0" />
                  {renderQuadrant(layout.upperLeft, true)}
                </div>
                <div className="flex gap-4 sm:gap-6 items-start">
                  {renderQuadrant(layout.lowerRight, false)}
                  <div className="w-px h-32 bg-slate-300 dark:bg-slate-700 shrink-0" />
                  {renderQuadrant(layout.lowerLeft, false)}
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Panel derecho */}
        {activeSidePanel === 'right' && (
          <div className="w-full lg:w-60 shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-slate-50/30 dark:bg-slate-900/30 max-h-[50vh] lg:max-h-none overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-2 lg:slide-in-from-right-2">
            <ToolsPanel
              activeFilter={activeFilter}
              onFilterToggle={handleFilterToggle}
              activeTypeFilter={activeTypeFilter}
              onTypeFilterToggle={handleTypeFilterToggle}
            />
          </div>
        )}

      </div>
    </div>
  );
};
import React, { useState, useMemo } from 'react';
import { CatalogItem } from '@/types';
import { ChevronRight, ChevronLeft, Info, Search, Eraser, Activity, Syringe, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';

type MenuView = 'main' | 'lesions' | 'preexistences' | 'treatments';

interface Props {
  catalogItems: CatalogItem[];
  interactionMode: 'select' | 'info';
  onSelectTool: (tool: CatalogItem) => void;
  onSelectMode: (mode: 'select' | 'info') => void;
  onErase: () => void;
}

export const ActionMenuPanel = ({ catalogItems, interactionMode, onSelectTool, onSelectMode, onErase }: Props) => {
  const [view, setView] = useState<MenuView>('main');
  const [search, setSearch] = useState('');

  const lesions = catalogItems.filter(i => i.type === 'lesion');
  const preexistences = catalogItems.filter(i => i.type === 'preexistence');
  const treatments = catalogItems.filter(i => i.type === 'treatment');

  const groupedTreatments = useMemo(() => {
    const groups: Record<string, CatalogItem[]> = {};
    treatments.forEach(item => {
      const categoryName = item.category?.name || 'Sin categoría';
      if (!groups[categoryName]) groups[categoryName] = [];
      if (item.name.toLowerCase().includes(search.toLowerCase())) {
        groups[categoryName].push(item);
      }
    });
    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [treatments, search]);

  return (
    <div className="p-4 lg:py-0 lg:px-0 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col items-center justify-start animate-in fade-in slide-in-from-right-4 duration-300 relative w-60 max-h-125 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">

      {view === 'main' && (
        <div className="flex flex-col py-4 w-full">
          <div className="px-6 mb-2">
            <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Herramientas</h4>
          </div>

          <div className="flex items-center justify-between px-6 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group transition-colors" onClick={() => setView('preexistences')}>
            <span className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300"><ShieldAlert className="w-4 h-4 text-amber-500" /> Preexistencias</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="flex items-center justify-between px-6 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group transition-colors" onClick={() => setView('lesions')}>
            <span className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300"><Activity className="w-4 h-4 text-red-500" /> Lesiones</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="flex items-center justify-between px-6 py-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer group transition-colors" onClick={() => setView('treatments')}>
            <span className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-300"><Syringe className="w-4 h-4 text-blue-500" /> Tratamientos</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </div>

          <div className="w-full h-px bg-border my-4" />

          {/* Botón ver información */}
          <div
            className={`flex items-center gap-3 px-6 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 cursor-pointer transition-colors ${interactionMode === 'info' ? 'bg-indigo-50/50 text-indigo-600 border-r-2 border-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}
            onClick={() => onSelectMode(interactionMode === 'info' ? 'select' : 'info')}
          >
            <Info className={`w-4 h-4 ${interactionMode === 'info' ? 'text-indigo-600' : 'text-indigo-500'}`} />
            <span className="text-sm font-medium">Ver información</span>
          </div>

          {/* Botón borrador */}
          <div
            className="flex items-center gap-3 px-6 py-3 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors text-slate-700 dark:text-slate-300"
            onClick={onErase}
          >
            <Eraser className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium">Borrar selección</span>
          </div>
        </div>
      )}

      {view !== 'main' && (
        <div className="flex flex-col h-full w-full">
          <div className="relative flex justify-center items-center px-4 py-4 border-b border-border dark:bg-slate-900/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {view === 'lesions' ? 'Lesiones' : view === 'preexistences' ? 'Preexistencias' : 'Tratamientos'}
            </span>
            <div
              className="absolute right-4 p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors"
              onClick={() => { setView('main'); setSearch(''); }}
            >
              <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </div>

          </div>

          {view === 'treatments' && (
            <div className="p-4 border-b border-border bg-white dark:bg-slate-950">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="text" placeholder="Buscar tratamiento..." className="pl-9 h-9 text-sm w-full bg-slate-50 dark:bg-slate-900" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            {(view === 'lesions' ? lesions : view === 'preexistences' ? preexistences : []).map(item => (
              <div key={item.id} onClick={() => onSelectTool(item)} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                {item.image_path ? <img src={`/storage/${item.image_path}`} className="w-5 h-5 object-contain" /> : <div className={`w-3 h-3 rounded-full shrink-0 ${view === 'lesions' ? 'bg-red-500' : 'bg-amber-500'}`} />}
                <span className="text-sm truncate">{item.name}</span>
              </div>
            ))}

            {view === 'treatments' && groupedTreatments.map(([category, items]) => (
              <div key={category} className="mb-5">
                <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">{category}</h5>
                {items.map(item => (
                  <div key={item.id} onClick={() => onSelectTool(item)} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {item.image_path ? <img src={`/storage/${item.image_path}`} className="w-5 h-5 object-contain" /> : <div className="w-3 h-3 rounded-full shrink-0 bg-blue-500" />}
                    <span className="text-sm truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
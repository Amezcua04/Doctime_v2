import React from 'react';
import { Separator } from '@/components/ui/separator';
import { ActionTooltip } from '@/components/shared/action-tooltip';

const SextantImage = ({ src, alt }: { src: string, alt: string }) => (
  <img src={src} alt={alt} className="w-10 h-10 object-contain opacity-70 dark:opacity-60 cursor-pointer hover:opacity-100 transition-opacity" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
);

const ArchImage = ({ src, alt }: { src: string, alt: string }) => (
  <img src={src} alt={alt} className="w-12 h-12 object-contain opacity-70 dark:opacity-60 cursor-pointer hover:opacity-100 transition-opacity" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
);

const sextants = [
  { id: 's1', imagePath: '/images/sextants/sextante1.svg', label: 'Sextante 1' },
  { id: 's2', imagePath: '/images/sextants/sextante2.svg', label: 'Sextante 2' },
  { id: 's3', imagePath: '/images/sextants/sextante3.svg', label: 'Sextante 3' },
  { id: 's6', imagePath: '/images/sextants/sextante6.svg', label: 'Sextante 6' },
  { id: 's5', imagePath: '/images/sextants/sextante5.svg', label: 'Sextante 5' },
  { id: 's4', imagePath: '/images/sextants/sextante4.svg', label: 'Sextante 4' },
];

const arches = [
  { id: 'upper', imagePath: '/images/arches/arcada_superior.svg', label: 'Arcada Superior' },
  { id: 'lower', imagePath: '/images/arches/arcada_inferior.svg', label: 'Arcada Inferior' },
];

const colorFilters = [
  { type: 'lesion', color: '#EF4444', label: 'Lesiones', border: 'border-red-600' },
  { type: 'treatment', color: '#3B82F6', label: 'Tratamientos', border: 'border-blue-600' },
  { type: 'preexistence', color: '#F59E0B', label: 'Preexistencias', border: 'border-amber-500' },
];

interface Props {
  activeFilter: string | null;
  onFilterToggle: (filterId: string) => void;
  activeTypeFilter: string | null;
  onTypeFilterToggle: (type: any) => void;
}

export function ToolsPanel({ activeFilter, onFilterToggle, activeTypeFilter, onTypeFilterToggle }: Props) {
  return (
    <div className="p-4 lg:py-4 lg:px-0 bg-slate-50/50 dark:bg-slate-900/20 flex flex-col items-center justify-start animate-in fade-in slide-in-from-right-4 duration-300 relative max-h-125 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
      <div className="w-full space-y-2">
        <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Selección por Sextantes</h4>
        <div className="grid grid-cols-3 gap-x-4 gap-y-6 justify-items-center mt-2">
          {sextants.map((s) => (
            <div
              key={s.id}
              onClick={() => onFilterToggle(s.id)}
              className={`flex flex-col items-center gap-2 group p-2 rounded-xl cursor-pointer border-2 transition-colors ${activeFilter === s.id ? 'bg-primary/5 border-primary/50' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <SextantImage src={s.imagePath} alt={s.label} />
              <span className={`text-[10px] text-center ${activeFilter === s.id ? 'font-bold text-primary' : 'font-medium text-slate-500 group-hover:text-primary'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="w-2/3 bg-border shrink-0" />

      <div className="py-2 w-full space-y-4">
        <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Selección por Arcada</h4>
        <div className="flex justify-center gap-8">
          {arches.map((a) => (
            <div
              key={a.id}
              onClick={() => onFilterToggle(a.id)}
              className={`flex flex-col items-center gap-2 group p-2 rounded-xl cursor-pointer border-2 transition-colors ${activeFilter === a.id ? 'bg-primary/5 border-primary/50' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              <ArchImage src={a.imagePath} alt={a.label} />
              <span className={`text-[10px] text-center ${activeFilter === a.id ? 'font-bold text-primary' : 'font-medium text-slate-500 group-hover:text-primary'}`}>
                {a.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="w-2/3 bg-border shrink-0" />

      <div className="py-2 w-full space-y-2">
        <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">Ver por Condición</h4>
        <div className="flex items-center justify-center gap-3">
          {colorFilters.map((f) => {
            const isSelected = activeTypeFilter === f.type;
            return (
              <ActionTooltip key={f.type} label={f.label}>
                <div
                  key={f.type}
                  onClick={() => onTypeFilterToggle(f.type)}
                  style={{ backgroundColor: f.color }}
                  title={f.label}
                  className={`w-8 h-8 rounded-full border-[3px] cursor-pointer transition-all shadow-sm relative hover:scale-110
                  ${isSelected ? `${f.border} scale-110 ring-4 ring-slate-200 dark:ring-slate-800` : 'border-white dark:border-slate-950 opacity-60 hover:opacity-100'}`}
                />
              </ActionTooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
}
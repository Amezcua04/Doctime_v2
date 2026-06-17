import React from 'react';
import { Surface, OdontogramItemState } from '@/types';

interface InteractiveToothProps {
  number: number;
  isUpper: boolean;
  isVisible?: boolean;
  items: OdontogramItemState[];
  selectedSurfaces: (Surface | 'general')[];
  onSurfaceClick: (toothNumber: number, surface: Surface | 'general') => void;
}

export const InteractiveTooth = ({ number, isUpper, isVisible = true, items, selectedSurfaces, onSurfaceClick }: InteractiveToothProps) => {

  const getSurfaceColor = (surfaceName: Surface) => {
    if (selectedSurfaces?.includes(surfaceName)) {
      return 'fill-primary/30 stroke-primary stroke-[4]';
    }

    const surfaceItems = items.filter(i => i.surface === surfaceName);
    if (surfaceItems.length === 0) return 'fill-white dark:fill-slate-900 stroke-slate-300 dark:stroke-slate-600';

    const latestItem = surfaceItems[surfaceItems.length - 1].catalog_item;

    if (latestItem.type === 'lesion') return 'fill-red-500 stroke-red-600';
    if (latestItem.type === 'treatment') return 'fill-blue-500 stroke-blue-600';
    return 'fill-amber-500 stroke-amber-600';
  };

  const topSurface = isUpper ? 'vestibular' : 'lingual';
  const bottomSurface = isUpper ? 'lingual' : 'vestibular';
  const isGeneralSelected = selectedSurfaces?.includes('general');

  const uniqueItemsWithImages = Array.from(
    new Map(
      items
        .filter(i => i.catalog_item.image_path)
        .map(i => [i.catalog_item.id, i.catalog_item])
    ).values()
  );

  return (
    <div className={`flex flex-col items-center gap-1 min-w-9 sm:min-w-11 transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-20 grayscale pointer-events-none scale-95'}`}>

      <span className={`text-[10px] sm:text-xs font-bold transition-colors ${selectedSurfaces?.length > 0 ? 'text-primary' : 'text-slate-500'} ${isUpper ? 'order-3' : 'order-1'}`}>
        {number}
      </span>

      <div className="w-8 h-8 sm:w-10 sm:h-10 order-2">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm transition-transform hover:scale-105">
          <defs><clipPath id={`circle-clip-${number}`}><circle cx="50" cy="50" r="48" /></clipPath></defs>
          <g clipPath={`url(#circle-clip-${number})`}>
            <polygon points="0,0 100,0 50,50" className={`${getSurfaceColor(topSurface)} cursor-pointer hover:opacity-80 transition-colors`} onClick={() => onSurfaceClick(number, topSurface)} />
            <polygon points="100,0 100,100 50,50" className={`${getSurfaceColor('distal')} cursor-pointer hover:opacity-80 transition-colors`} onClick={() => onSurfaceClick(number, 'distal')} />
            <polygon points="0,100 100,100 50,50" className={`${getSurfaceColor(bottomSurface)} cursor-pointer hover:opacity-80 transition-colors`} onClick={() => onSurfaceClick(number, bottomSurface)} />
            <polygon points="0,0 0,100 50,50" className={`${getSurfaceColor('mesial')} cursor-pointer hover:opacity-80 transition-colors`} onClick={() => onSurfaceClick(number, 'mesial')} />
          </g>
          <circle cx="50" cy="50" r="18" className={`${getSurfaceColor('oclusal')} cursor-pointer hover:opacity-80 transition-colors`} onClick={() => onSurfaceClick(number, 'oclusal')} />
          <circle cx="50" cy="50" r="48" fill="none" className="stroke-slate-400 dark:stroke-slate-500 stroke-[3] pointer-events-none" />
        </svg>
      </div>

      <div
        className={`relative w-7 h-12 sm:w-8 sm:h-14 cursor-pointer transition-all ${isUpper ? 'order-1' : 'order-3'} ${isGeneralSelected ? 'ring-2 ring-primary ring-offset-2 rounded-sm opacity-100 scale-105' : 'hover:opacity-80'}`}
        onClick={() => onSurfaceClick(number, 'general')}
      >
        <img src={`/images/teeth/${number}.svg`} className="absolute inset-0 w-full h-full object-contain opacity-70" alt={`Diente ${number}`} />

        {uniqueItemsWithImages.map((catalogItem, idx) => (
          <img
            key={idx}
            src={`/storage/${catalogItem.image_path}`}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            alt={catalogItem.name}
          />
        ))}
      </div>

    </div>
  );
};
import React from 'react';
import { Upload, ImageIcon } from 'lucide-react';

interface Props {
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  height?: string;
  width?: string;
  isSmall?: boolean;
}

export default function ImageUploader({ preview, onChange, height = "h-32", width = "w-full", isSmall = false }: Props) {
  return (
    <div className={`relative group ${height} ${width} rounded-lg border border-dashed border-slate-300 bg-slate-50/50 hover:bg-white hover:border-indigo-400 transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer`}>
      {preview ? (
        <img src={preview} className="w-full h-full object-contain p-2" />
      ) : (
        <ImageIcon className={`${isSmall ? "w-5 h-5" : "w-8 h-8"} text-slate-300 group-hover:text-indigo-400 transition-colors`} />
      )}

      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
        <Upload className="w-4 h-4 text-white mb-1" />
        <span className="text-[9px] font-bold text-white uppercase tracking-wider">Subir</span>
      </div>

      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onChange} />
    </div>
  );
}
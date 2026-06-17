import React from 'react';
import { Monitor, Smartphone, Menu } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

interface Props {
  device: 'desktop' | 'mobile';
  setDevice: (d: 'desktop' | 'mobile') => void;
  data: any;
  logo: string | null;
  banner: any | null;
}

export default function PreviewDevice({ device, setDevice, data, logo, banner }: Props) {

  const isMobile = device === 'mobile';
  const bannerSrc = banner
    ? (isMobile && banner.image_mobile_path ? `/storage/${banner.image_mobile_path}` : `/storage/${banner.image_path}`)
    : null;

  return (
    <div className="h-full flex flex-col min-h-0 space-y-4">
      <div className="flex justify-center shrink-0">
        <Tabs
          value={device}
          onValueChange={(val) => setDevice(val as 'desktop' | 'mobile')}
          className="w-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="desktop" className="px-4">
              <Monitor className="w-3.5 h-3.5 mr-2" /> Desktop
            </TabsTrigger>
            <TabsTrigger value="mobile" className="px-4">
              <Smartphone className="w-3.5 h-3.5 mr-2" /> Mobile
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-muted/30 border border-border rounded-xl shadow-inner flex-1 overflow-hidden flex items-center justify-center p-4 md:p-8 relative">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {device === 'desktop' ? (
          <div className="w-full h-full max-w-[900px] bg-background rounded-lg shadow-2xl border border-border flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="h-8 bg-muted/50 border-b border-border flex items-center px-3 gap-2 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="h-5 w-1/2 max-w-[200px] bg-muted rounded-sm text-[10px] flex items-center justify-center text-muted-foreground/50">
                  sunrise-dentalmx.com
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-background flex flex-col">
              <PreviewContent {...{ logo, bannerSrc, data, isMobile: false }} />
            </div>
          </div>
        ) : (
          <div className="w-[280px] h-[525px] bg-slate-950 rounded-[3rem] shadow-2xl border-[8px] border-slate-950 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 relative ring-1 ring-white/10">
            <div className="h-7 bg-slate-950 w-full shrink-0 flex items-center justify-center relative z-20">
              <div className="w-20 h-5 bg-black rounded-b-xl absolute top-0"></div>
            </div>
            <div className="flex-1 bg-background overflow-y-auto flex flex-col rounded-b-[2.5rem]">
              <PreviewContent {...{ logo, bannerSrc, data, isMobile: true }} />
            </div>
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full z-20 pointer-events-none"></div>
          </div>
        )}
      </div>
    </div>
  );
}


function PreviewContent({ logo, bannerSrc, data, isMobile }: any) {
  return (
    <div className="flex flex-col min-h-full">
      <div className={`border-b border-slate-100 flex items-center justify-between px-4 bg-white/95 backdrop-blur sticky top-0 z-10 ${isMobile ? 'h-12' : 'h-14'}`}>
        <div className="flex items-center gap-2 grayscale opacity-70">
          {logo ? <img src={logo} className={`${isMobile ? 'h-4' : 'h-5'} w-auto`} /> : <div className="h-5 w-5 bg-slate-200 rounded" />}
          <span className="font-bold text-xs text-slate-800">{data.name || 'Clínica'}</span>
        </div>
        {!isMobile && <div className="flex gap-2"><div className="h-1.5 w-6 bg-slate-100 rounded"></div><div className="h-1.5 w-6 bg-slate-100 rounded"></div></div>}
      </div>

      {bannerSrc && (
        <div className={`w-full relative overflow-hidden group shrink-0 ${isMobile ? 'h-[250px]' : 'h-[200px]'}`}>
          <img src={bannerSrc} className="w-full h-full object-cover" />
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            <div className="w-1 h-1 bg-white rounded-full shadow"></div><div className="w-1 h-1 bg-white/50 rounded-full shadow"></div>
          </div>
        </div>
      )}

      <div className={`flex flex-col items-center justify-center text-center px-6 relative bg-white ${isMobile ? 'py-8' : 'py-12'}`}>
        <div className="max-w-md w-full">
          {data.slogan && <span className="mb-4 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[9px] font-medium text-indigo-600">{data.slogan}</span>}
          <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-extrabold tracking-tight text-slate-900 mb-3 leading-tight`}>{data.hero_title || "Tu Título Aquí"}</h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">{data.hero_description || "Descripción..."}</p>
          <div className="flex justify-center gap-2 opacity-60 grayscale pointer-events-none">
            <div className="h-8 px-4 rounded-full bg-slate-900 text-white flex items-center text-[10px] font-bold">CTA</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 flex-1 p-6 space-y-3">
        <div className="h-2 w-1/3 bg-slate-200 rounded mx-auto mb-4"></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-16 bg-white rounded border border-slate-100"></div>
          <div className="h-16 bg-white rounded border border-slate-100"></div>
          <div className="h-16 bg-white rounded border border-slate-100"></div>
        </div>
      </div>
    </div>
  );
}
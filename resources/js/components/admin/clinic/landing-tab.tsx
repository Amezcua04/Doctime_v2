import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { LayoutTemplate, Plus, Monitor, Smartphone, Trash2, X, UploadCloud, ImageIcon } from 'lucide-react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import PreviewDevice from './utils/preview-device';
import { DeleteBannerDialog } from './utils/delete-banner-dialog';

interface Props {
  data: any;
  setData: (field: string, value: any) => void;
  banners: any[];
  logoPreview: string | null;
}

interface PendingBanner {
  id: string;
  desktop: File;
  mobile: File | null;
  previewDesktop: string;
  previewMobile: string | null;
}

export default function LandingTab({ data, setData, banners, logoPreview }: Props) {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [pendingBanners, setPendingBanners] = useState<PendingBanner[]>([]);
  const [isUploadingBatch, setIsUploadingBatch] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState<number | null>(null);

  const handleDesktopBatch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        desktop: file,
        mobile: null,
        previewDesktop: URL.createObjectURL(file),
        previewMobile: null
      }));
      setPendingBanners(prev => [...prev, ...newFiles]);
      e.target.value = '';
    }
  };

  const handleMobileBatch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const mobileFiles = Array.from(e.target.files);
      setPendingBanners(prev => {
        const newBanners = [...prev];
        let fileIndex = 0;
        for (let i = 0; i < newBanners.length; i++) {
          if (!newBanners[i].mobile && fileIndex < mobileFiles.length) {
            newBanners[i].mobile = mobileFiles[fileIndex];
            newBanners[i].previewMobile = URL.createObjectURL(mobileFiles[fileIndex]);
            fileIndex++;
          }
        }
        if (fileIndex < mobileFiles.length) toast.info(`Se usaron los primeros ${fileIndex + 1} archivos móviles.`);
        return newBanners;
      });
      e.target.value = '';
    }
  };

  const removePending = (id: string) => setPendingBanners(prev => prev.filter(item => item.id !== id));

  const submitBatch = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pendingBanners.length === 0) return;

    const formData = new FormData();
    pendingBanners.forEach((item, index) => {
      formData.append(`banners[${index}][desktop]`, item.desktop);
      if (item.mobile) formData.append(`banners[${index}][mobile]`, item.mobile);
    });

    setIsUploadingBatch(true);
    router.post('/admin/clinic/banners/batch', formData, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Banners subidos.');
        setPendingBanners([]);
        setIsUploadingBatch(false);
      },
      onError: () => {
        toast.error('Error al subir.');
        setIsUploadingBatch(false);
      }
    });
  };

  const handleDeleteClick = (id: number) => {
    setBannerToDelete(id);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <Card className="col-span-12 lg:col-span-5 h-full shadow-none border-border flex flex-col min-h-0 bg-card">
        <CardHeader className="pb-3 pt-4 px-5 shrink-0 border-b border-border bg-muted/20">
          <CardTitle className="text-sm font-semibold uppercase text-muted-foreground tracking-wider flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4" /> Editor de contenido
          </CardTitle>
        </CardHeader>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título principal</Label>
              <Textarea
                value={data.hero_title}
                onChange={e => setData('hero_title', e.target.value)}
                className="min-h-[60px] font-bold resize-none bg-background"
                placeholder="Ej. Tu sonrisa es nuestra prioridad"
              />
            </div>
            <div className="space-y-2">
              <Label>Descripción / subtítulo</Label>
              <Textarea
                value={data.hero_description}
                onChange={e => setData('hero_description', e.target.value)}
                className="min-h-[80px] text-sm resize-none bg-background"
                placeholder="Breve descripción para la portada..."
              />
            </div>
          </div>

          <Separator className="bg-border" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase text-muted-foreground">Banners (Carrusel)</Label>
              {pendingBanners.length > 0 && (
                <span className="text-xs text-primary font-medium">{pendingBanners.length} pendientes</span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Input type="file" id="bulk-desk" className="hidden" accept="image/*" multiple onChange={handleDesktopBatch} />
                <Button type="button" variant="outline" asChild className="w-full h-12 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary cursor-pointer">
                  <label htmlFor="bulk-desk" className="flex flex-col items-center justify-center gap-0.5 cursor-pointer">
                    <div className="flex items-center gap-1.5"><Plus className="h-3 w-3" /><Monitor className="h-3 w-3" /></div>
                    <span className="text-[10px] font-medium">Escritorio</span>
                  </label>
                </Button>
              </div>
              <div className="relative">
                <Input type="file" id="bulk-mob" className="hidden" accept="image/*" multiple onChange={handleMobileBatch} disabled={pendingBanners.length === 0} />
                <Button
                  type="button"
                  variant="outline"
                  asChild
                  className={`w-full h-12 border-dashed cursor-pointer ${pendingBanners.length === 0 ? 'opacity-50 cursor-not-allowed bg-muted' : 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}
                >
                  <label htmlFor={pendingBanners.length > 0 ? "bulk-mob" : ""} className="flex flex-col items-center justify-center gap-0.5 cursor-pointer">
                    <div className="flex items-center gap-1.5"><Plus className="h-3 w-3" /><Smartphone className="h-3 w-3" /></div>
                    <span className="text-[10px] font-medium">Móvil (opcional)</span>
                  </label>
                </Button>
              </div>
            </div>

            {pendingBanners.length > 0 && (
              <div className="bg-muted/30 border border-border rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                  <div className="flex items-center gap-2">
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Cola de subida</span>
                  </div>
                  <Button type="button" size="sm" onClick={submitBatch} disabled={isUploadingBatch} className="h-7 text-[10px] px-3 cursor-pointer">
                    {isUploadingBatch ? 'Subiendo...' : 'Subir todos'}
                  </Button>
                </div>
                <div className="grid gap-2">
                  {pendingBanners.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 bg-background p-2 rounded border border-border shadow-sm group">
                      <div className="w-12 h-8 bg-muted rounded overflow-hidden shrink-0 relative">
                        <img src={item.previewDesktop} className="w-full h-full object-cover" />
                      </div>
                      <div className={`w-6 h-8 rounded border flex items-center justify-center overflow-hidden shrink-0 ${item.previewMobile ? 'border-emerald-500/50' : 'bg-muted/50 border-dashed border-border'}`}>
                        {item.previewMobile ? <img src={item.previewMobile} className="w-full h-full object-cover" /> : <Smartphone className="w-3 h-3 text-muted-foreground/50" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-foreground font-medium truncate">{item.desktop.name}</p>
                        <p className="text-[9px] text-muted-foreground truncate">{(item.desktop.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <button type="button" onClick={() => removePending(item.id)} className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-border" />

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Banners activos</Label>
              <div className="grid grid-cols-2 gap-3 pb-6">
                {banners.map((banner) => (
                  <div key={banner.id} className="group relative aspect-video bg-muted rounded-md overflow-hidden border border-border shadow-sm">
                    <img src={`/storage/${banner.image_path}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />

                    {banner.image_mobile_path && (
                      <div className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[8px] px-1.5 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-0.5 shadow-sm">
                        <Smartphone className="w-2 h-2" /> <span className="hidden sm:inline">Móvil</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                      <Button type="button" variant="destructive" size="icon" className="h-7 w-7 shadow-sm cursor-pointer" onClick={() => handleDeleteClick(banner.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                {banners.length === 0 && pendingBanners.length === 0 && (
                  <div className="col-span-2 border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
                    <ImageIcon className="h-8 w-8 opacity-20" />
                    <span className="text-xs">No hay banners cargados.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="col-span-12 lg:col-span-7 h-full flex flex-col min-h-0 bg-transparent">
        <PreviewDevice
          device={previewDevice}
          setDevice={setPreviewDevice}
          data={data}
          logo={logoPreview}
          banner={banners.length > 0 ? banners[0] : null}
        />
      </div>

      <DeleteBannerDialog
        open={!!bannerToDelete}
        onOpenChange={(open) => !open && setBannerToDelete(null)}
        bannerId={bannerToDelete}
      />
    </div>
  );
}
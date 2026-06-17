import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import ImageUploader from './utils/image-uploader';


interface Props {
  data: any;
  setData: (field: string, value: any) => void;
  logoPreview: string | null;
  favPreview: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon', setPreviewFn: any) => void;
  setLogoPreview: React.Dispatch<React.SetStateAction<string | null>>;
  setFavPreview: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function GeneralTab({ data, setData, logoPreview, favPreview, onFileChange, setLogoPreview, setFavPreview }: Props) {
  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      <Card className="col-span-12 md:col-span-4 h-fit shadow-sm border-slate-200">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider">Identidad visual</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 px-5 pb-5">
          <div className="space-y-2">
            <Label className="text-xs font-medium">Logotipo principal</Label>
            <ImageUploader
              preview={logoPreview}
              onChange={(e) => onFileChange(e, 'logo', setLogoPreview)}
              height="h-32"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-medium">Favicon</Label>
            <div className="flex items-center gap-3">
              <ImageUploader
                preview={favPreview}
                onChange={(e) => onFileChange(e, 'favicon', setFavPreview)}
                height="h-14" width="w-14" isSmall
              />
              <p className="text-[10px] text-slate-400 leading-tight">32x32px .ico/.png</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-12 md:col-span-8 h-fit shadow-sm border-slate-200">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-bold uppercase text-slate-500 tracking-wider">Datos públicos</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input value={data.name} onChange={e => setData('name', e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label>Eslogan</Label>
              <Input value={data.slogan} onChange={e => setData('slogan', e.target.value)} className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Teléfono</Label>
              <Input value={data.phone} onChange={e => setData('phone', e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label>Dirección</Label>
              <Input value={data.address} onChange={e => setData('address', e.target.value)} className="h-9" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
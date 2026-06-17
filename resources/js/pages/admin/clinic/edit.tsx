import GeneralTab from '@/components/admin/clinic/general-tab';
import LandingTab from '@/components/admin/clinic/landing-tab';
import NotificationsTab from '@/components/admin/clinic/notifications-tab';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClinicSettings } from '@/types'
import { Head, router, useForm } from '@inertiajs/react';
import { BellRing, Building, Globe, Loader2, Save } from 'lucide-react';
import React, { useState } from 'react'
import { toast } from 'sonner';

interface Props {
  clinic: ClinicSettings;
  banners: any[];
}
export default function CLinic({ clinic, banners }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: clinic.name || '',
    slogan: clinic.slogan || '',
    phone: clinic.phone || '',
    address: clinic.address || '',
    hero_title: clinic.hero_title || '',
    hero_description: clinic.hero_description || '',
    logo: null as File | null,
    favicon: null as File | null,
    enable_email_reminders: Boolean(clinic.enable_email_reminders),
    enable_whatsapp_reminders: Boolean(clinic.enable_whatsapp_reminders),
    whatsapp_phone_id: clinic.whatsapp_phone_id || '',
    whatsapp_api_token: clinic.whatsapp_api_token || '',
    reminder_hours_before: clinic.reminder_hours_before || 48,
    _method: 'POST',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(clinic.logo_path ? `/storage/${clinic.logo_path}` : null);
  const [favPreview, setFavPreview] = useState<string | null>(clinic.favicon_path ? `/storage/${clinic.favicon_path}` : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post('/admin/clinic', {
      preserveScroll: true,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon', setPreviewFn: React.Dispatch<React.SetStateAction<string | null>>) => {
    const file = e.target.files?.[0];
    if (file) {
      setData(field, file);
      setPreviewFn(URL.createObjectURL(file));
    }
  };
  return (
    <>
      <Head title='Clínica' />
      <div className="flex h-[calc(100vh-6rem)] flex-col gap-6 p-4 md:p-6 lg:p-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Configuración de la clínica</h1>
            <p className="text-sm text-muted-foreground">Personaliza la apariencia, datos de contacto y landing page.</p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={processing}
            className="w-full sm:w-auto shadow-sm min-w-[140px] cursor-pointer"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
          <Tabs defaultValue="general" className="h-full flex flex-col gap-4">
            <div className="shrink-0 w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3 sm:inline-flex sm:w-auto h-12 sm:h-10">
                <TabsTrigger value="general" className="gap-2 cursor-pointer h-full">
                  <Building className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden sm:inline">General</span>
                </TabsTrigger>
                <TabsTrigger value="landing" className="gap-2 cursor-pointer h-full">
                  <Globe className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden sm:inline">Landing page</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-2 cursor-pointer h-full">
                  <BellRing className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden sm:inline">Recordatorios</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="general"
              className="mt-0 border rounded-lg p-6 bg-card shadow-sm h-auto md:flex-1 md:overflow-y-auto"
            >
              <GeneralTab
                data={data}
                setData={setData}
                logoPreview={logoPreview}
                favPreview={favPreview}
                setLogoPreview={setLogoPreview}
                setFavPreview={setFavPreview}
                onFileChange={handleFileChange}
              />
            </TabsContent>

            <TabsContent
              value="landing"
              className="mt-0 border rounded-lg p-0 bg-card shadow-sm h-auto md:flex-1 md:overflow-y-auto"
            >
              <LandingTab
                data={data}
                setData={setData}
                banners={banners}
                logoPreview={logoPreview}
              />
            </TabsContent>

            <TabsContent
              value="notifications"
              className="mt-0 border rounded-lg p-6 bg-card shadow-sm h-auto md:flex-1 md:overflow-y-auto"
            >
              <NotificationsTab
                data={data}
                setData={setData}
                errors={errors}
              />
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </>
  )
}

CLinic.layout = {
  breadcrumbs: [
    {
      title: 'Clínica',
      href: '/admin/settings',
    },
  ],
};


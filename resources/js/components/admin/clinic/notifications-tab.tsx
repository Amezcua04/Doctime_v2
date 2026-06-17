import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, MessageCircle, Clock, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    data: any;
    setData: (key: string, value: any) => void;
    errors: any;
}

export default function NotificationsTab({ data, setData, errors }: Props) {
    return (
        <div className="space-y-8 max-w-4xl">

            <div className="space-y-1">
                <h2 className="text-lg font-medium">Recordatorios automáticos</h2>
                <p className="text-sm text-muted-foreground">
                    Configura cómo y cuándo se enviarán las notificaciones a tus pacientes para recordarles su próxima cita.
                </p>
            </div>

            <div className="space-y-4 border-b pb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-slate-500" />
                    <h3 className="text-base font-semibold">Momento del envío</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>¿Con cuánta anticipación enviar el recordatorio?</Label>
                        <Select
                            value={data.reminder_hours_before.toString()}
                            onValueChange={(val) => setData('reminder_hours_before', parseInt(val))}
                        >
                            <SelectTrigger className="w-full bg-background cursor-pointer">
                                <SelectValue placeholder="Selecciona un periodo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem className="cursor-pointer" value="12">12 horas antes</SelectItem>
                                <SelectItem className="cursor-pointer" value="24">24 horas antes (recomendado)</SelectItem>
                                <SelectItem className="cursor-pointer" value="48">48 horas antes</SelectItem>
                                <SelectItem className="cursor-pointer" value="72">72 horas antes (3 días)</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.reminder_hours_before && <span className="text-xs text-destructive">{errors.reminder_hours_before}</span>}
                    </div>
                </div>
            </div>

            <div className="space-y-4 border-b pb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/50 dark:bg-slate-900/20 dark:border-slate-800">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0 dark:bg-blue-900/30 dark:text-blue-400">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-base font-semibold cursor-pointer" onClick={() => setData('enable_email_reminders', !data.enable_email_reminders)}>
                                Recordatorios por correo electrónico
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Envía un correo formal al paciente con los detalles de su cita. Utiliza la configuración SMTP del sistema.
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0 pl-2">
                        <Switch
                            checked={data.enable_email_reminders}
                            onCheckedChange={(val) => setData('enable_email_reminders', val)}
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-colors",
                    data.enable_whatsapp_reminders
                        ? "border-emerald-200 bg-emerald-50/30 dark:bg-emerald-900/10 dark:border-emerald-800/50"
                        : "border-slate-200 bg-slate-50/50 dark:bg-slate-900/20 dark:border-slate-800"
                )}>
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-base font-semibold cursor-pointer" onClick={() => setData('enable_whatsapp_reminders', !data.enable_whatsapp_reminders)}>
                                Recordatorios por WhatsApp
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Envía un mensaje directo al WhatsApp del paciente. Requiere conexión con la API de Meta.
                            </p>
                        </div>
                    </div>
                    <div className="shrink-0 pl-2">
                        <Switch
                            checked={data.enable_whatsapp_reminders}
                            onCheckedChange={(val) => setData('enable_whatsapp_reminders', val)}
                        />
                    </div>
                </div>

                <div className={cn(
                    "grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden transition-all duration-500 ease-in-out",
                    data.enable_whatsapp_reminders ? "max-h-[500px] opacity-100 pt-4" : "max-h-0 opacity-0 pointer-events-none"
                )}>
                    <div className="space-y-2 md:col-span-2">
                        <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-400">
                            <Info className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                                Para utilizar este servicio,{' '}
                                <a
                                    href="https://wa.me/523114000218?text=Hola,%20necesito%20ayuda%20para%20configurar%20las%20notificaciones%20de%20WhatsApp%20en%20mi%20sistema."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2 transition-colors"
                                >
                                    comunícate con soporte vía WhatsApp
                                </a>.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="whatsapp_phone_id">ID del Número de Teléfono (Phone ID)</Label>
                        <Input
                            id="whatsapp_phone_id"
                            placeholder="Ej. 10837492837482"
                            value={data.whatsapp_phone_id}
                            onChange={(e) => setData('whatsapp_phone_id', e.target.value)}
                            className="bg-background"
                        />
                        {errors.whatsapp_phone_id && <span className="text-xs text-destructive">{errors.whatsapp_phone_id}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="whatsapp_api_token">Token de Acceso de Meta (API Token)</Label>
                        <Input
                            id="whatsapp_api_token"
                            type="password"
                            placeholder="EAAJ..."
                            value={data.whatsapp_api_token}
                            onChange={(e) => setData('whatsapp_api_token', e.target.value)}
                            className="bg-background"
                        />
                        {errors.whatsapp_api_token && <span className="text-xs text-destructive">{errors.whatsapp_api_token}</span>}
                        <p className="text-[10px] text-muted-foreground mt-1">
                            Asegúrate de que este token no tenga fecha de expiración.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}
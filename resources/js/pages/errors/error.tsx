import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, FileQuestion, ServerCrash, Clock, AlertCircle, Lock } from 'lucide-react';

interface Props {
  status: number;
}

export default function ErrorPage({ status }: Props) {
  const errors: Record<number, { title: string; description: string; icon: React.ReactNode }> = {
    401: {
      title: 'No autorizado',
      description: 'Tu sesión ha expirado o no has iniciado sesión. Por favor, vuelve a ingresar.',
      icon: <Lock className="h-16 w-16 text-yellow-500" />
    },
    403: {
      title: 'Acceso Denegado',
      description: 'No tienes los permisos necesarios para ver esta sección o expediente.',
      icon: <ShieldAlert className="h-16 w-16 text-red-500" />
    },
    404: {
      title: 'Página no encontrada',
      description: 'El enlace que seguiste está roto o el registro que buscas ya no existe en el sistema.',
      icon: <FileQuestion className="h-16 w-16 text-blue-500" />
    },
    419: {
      title: 'Sesión expirada',
      description: 'La página caducó por inactividad. Por favor, recarga e inténtalo de nuevo.',
      icon: <Clock className="h-16 w-16 text-orange-500" />
    },
    500: {
      title: 'Error del servidor',
      description: 'Ocurrió un problema interno en el servidor. Comunicate con soporte técnico.',
      icon: <ServerCrash className="h-16 w-16 text-red-600" />
    },
    503: {
      title: 'Servicio no disponible',
      description: 'El sistema se encuentra en mantenimiento en este momento. Vuelve a intentarlo en unos minutos.',
      icon: <AlertCircle className="h-16 w-16 text-slate-500" />
    },
  };

  const currentError = errors[status] || {
    title: 'Ocurrió un error',
    description: 'Hemos detectado un problema inesperado. Por favor, intenta de nuevo.',
    icon: <AlertCircle className="h-16 w-16 text-slate-500" />
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Head title={currentError.title} />

      <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex justify-center animate-in zoom-in duration-500">
          {currentError.icon}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {currentError.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {currentError.description}
          </p>
        </div>

        <div className="pt-6">
          <Button asChild className="w-full cursor-pointer">
            <Link href="/dashboard">
              Volver al inicio
            </Link>
          </Button>
        </div>

        <div className="text-xs text-muted-foreground pt-4">
          Código de error: {status}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { usePage, Head } from '@inertiajs/react';
import MainLayout from '@/layouts/public/main-layout';
import PageHead from '@/components/public/page-head';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function Contact() {
  const { clinic } = usePage<any>().props;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const whatsappNumber = clinic?.phone?.replace(/\D/g, '') || '5213114000218';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  return (
    <MainLayout>
      <PageHead title="Contacto" />

      <div className="relative bg-slate-900 pt-24 pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <span className="text-blue-400 font-semibold tracking-wider uppercase text-sm mb-4 block">Atención al paciente</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl mb-6">
            Estamos para escucharte
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-2xl mx-auto">
            ¿Tienes dudas sobre un tratamiento o necesitas agendar una cita? Contáctanos y nuestro equipo te responderá a la brevedad.
          </p>
        </div>
      </div>

      <section className="relative bg-slate-50 px-6 pb-24">
        <div className="mx-auto max-w-7xl -mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* INFORMACIÓN DE CONTACTO */}
            <div className="lg:col-span-5 space-y-6 pt-16 lg:pt-24">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">Información de contacto</h2>
                <p className="text-slate-600 font-light leading-relaxed">
                  Puedes visitarnos directamente en nuestras instalaciones o comunicarte por nuestros canales oficiales para una atención más rápida.
                </p>
              </div>

              {/* Tarjeta Ubicación */}
              <div className="group flex items-start gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300">
                <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">{clinic?.name || 'Doctime'}</h3>
                  <p className="text-slate-600 leading-relaxed font-light">
                    {clinic?.address || 'Dirección física.'}
                  </p>
                </div>
              </div>

              {/* Tarjeta Teléfono & WhatsApp */}
              <div className="group flex items-start gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-300">
                <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                  <Phone className="h-6 w-6" />
                </div>
                <div className="w-full">
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Llámanos</h3>
                  <p className="text-slate-600 mb-3 text-lg font-medium">
                    {clinic?.phone || '+52 311 400 0218'}
                  </p>
                  <a
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors w-full justify-center sm:w-auto"
                  >
                    <MessageCircle className="w-4 h-4" /> Escríbenos por WhatsApp
                  </a>
                </div>
              </div>

              {/* Tarjeta Email */}
              <div className="group flex items-start gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300">
                <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-1">Correo electrónico</h3>
                  <a href={`mailto:${clinic?.email || 'amezcua041196@gmail.com'}`} className="text-slate-600 hover:text-blue-600 font-light transition-colors">
                    {clinic?.email || 'amezcua041196@gmail.com'}
                  </a>
                </div>
              </div>

              {/* Tarjeta Horarios */}
              <div className="group flex items-start gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300">
                <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div className="w-full">
                  <h3 className="font-bold text-slate-900 text-lg mb-3">Horario de atención</h3>
                  <ul className="space-y-3 text-sm text-slate-600">
                    <li className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="font-light">Lunes a Viernes</span>
                      <span className="font-medium text-slate-900 bg-slate-50 px-2 py-1 rounded">09:00 - 21:00</span>
                    </li>
                    <li className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="font-light">Sábados</span>
                      <span className="font-medium text-slate-900 bg-slate-50 px-2 py-1 rounded">09:00 - 16:00</span>
                    </li>
                    <li className="flex justify-between items-center pt-1">
                      <span className="font-light">Domingos</span>
                      <span className="font-medium text-red-500 bg-red-50 px-2 py-1 rounded">Cerrado</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: FORMULARIO (Flotante) */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative z-20">

                {submitSuccess ? (
                  <div className="flex flex-col items-center justify-center text-center py-16 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">¡Mensaje enviado!</h3>
                    <p className="text-slate-500 font-light max-w-xs">
                      Hemos recibido tus datos correctamente. Nuestro equipo se pondrá en contacto contigo muy pronto.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-bold text-slate-900 mb-3">Envíanos un mensaje</h2>
                    <p className="text-slate-500 font-light mb-8">Completa el formulario y nuestro equipo de recepción te contactará lo antes posible.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2.5">
                          <Label htmlFor="firstName" className="text-slate-700">Nombre <span className="text-red-500">*</span></Label>
                          <Input id="firstName" placeholder="Ej. Juan" required className="bg-slate-50 border-slate-200 h-12 rounded-xl focus-visible:ring-blue-600 focus-visible:ring-offset-2" />
                        </div>
                        <div className="space-y-2.5">
                          <Label htmlFor="lastName" className="text-slate-700">Apellido <span className="text-red-500">*</span></Label>
                          <Input id="lastName" placeholder="Ej. Pérez" required className="bg-slate-50 border-slate-200 h-12 rounded-xl focus-visible:ring-blue-600 focus-visible:ring-offset-2" />
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="email" className="text-slate-700">Correo Electrónico <span className="text-red-500">*</span></Label>
                        <Input id="email" type="email" placeholder="tucorreo@ejemplo.com" required className="bg-slate-50 border-slate-200 h-12 rounded-xl focus-visible:ring-blue-600 focus-visible:ring-offset-2" />
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="phone" className="text-slate-700">Teléfono (Opcional)</Label>
                        <Input id="phone" type="tel" placeholder="10 dígitos" className="bg-slate-50 border-slate-200 h-12 rounded-xl focus-visible:ring-blue-600 focus-visible:ring-offset-2" />
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="message" className="text-slate-700">¿En qué podemos ayudarte? <span className="text-red-500">*</span></Label>
                        <Textarea id="message" placeholder="Escribe los detalles de tu consulta aquí..." className="min-h-[140px] bg-slate-50 border-slate-200 rounded-xl p-4 focus-visible:ring-blue-600 focus-visible:ring-offset-2 resize-none" required />
                      </div>

                      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl text-[15px] font-bold shadow-lg shadow-blue-600/20 transition-all" disabled={isSubmitting}>
                        {isSubmitting ? 'Enviando mensaje...' : (
                          <>Enviar Mensaje <Send className="ml-2 h-4 w-4" /></>
                        )}
                      </Button>
                      <p className="text-center text-xs text-slate-400 mt-6 font-light">
                        Tus datos están protegidos por nuestra política de privacidad y no serán compartidos con terceros.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECCIÓN DEL MAPA */}
      <section className="bg-slate-200 h-[450px] md:h-[600px] w-full relative">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d118789.13441818327!2d-104.94571878375133!3d21.501434343419756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842735d8893dcfdb%3A0x83784645f40c2d79!2sTepic%2C%20Nay.!5e0!3m2!1ses-419!2smx!4v1781843609211!5m2!1ses-419!2smx"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación de la Clínica"
          className="absolute inset-0 grayscale contrast-125 opacity-80 hover:grayscale-0 hover:opacity-100 hover:contrast-100 transition-all duration-700"
        ></iframe>

        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none z-10"></div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 pointer-events-none z-10">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-800">Encuéntranos aquí</span>
        </div>
      </section>

    </MainLayout>
  );
}

Contact.layout = (page: React.ReactNode) => page;
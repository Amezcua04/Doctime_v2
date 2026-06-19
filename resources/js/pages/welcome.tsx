import { useState, useEffect, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    FileText,
    BellRing,
    ChevronLeft,
    ChevronRight,
    Star,
    ShieldCheck,
    Clock,
    MapPin,
    ArrowRight,
    Stethoscope,
    PhoneCall,
    Users
} from 'lucide-react';
import { Service } from '@/types';
import MainLayout from '@/layouts/public/main-layout';
import PageHead from '@/components/public/page-head';

interface Props {
    banners?: {
        id: number;
        image_path: string;
        image_mobile_path?: string;
    }[];
    services?: Service[];
}

export default function Welcome({ banners = [], services = [] }: Props) {
    const { clinic } = usePage<any>().props;
    const [currentSlide, setCurrentSlide] = useState(0);
    const featuredServices = services.slice(0, 4);
    const whatsappNumber = clinic?.phone?.replace(/\D/g, '') || '5214000218';

    useEffect(() => {
        if (banners.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % banners.length);
        }, 6000);
        return () => clearInterval(interval);
    }, [banners.length]);

    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);

    return (
        <MainLayout>
            <PageHead title={"Bienvenido"} />

            <section className="relative w-full h-[85vh] min-h-150 bg-slate-900 flex items-center justify-center overflow-hidden group">
                {banners.length > 0 ? (
                    banners.map((banner, index) => (
                        <div
                            key={banner.id}
                            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-0' : 'opacity-0 z-0'}`}
                        >
                            <picture>
                                {banner.image_mobile_path && (
                                    <source media="(max-width: 768px)" srcSet={`/storage/${banner.image_mobile_path}`} />
                                )}
                                <img
                                    src={`/storage/${banner.image_path}`}
                                    alt="Sunrise logo"
                                    className="w-full h-full object-cover object-center scale-105 animate-slow-zoom"
                                />
                            </picture>
                        </div>
                    ))
                ) : (
                    <div className="absolute inset-0 bg-blue-900/20 z-0"></div>
                )}

                <div className="absolute inset-0 bg-slate-900/60 z-0"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-0"></div>

                <div className="relative z-10 mx-auto max-w-5xl px-6 text-center mt-[-10vh]">
                    {clinic?.slogan && (
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-5 py-2 text-sm font-medium text-white shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="uppercase tracking-widest text-xs">{clinic.slogan}</span>
                        </div>
                    )}

                    <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white md:text-7xl lg:leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
                        {clinic?.hero_title || "Sonrisas que transforman vidas"}
                    </h1>

                    <p className="mb-10 text-lg md:text-xl text-slate-200 leading-relaxed max-w-2xl mx-auto font-light animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        {clinic?.hero_description || "Experimenta una atención odontológica de vanguardia en un ambiente diseñado para tu tranquilidad y bienestar."}
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                        <a
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, me gustaría agendar una cita.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto rounded-full bg-green-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-green-600/30 hover:bg-green-500 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            Reservar por WhatsApp <ArrowRight className="w-4 h-4" />
                        </a>
                        <a
                            href="#services"
                            className="w-full sm:w-auto rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-8 py-4 text-sm font-semibold text-white hover:bg-white/20 transition-all duration-300"
                        >
                            Nuestros servicios
                        </a>
                    </div>
                </div>

                {banners.length > 1 && (
                    <>
                        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 text-white backdrop-blur-md border border-white/10 hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 duration-300 cursor-pointer">
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/20 text-white backdrop-blur-md border border-white/10 hover:bg-white/40 transition-all opacity-0 group-hover:opacity-100 duration-300 cursor-pointer">
                            <ChevronRight className="h-6 w-6" />
                        </button>
                        <div className="absolute bottom-32 left-0 right-0 z-20 flex justify-center gap-2">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentSlide(index)}
                                    className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${index === currentSlide ? 'bg-blue-500 w-8' : 'bg-white/40 w-2 hover:bg-white/70'}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>

            <section className="relative z-20 -mt-16 px-6">
                <div className="mx-auto max-w-6xl bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center divide-x-0 md:divide-x divide-y md:divide-y-0 divide-slate-100">
                        <StatItem number="+15" label="Años de Experiencia" />
                        <StatItem number="+5k" label="Pacientes Felices" />
                        <StatItem number="100%" label="Tecnología Digital" />
                        <StatItem number="24/7" label="Atención Urgencias" />
                    </div>
                </div>
            </section>

            {services.length > 0 && (
                <section id="services" className="bg-slate-50 py-24 px-6 mt-12">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                                    Servicios destacados
                                </h2>
                                <p className="text-lg text-slate-500 font-light">
                                    Procedimientos clínicos realizados con la más alta precisión y tecnología de vanguardia.
                                </p>
                            </div>
                            <Link
                                href="/services"
                                className="hidden md:flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors group"
                            >
                                Ver catálogo completo
                                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {featuredServices.map((service) => (
                                <Link
                                    href={`/services/${service.id}`}
                                    key={service.id}
                                    className="group bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1"
                                >
                                    <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50/50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                        <Stethoscope className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">{service.name}</h3>
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 font-light leading-relaxed">
                                        {service.description || "Atención especializada diseñada para restaurar y mantener tu salud bucal."}
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <span className="font-bold text-slate-900 text-lg">${Number(service.price).toLocaleString()}</span>
                                        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {service.duration_min} min
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="mt-12 md:hidden text-center">
                            <Link href="/services" className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
                                Ver todos los servicios <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            <section className="bg-white py-24 px-6 border-t border-slate-100">
                <div className="mx-auto max-w-7xl">
                    <div className="bg-blue-600 rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row items-center">
                        <div className="lg:w-1/2 p-10 md:p-16 text-left">
                            <div className="inline-flex items-center justify-center rounded-xl bg-blue-500/50 p-3 mb-6">
                                <Users className="h-6 w-6 text-white" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                                Profesionales dedicados a tu salud
                            </h2>
                            <p className="text-blue-100 text-lg mb-8 font-light max-w-lg">
                                Conoce a nuestro equipo de especialistas. Profesionales en constante capacitación listos para brindarte la mejor experiencia clínica.
                            </p>
                            <Link href="/team" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white text-blue-700 font-bold hover:bg-blue-50 transition-colors shadow-lg">
                                Conoce a nuestros doctores <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="lg:w-1/2 w-full h-64 lg:h-full min-h-[400px] bg-slate-200 relative overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=2000&auto=format&fit=crop"
                                alt="Equipo Médico"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="bg-slate-50 py-24 px-6 border-t border-slate-200">
                <div className="mx-auto max-w-7xl">
                    <div className="flex flex-col md:items-center text-center justify-center mb-16 gap-4">
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Experiencia digital integral
                        </h2>
                        <p className="text-lg text-slate-500 font-light max-w-2xl">
                            Más que una clínica, somos un ecosistema de salud diseñado para brindarte transparencia y comodidad en cada paso.
                        </p>
                    </div>

                    <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                        <FeatureCard icon={<CalendarCheck className="h-6 w-6" />} title="Citas flexibles" desc="Gestiona tu tiempo con nuestra agenda online. Reserva, modifica o cancela desde tu móvil." />
                        <FeatureCard icon={<FileText className="h-6 w-6" />} title="Historial digital" desc="Acceso seguro a tus radiografías, planes de tratamiento y presupuestos en cualquier momento." />
                        <FeatureCard icon={<ShieldCheck className="h-6 w-6" />} title="Garantía clínica" desc="Materiales de primera calidad certificados y esterilización hospitalaria rigurosa." />
                        <FeatureCard icon={<BellRing className="h-6 w-6" />} title="Seguimiento personal" desc="Te recordamos tus revisiones preventivas y cuidamos de tu recuperación post-tratamiento." />
                        <FeatureCard icon={<Clock className="h-6 w-6" />} title="Cero esperas" desc="Respetamos tu tiempo. Nuestro flujo digital optimiza la puntualidad exacta en tu consulta." />
                        <FeatureCard icon={<MapPin className="h-6 w-6" />} title="Ubicación premium" desc="Fácil acceso, instalaciones adaptadas y tecnología de imagenología en sitio." />
                    </div>
                </div>
            </section>

            <section className="relative py-24 px-6 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 opacity-10 z-0" style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}></div>

                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="relative z-10 mx-auto max-w-3xl text-center">
                    <h2 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-5xl">
                        Tu nueva sonrisa comienza aquí
                    </h2>
                    <p className="mb-10 text-slate-300 text-lg md:text-xl font-light">
                        Únete a la familia de {clinic?.name || "nuestra clínica"} y descubre una odontología honesta, moderna y cercana a ti.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, vengo de su página web y me gustaría solicitar mi primera visita.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto rounded-full bg-green-600 px-8 py-4 text-sm font-bold text-white shadow-lg hover:bg-green-500 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                        >
                            <CalendarCheck className="w-4 h-4" /> Agendar por WhatsApp
                        </a>
                        <a href="/contact" className="w-full sm:w-auto rounded-full border border-slate-600 bg-transparent px-8 py-4 text-sm font-semibold text-white hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                            <PhoneCall className="w-4 h-4" /> Contáctanos
                        </a>
                    </div>
                </div>
            </section>

        </MainLayout>
    );
}

function StatItem({ number, label }: { number: string, label: string }) {
    const [count, setCount] = useState(0);
    const elementRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const match = number.match(/^(\D*)(\d+)(\D*)$/);
    const prefix = match ? match[1] : "";
    const targetValue = match ? parseInt(match[2], 10) : 0;
    const suffix = match ? match[3] : "";
    const isNumeric = !!match;

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.5 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible || !isNumeric) return;

        let startTimestamp: number | null = null;
        const duration = 2000;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            setCount(Math.floor(easeProgress * targetValue));

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }, [isVisible, targetValue, isNumeric]);

    return (
        <div ref={elementRef} className="flex flex-col items-center py-4 md:py-0">
            <span className="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2 tabular-nums tracking-tight">
                {isNumeric ? (
                    <>
                        {prefix}{count}{suffix}
                    </>
                ) : (
                    number
                )}
            </span>
            <span className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {label}
            </span>
        </div>
    );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="group relative p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/30 transition-all duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                {title}
            </h3>
            <p className="text-slate-500 leading-relaxed font-light text-sm md:text-base">
                {desc}
            </p>
        </div>
    );
}
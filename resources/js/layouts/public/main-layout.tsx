import { ReactNode, useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Stethoscope, Menu, X, Code } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
    children: ReactNode;
}

export default function MainLayout({ children }: Props) {
    const { auth, clinic } = usePage<any>().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileMenuOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    const navLinks = [
        { name: 'Inicio', href: '/' },        
        // { name: 'Equipo', href: '/team' },
        { name: 'Contacto', href: '/contact' },
    ];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans flex flex-col relative">

            <header className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 relative z-50 bg-inherit">

                    <div className="flex items-center gap-2">
                        {clinic?.logo_path ? (
                            <img
                                src={`/storage/${clinic.logo_path}`}
                                alt="Logo clínica"
                                className="h-8 sm:h-10 w-auto object-contain rounded-md"
                            />
                        ) : (
                            ''
                        )}
                        <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 line-clamp-1">
                            {clinic?.name || "Clínica Dental"}
                        </span>
                    </div>

                    <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="hover:text-blue-600 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden md:flex gap-3">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="inline-flex h-9 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 shadow-sm"
                            >
                                Ir al dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex h-9 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
                            >
                                Iniciar sesión
                            </Link>
                        )}
                    </div>

                    <button
                        className="md:hidden p-2 -mr-2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </header>

            <div
                className={cn(
                    "fixed inset-0 top-[64px] z-40 bg-white md:hidden transition-all duration-300 ease-in-out border-t shadow-2xl",
                    isMobileMenuOpen
                        ? "opacity-100 pointer-events-auto translate-y-0"
                        : "opacity-0 pointer-events-none -translate-y-4"
                )}
            >
                <div className="flex flex-col h-full px-6 py-8 overflow-y-auto">
                    <nav className="flex flex-col gap-6 text-lg font-medium text-slate-800">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="border-b border-slate-100 pb-4 hover:text-blue-600 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-slate-100">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="flex w-full items-center justify-center rounded-xl bg-slate-900 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Ir al dashboard
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-3.5 text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-100 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Iniciar sesión
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <main className="flex-grow flex flex-col relative z-10">
                {children}
            </main>

            <footer className="border-t bg-slate-50 py-10 mt-auto relative z-10">
                <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* <div className="flex gap-6 text-sm text-slate-600 font-medium">
                        <a href="#" className="hover:text-blue-600 transition-colors">Privacidad</a>
                        <a href="#" className="hover:text-blue-600 transition-colors">Términos</a>
                    </div> */}

                    <p className="text-slate-500 text-sm text-center md:text-left">
                        © {new Date().getFullYear()} {clinic?.name || "Doctime"}. Todos los derechos reservados.
                    </p>

                    <div className="flex items-center">
                        <a
                            href="https://www.devstudiomx.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <span>Desarrollado por</span>
                            <span className="flex items-center gap-1 font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                                <Code className="h-3.5 w-3.5" />
                                DevStudioMx
                            </span>
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
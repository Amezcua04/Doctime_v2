import { useCallback, useEffect, useRef } from 'react';

export function useSoundAlert(soundPath: string) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        audioRef.current = new Audio(soundPath);
        audioRef.current.volume = 0.8;
    }, [soundPath]);

    const playSound = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            
            audioRef.current.play().catch((err) => {
                console.warn('🔇 Navegador bloqueó el sonido. Requiere interacción del usuario primero.', err);
            });
        }
    }, []);

    return playSound;
}
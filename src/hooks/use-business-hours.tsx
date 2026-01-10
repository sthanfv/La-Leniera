'use client';

'use client';

import { useState, useEffect } from 'react';
import { CONFIG } from '@/lib/constants';

export const useBusinessHours = () => {
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const checkAvailability = () => {
            // Obtener hora actual en Colombia
            // Truco simple: new Date().getHours() toma la hora local del usuario. 
            // Para ser exactos con el negocio, idealmente usaríamos una API o server time,
            // pero para UX inmedia "client-side" esto funciona bien si el usuario está en la misma zona (99% casos).
            const now = new Date();
            const currentHour = now.getHours();

            const { startHour, endHour } = CONFIG.schedule;

            // Está abierto si la hora actual es >= inicio Y < fin
            const isWorkingHours = currentHour >= startHour && currentHour < endHour;

            setIsOpen(isWorkingHours);
        };

        checkAvailability();
        const interval = setInterval(checkAvailability, 60000); // Chequear cada minuto

        return () => clearInterval(interval);
    }, []);

    return isOpen;
};

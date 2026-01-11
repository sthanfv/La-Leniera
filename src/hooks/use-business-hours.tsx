'use client';

'use client';

import { useState, useEffect } from 'react';
import { CONFIG } from '@/lib/constants';

export const useBusinessHours = () => {
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const checkAvailability = () => {
            // Obtener hora actual en la zona horaria configurada (Colombia)
            // Usamos Intl.DateTimeFormat para obtener la hora exacta en la zona horaria destino
            const { startHour, endHour, timezone } = CONFIG.schedule;

            const now = new Date();
            const colombiaTime = new Intl.DateTimeFormat('en-US', {
                timeZone: timezone,
                hour: 'numeric',
                hour12: false
            }).format(now);

            const currentHour = parseInt(colombiaTime, 10);

            // Está abierto si la hora actual es >= inicio Y < fin
            const isWorkingHours = currentHour >= startHour && currentHour < endHour;

            setIsOpen(isWorkingHours);
        };

        checkAvailability();
        const interval = setInterval(checkAvailability, 30000); // Chequear cada 30 segundos para mayor precisión

        return () => clearInterval(interval);
    }, []);

    return isOpen;
};

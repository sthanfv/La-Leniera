'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { CONFIG } from '@/lib/constants';

interface Testimonial {
    id: number;
    text: string;
    author: string;
    location: string;
}

export const TestimonialsCarousel = () => {
    const [index, setIndex] = useState(0);
    const [items, setItems] = useState<Testimonial[]>([]);

    useEffect(() => {
        // Fisher-Yates shuffle
        const shuffled: Testimonial[] = [...CONFIG.testimonials];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setItems(shuffled);
    }, []);

    useEffect(() => {
        if (items.length === 0) return;
        const total = items.length;
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % total);
        }, 5000);
        return () => clearInterval(timer);
    }, [items]);

    if (items.length === 0) return null;

    const current = items[index];

    return (
        <div className="w-full relative py-8 overflow-hidden pointer-events-none select-none">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center text-center gap-2 px-6"
                >
                    <div className="flex gap-0.5 text-orange-500 mb-1">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-orange-500" />)}
                    </div>
                    <p className="text-white/90 text-sm leading-relaxed italic mb-4 font-medium flex-grow px-2">&quot;{current.text}&quot;</p>
                    <div className="flex flex-col mt-2">
                        <span className="text-orange-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                            {current.author}
                        </span>
                        <span className="text-neutral-600 text-[9px] uppercase font-medium">
                            {current.location}
                        </span>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Paginación minimalista */}
            <div className="flex justify-center gap-1.5 mt-4 opacity-20">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${i === (index % 3) ? 'w-4 bg-orange-500' : 'w-1 bg-white'}`}
                    />
                ))}
            </div>
        </div>
    );
};

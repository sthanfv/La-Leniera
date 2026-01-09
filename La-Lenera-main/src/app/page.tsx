'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin, MessageCircle, Truck,
  Handshake, CheckCircle2, Zap, Navigation,
  Beef, Trees, AlertTriangle, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import FireflyBackground from '@/components/firefly-background';
import { env } from '@/lib/env';

const NOISE_SVG_URL = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E`;

const ICON_MAP = {
  steak: <Beef className="w-8 h-8" />,
  logs: <Trees className="w-8 h-8" />,
  truck: <Truck className="w-8 h-8" />
};

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const MagneticButton = ({ children, onClick, disabled, className }: MagneticButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const xPos = e.clientX - centerX;
    const yPos = e.clientY - centerY;
    x.set(xPos * 0.2);
    y.set(yPos * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0); y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

const HeatTitle = React.memo(() => (
  <div className="relative inline-block select-none py-6 px-4">
    <h1 className="font-[Anton] text-[5.5rem] leading-[1.1] md:text-[8rem] tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-orange-200 via-orange-500 to-red-600 drop-shadow-2xl uppercase">
      LA<br />LEÑERA
    </h1>
    <div className="absolute inset-0 bg-orange-500/20 blur-[60px] animate-pulse pointer-events-none mix-blend-screen" />
  </div>
));
HeatTitle.displayName = 'HeatTitle';

export default function Home() {
  const [selectedPack, setSelectedPack] = useState<typeof CONFIG.packs[number]>(CONFIG.packs[1]);
  const [zone, setZone] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [status, setStatus] = useState<'idle' | 'calculating' | 'cooldown'>('idle');
  const [cooldown, setCooldown] = useState(0);

  // ✅ Validacion Estricta: Solo permite barrios en la lista oficial
  const isValidZone = useMemo(() => {
    return CONFIG.neighborhoods.includes(zone as any);
  }, [zone]);

  // Autocomplete Logic
  const getSuggestions = (input: string) => {
    const normalize = (s: string) => s.toLowerCase();
    const query = normalize(input);

    const specialOption = "No sé mi barrio (Consultar)";

    const others = CONFIG.neighborhoods.filter(n =>
      n !== specialOption && normalize(n).includes(query)
    );

    let results = others.slice(0, 3);

    // MANDATO: La opción debe aparecer de PRIMERA siempre
    results.unshift(specialOption);

    return results;
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setZone(val);
    setSuggestions(getSuggestions(val));
    setShowSuggestions(true);
  };

  const selectSuggestion = (val: string) => {
    setZone(val);
    setShowSuggestions(false);
  };

  // Persistent Cooldown
  useEffect(() => {
    const storedCooldown = localStorage.getItem('whatsapp_cooldown');
    if (storedCooldown) {
      const remaining = Math.ceil((parseInt(storedCooldown) - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
        setStatus('cooldown');
      }
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown(prev => {
          if (prev <= 1) {
            setStatus('idle');
            localStorage.removeItem('whatsapp_cooldown');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldown]);

  useEffect(() => {
    if (status === 'calculating') {
      const timer = setTimeout(() => {
        const hour = new Date().getHours();

        const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

        // Lógica para transformar el mensaje "No sé mi barrio" a algo útil para el vendedor
        const isUnknown = zone === "No sé mi barrio (Consultar)";
        const locationMsg = isUnknown ? "Requiere Validacion de Cobertura" : zone;

        // Construcción del mensaje limpio (Sin Emojis para evitar errores de codificación)
        const text = `*LA LEÑERA - NUEVO PEDIDO*\n\n` +
          `*Paquete:* ${selectedPack.title}\n` +
          `*Ubicacion:* ${locationMsg}\n\n` +
          `${greeting}, solicito informacion para confirmar mi pedido.`;

        // Use centralized config phone
        const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || CONFIG.phone;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

        // Set persistent cooldown
        const cooldownEnds = Date.now() + (CONFIG.rateLimitSeconds * 1000);
        localStorage.setItem('whatsapp_cooldown', cooldownEnds.toString());

        window.location.href = url;
        setStatus('cooldown');
        setCooldown(CONFIG.rateLimitSeconds);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, selectedPack, zone]);

  const handleSubmit = () => {
    if (!isValidZone || status !== 'idle') return;
    setStatus('calculating');
  };

  return (
    <main className="min-h-screen font-sans flex items-center justify-center p-4 relative overflow-hidden bg-neutral-950 selection:bg-orange-500 selection:text-black">
      <FireflyBackground />
      <div className="fixed inset-0 z-0 opacity-[0.07] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("${NOISE_SVG_URL}")` }} />

      {/* Card Container - Removed scroll, let it fit content naturally */}
      <motion.article
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="relative z-10 w-full max-w-sm md:max-w-md bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] overflow-visible flex flex-col p-6 gap-6"
      >
        <header className="text-center">
          <HeatTitle />
          <div className="flex items-center justify-center gap-2 -mt-4 opacity-70">
            <MapPin className="w-3 h-3 text-orange-500" />
            <span className="text-xs font-bold tracking-[0.4em] uppercase text-neutral-400">{CONFIG.city}</span>
          </div>
        </header>

        <div className="space-y-3">
          {CONFIG.packs.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedPack(item)}
              className={cn(`relative group w-full p-4 rounded-xl border transition-all duration-300`,
                selectedPack.id === item.id
                  ? 'bg-neutral-900 border-orange-500 shadow-lg shadow-orange-900/20'
                  : 'bg-white/5 border-transparent hover:bg-white/10'
              )}
            >
              {/* Glow Effect */}
              {selectedPack.id === item.id && (
                <motion.div layoutId="glow" className="absolute inset-0 bg-orange-500/5 rounded-xl" transition={{ duration: 0.2 }} />
              )}

              <div className="relative flex items-center gap-4 z-10">
                <span className={cn("text-3xl transition-transform duration-300", selectedPack.id === item.id ? "text-orange-500 scale-110" : "text-neutral-500")}>
                  {ICON_MAP[item.iconId as keyof typeof ICON_MAP]}
                </span>
                <div className="flex-1 text-left">
                  <h3 className={cn(`font-bold text-lg leading-tight`, selectedPack.id === item.id ? 'text-white' : 'text-neutral-400')}>
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-500">{item.sub}</p>
                </div>

                <div className={cn(`w-5 h-5 rounded-full border flex items-center justify-center`, selectedPack.id === item.id ? 'border-orange-500' : 'border-neutral-700')}>
                  {selectedPack.id === item.id && <motion.div layoutId="dot" className="w-2.5 h-2.5 bg-orange-500 rounded-full" />}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Neighborhood Input with Autocomplete */}
        <div className="relative z-50">
          <div className={cn(`relative p-1 rounded-xl border-2 transition-all bg-black`, isValidZone ? 'border-green-800' : 'border-neutral-800 focus-within:border-orange-500')}>
            <Navigation className={cn(`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4`, isValidZone ? 'text-green-500' : 'text-neutral-500')} />
            <input
              type="text"
              placeholder="Escribe tu barrio..."
              value={zone}
              onChange={handleZoneChange}
              onFocus={() => {
                if (suggestions.length === 0) setSuggestions(getSuggestions(""));
                setShowSuggestions(true);
              }}
              className="w-full bg-transparent py-4 pl-10 pr-10 text-base font-medium text-white placeholder-neutral-600 focus:outline-none capitalize"
            />
            {isValidZone && <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
          </div>

          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && !isValidZone && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50"
              >
                {suggestions.map(s => (
                  <button key={s} onClick={() => selectSuggestion(s)} className="w-full text-left px-4 py-3 text-neutral-300 hover:bg-white/5 hover:text-white transition-colors border-b border-white/5 last:border-0">
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <MagneticButton
          onClick={handleSubmit}
          disabled={!isValidZone || status !== 'idle'}
          className={cn(`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all`,
            isValidZone && status === 'idle'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40 hover:bg-orange-500'
              : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
          )}
        >
          {status === 'calculating' ? <Zap className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
          {status === 'calculating' ? 'ENVIANDO...' : status === 'cooldown' ? `ESPERE ${cooldown}s` : 'PEDIR POR WHATSAPP'}
        </MagneticButton>

      </motion.article>
    </main>
  );
}

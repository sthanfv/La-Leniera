'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  MapPin, MessageCircle, Truck,
  Handshake, CheckCircle2, Zap, Navigation,
  Beef, Trees, AlertTriangle, ChevronDown, Clock, X,
  Banknote, Wallet, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import FireflyBackground from '@/components/firefly-background';
import { env } from '@/lib/env';
import { useBusinessHours } from '@/hooks/use-business-hours';
import { TestimonialsCarousel } from '@/components/testimonials-carousel';

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
    <h1 className="font-anton text-[5.5rem] leading-[1.1] md:text-[8rem] tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-orange-200 via-orange-500 to-red-600 drop-shadow-2xl uppercase">
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Asistente Digital States
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'nequi'>('efectivo');
  const [eta, setEta] = useState<string>('');
  const [reservationTimer, setReservationTimer] = useState(300); // 5 min
  const [socialOrders, setSocialOrders] = useState(0);
  const [validationProgress, setValidationProgress] = useState(0);
  const [validationStep, setValidationStep] = useState('Iniciando...');

  const isOpen = useBusinessHours();

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

  // Persistent Cooldown Logic (Igual que antes)
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

  // Timer de Reserva (Poder 1: Urgencia)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showConfirmModal && reservationTimer > 0) {
      interval = setInterval(() => {
        setReservationTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showConfirmModal, reservationTimer]);

  // NUEVA LÓGICA: Validación Kinética PRO
  useEffect(() => {
    if (!showConfirmModal) {
      setValidationProgress(0);
      setValidationStep('Iniciando...');
      return;
    }

    const steps = [
      { p: 15, s: 'Analizando pedido...' },
      { p: 35, s: 'Verificando stock...' },
      { p: 60, s: 'Asignando ruta de envío...' },
      { p: 85, s: 'Aplicando bonus exclusivo...' },
      { p: 100, s: 'Pedido Validado 100%' }
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setValidationProgress(steps[current].p);
        setValidationStep(steps[current].s);
        current++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [showConfirmModal]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Final Action: Send to WhatsApp
  const proceedToWhatsApp = () => {
    setStatus('calculating');

    // Simulate "Bot Processing" delay slightly shorter
    setTimeout(() => {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
      const isUnknown = zone === "No sé mi barrio (Consultar)";
      const locationMsg = isUnknown ? "Verificar Cobertura" : zone;

      // Lenguaje Natural (Menos técnico)
      const scheduleNote = !isOpen ? " (para coordinar mañana a primera hora)" : "";
      const paymentMsg = paymentMethod === 'efectivo' ? "en efectivo" : "por Nequi";

      // Mensaje humano
      const text = `¡Hola! Quisiera confirmar el pedido de *${selectedPack.title}* que vi en la web.${scheduleNote}\n\n` +
        `Me encuentro en el barrio *${locationMsg}* y me gustaría pagar *${paymentMsg}*.\n\n` +
        `¿Me confirman si tienen disponibilidad para enviármelo? ¡Gracias!`;

      const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || CONFIG.phone;
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

      const cooldownEnds = Date.now() + (CONFIG.rateLimitSeconds * 1000);
      localStorage.setItem('whatsapp_cooldown', cooldownEnds.toString());

      window.location.href = url;
      setStatus('cooldown');
      setCooldown(CONFIG.rateLimitSeconds);
      setShowConfirmModal(false);
    }, 1000);
  };

  // Trigger Asistente Virtual
  const handlePreSubmit = () => {
    if (!isValidZone || status !== 'idle') return;

    // ETA y Poderes Visuales
    if (zone !== "No sé mi barrio (Consultar)") {
      const min = Math.floor(Math.random() * (40 - 25 + 1) + 25);
      const max = min + 15;
      setEta(`${min}-${max} min`);
      setSocialOrders(Math.floor(Math.random() * (8 - 3 + 1) + 3)); // Poder 2: Prueba Social
    } else {
      setEta("Sujeto a zona");
      setSocialOrders(12);
    }
    setReservationTimer(300);
    setShowConfirmModal(true);
  };

  return (
    <main className="min-h-screen font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden bg-neutral-950 selection:bg-orange-500 selection:text-black">
      <FireflyBackground />
      <div className="fixed inset-0 z-0 opacity-[0.07] pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("${NOISE_SVG_URL}")` }} />

      {/* Card Container - Removed scroll, let it fit content naturally */}
      <div className="relative w-full max-w-sm md:max-w-md">
        {/* Backlight Glow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-b from-orange-500/30 via-orange-900/10 to-transparent blur-3xl opacity-70 pointer-events-none rounded-[3rem]" />

        <motion.article
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="relative z-10 w-full bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-visible flex flex-col p-6 gap-6"
        >
          <header className="text-center">
            <HeatTitle />
            <div className="flex flex-col items-center justify-center gap-2 -mt-4 opacity-70">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-orange-500" />
                <span className="text-xs font-bold tracking-[0.4em] uppercase text-neutral-400">{CONFIG.city}</span>
              </div>
              {/* Business Status Indicator */}
              <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                isOpen ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20")}>
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isOpen ? "bg-green-500" : "bg-red-500")} />
                {isOpen ? "Abierto Ahora" : "Cerrado"}
              </div>
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
            onClick={handlePreSubmit}
            disabled={!isValidZone || status !== 'idle'}
            className={cn(`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all group`,
              isValidZone && status === 'idle'
                ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40 hover:bg-orange-500'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            )}
          >
            {status === 'calculating' ? <Zap className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5 transition-transform group-hover:scale-110" />}
            {status === 'calculating' ? 'ASISTENTE ANALIZANDO...' : status === 'cooldown' ? `REINTENTO EN ${cooldown}s` : 'PREPARAR PEDIDO'}
          </MagneticButton>

          {/* Testimonials Integrated Here */}
          <div className="pt-2 border-t border-white/5">
            <TestimonialsCarousel />
          </div>

        </motion.article>
      </div>

      {/* "The Conciliador" Assistant Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setShowConfirmModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-sm bg-neutral-900 border border-orange-500/20 rounded-[1.5rem] shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-neutral-800 z-30 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${validationProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-orange-400 via-orange-600 to-green-500 shadow-[0_0_15px_rgba(234,88,12,0.5)]"
                />
              </div>
              <div className="absolute top-2 left-0 w-full flex justify-center z-30">
                <motion.span
                  key={validationStep}
                  initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="text-[8px] font-black uppercase tracking-widest text-orange-500/80 bg-neutral-900/80 px-2 py-0.5 rounded-b-md border-x border-b border-orange-500/20"
                >
                  {validationStep}
                </motion.span>
              </div>

              <div className="overflow-y-auto p-8 pt-12 flex flex-col gap-6 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <button onClick={() => setShowConfirmModal(false)} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors p-1 z-30 bg-black/20 rounded-full"><X className="w-6 h-6" /></button>

                <div className="flex flex-col gap-6">
                  {/* Cabecera Natural con Poder 1: Timer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-inner">
                        <Handshake className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="text-white font-anton text-xl tracking-wider uppercase leading-none">PEDIDO SEGURO</h3>
                        <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-black mt-1">Validación de Asistente</p>
                      </div>
                    </div>
                    <div className="bg-orange-500/10 border border-orange-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      <span className="text-[10px] font-black text-orange-400 font-mono tracking-tighter">RESERVA: {formatTimer(reservationTimer)}</span>
                    </div>
                  </div>

                  {/* Resumen Amigable */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-1">
                      <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Llevas</span>
                      <p className="text-white font-bold text-sm leading-tight italic">&quot;{selectedPack.title}&quot;</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-1 text-right">
                      <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Para enviar a</span>
                      <p className="text-white font-bold text-sm truncate opacity-80">{zone}</p>
                    </div>
                  </div>

                  {/* Bloque Logístico Real y Honesto */}
                  <div className="bg-white/[0.03] rounded-2xl p-5 border border-white/5 space-y-4 shadow-inner">
                    {/* Habilidad Re-enfocada: Compromiso de Entrega */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-neutral-400 font-medium">
                        <Clock className="w-4 h-4 text-orange-500/60" />
                        <span>Compromiso de entrega:</span>
                      </div>
                      <span className="text-white font-black bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/20 uppercase tracking-tighter">{isOpen ? 'Despacho Hoy' : 'Primer Turno'}</span>
                    </div>

                    {/* Nueva Habilidad Útil: Logística de Descarga */}
                    <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                      <div className="bg-orange-500/10 p-1.5 rounded-lg border border-orange-500/20">
                        <Navigation className="w-3 h-3 text-orange-400 rotate-45" />
                      </div>
                      <p className="text-[10px] text-neutral-400 font-medium leading-tight">
                        <span className="text-orange-400 font-bold uppercase">LOGÍSTICA:</span> Descargamos a pie de camión o donde el acceso lo permita con seguridad.
                      </p>
                    </div>

                    {/* Nueva Habilidad Útil: Tipo de Madera */}
                    <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                      <div className="bg-green-500/10 p-1.5 rounded-lg border border-green-500/20">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                      </div>
                      <p className="text-[10px] text-neutral-400 font-medium leading-tight">
                        <span className="text-green-400 font-bold uppercase">PRODUCTO:</span> Madera de bosque renovable, seleccionada para brasas duraderas y buen calor.
                      </p>
                    </div>
                  </div>


                  {/* Pagos */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-1">¿Cómo quieres pagar?</span>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'efectivo', icon: Banknote, label: 'Efectivo', color: 'bg-orange-500', t: 'black' },
                        { id: 'nequi', icon: Zap, label: 'Nequi', color: 'bg-purple-600', t: 'white' }
                      ].map((m) => (
                        <button
                          key={m.id} onClick={() => setPaymentMethod(m.id as any)}
                          className={cn("p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 relative overflow-hidden",
                            paymentMethod === m.id
                              ? `${m.color} text-${m.t} border-transparent scale-[1.02] shadow-[0_10px_20px_-5px_rgba(0,0,0,0.5)]`
                              : "bg-white/[0.03] text-neutral-500 border-white/5 hover:border-white/10 hover:bg-white/[0.05]")}
                        >
                          <m.icon className="w-5 h-5" />
                          <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Poder 4 & 5: Prioridad / Bonus */}
                  {selectedPack.id === 'asado' ? (
                    <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl flex items-center gap-3 group">
                      <div className="p-2 bg-orange-500/20 rounded-lg text-orange-500 group-hover:animate-bounce"><Zap className="w-4 h-4" /></div>
                      <p className="text-[10px] text-neutral-300 leading-tight">
                        Subiendo a <span className="text-orange-400 font-bold uppercase">Medio Viaje</span> obtienes <span className="text-white font-black underline underline-offset-4">ENVÍO PRIORITARIO</span>.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-2xl flex items-center gap-3">
                      <div className="p-2 bg-green-500/20 rounded-lg text-green-500"><CheckCircle2 className="w-4 h-4 shadow-sm" /></div>
                      <p className="text-[10px] text-green-200/80 leading-tight">
                        <span className="font-black text-white uppercase italic">BONUS ACTIVO:</span> Pack de astillas de inicio incluido.
                      </p>
                    </div>
                  )}

                  {!isOpen && (
                    <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <Clock className="w-4 h-4 text-amber-500 mt-0.5" />
                      <p className="text-xs text-amber-200">
                        Horario cerrado. Solicitud quedará **programada** para el primer turno de mañana.
                      </p>
                    </div>
                  )}


                  <button
                    onClick={proceedToWhatsApp}
                    disabled={validationProgress < 100}
                    className={cn(
                      "group relative w-full py-5 text-white rounded-[1.5rem] font-black shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95 overflow-hidden shrink-0 mb-4",
                      validationProgress < 100
                        ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-white/5 opacity-50"
                        : "bg-green-600 hover:bg-green-500 shadow-[0_20px_40px_-20px_rgba(22,163,74,1)]"
                    )}
                  >
                    <AnimatePresence mode="wait">
                      {validationProgress < 100 ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                          <span className="uppercase tracking-[0.2em] text-xs font-black">Validando Pedido...</span>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="ready"
                          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2"
                        >
                          <MessageCircle className="w-6 h-6" />
                          <span className="uppercase tracking-[0.2em] text-xs font-black">Solicitar despacho</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {validationProgress >= 100 && (
                      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

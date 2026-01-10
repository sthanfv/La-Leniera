import winston from 'winston';

// ✅ MANDATO-FILTRO: Logs y auditoría de eventos (sin datos sensibles)
// ✅ MANDATO-FILTRO: Nada de console.log en producción

const { combine, timestamp, json, colorize, simple } = winston.format;

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        timestamp(),
        json()
    ),
    transports: [
        new winston.transports.Console({
            format: process.env.NODE_ENV === 'production'
                ? json()
                : combine(colorize(), simple()),
        }),
    ],
});

// Redact sensitive keys
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'key', 'auth', 'credit_card'];

const redact = (obj: unknown): unknown => {
    if (typeof obj !== 'object' || obj === null) return obj;

    if (Array.isArray(obj)) {
        return obj.map(redact);
    }

    const newObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k))) {
            newObj[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            newObj[key] = redact(value);
        } else {
            newObj[key] = value;
        }
    }
    return newObj;
};

export const secureLog = {
    info: (message: string, meta?: Record<string, unknown>) => {
        logger.info(message, redact(meta) as Record<string, unknown>);
    },
    error: (message: string, error?: unknown) => {
        logger.error(message, { error: redact(error) });
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
        logger.warn(message, redact(meta) as Record<string, unknown>);
    },
};

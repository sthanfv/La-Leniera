import { z } from 'zod';

// ✅ MANDATO-FILTRO: Validación + sanitización de inputs (Env Vars)
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_WHATSAPP_PHONE: z.string().min(1, "NEXT_PUBLIC_WHATSAPP_PHONE is required for contact links."),
});

// Validate environment variables at runtime
const _env = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_WHATSAPP_PHONE: process.env.NEXT_PUBLIC_WHATSAPP_PHONE,
});

if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format());
  throw new Error("Invalid environment variables");
}

export const env = _env.data;

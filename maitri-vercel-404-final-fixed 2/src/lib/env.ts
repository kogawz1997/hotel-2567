import { z } from 'zod';

const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on', 'mock']);

export function isMockServicesEnabled() {
  return TRUE_VALUES.has(String(process.env.USE_MOCK_SERVICES || process.env.NEXT_PUBLIC_USE_MOCK_SERVICES || '').toLowerCase());
}

export function isVercelPreview() {
  return process.env.VERCEL === '1' && process.env.VERCEL_ENV !== 'production';
}

const demoUrl = 'https://maitri-demo.supabase.co';
const demoAnonKey = 'demo-anon-key-for-vercel-preview-only-000000';
const demoServiceKey = 'demo-service-role-key-for-vercel-preview-only-000000';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  USE_MOCK_SERVICES: z.string().optional(),
  NEXT_PUBLIC_USE_MOCK_SERVICES: z.string().optional(),
  MOCK_AUTH_USER: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(8).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(8).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  ANTHROPIC_API_KEY: z.string().min(8).optional(),
  OPENAI_API_KEY: z.string().min(8).optional(),
  OMISE_PUBLIC_KEY: z.string().min(8).optional(),
  OMISE_SECRET_KEY: z.string().min(8).optional(),
  OMISE_WEBHOOK_SECRET: z.string().min(8).optional(),
  LINE_CHANNEL_SECRET: z.string().min(8).optional(),
  LINE_CHANNEL_ACCESS_TOKEN: z.string().min(8).optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().min(8).optional(),
  WHATSAPP_APP_SECRET: z.string().min(8).optional(),
  WEBHOOK_SHARED_SECRET: z.string().min(8).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema> & {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

let cachedEnv: ServerEnv | null = null;

function withMockDefaults(env: z.infer<typeof serverEnvSchema>): ServerEnv {
  return {
    ...env,
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL || demoUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY || demoAnonKey,
    SUPABASE_SERVICE_ROLE_KEY: env.SUPABASE_SERVICE_ROLE_KEY || demoServiceKey,
    OMISE_PUBLIC_KEY: env.OMISE_PUBLIC_KEY || 'pkey_test_maitri_mock_preview',
    OMISE_SECRET_KEY: env.OMISE_SECRET_KEY || 'skey_test_maitri_mock_preview',
    OMISE_WEBHOOK_SECRET: env.OMISE_WEBHOOK_SECRET || 'whsec_maitri_mock_preview',
    WEBHOOK_SHARED_SECRET: env.WEBHOOK_SHARED_SECRET || 'shared_mock_preview_secret',
  };
}

export function getEnv(): ServerEnv {
  if (cachedEnv) return cachedEnv;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid server environment: ${missing}`);
  }

  const mockMode = isMockServicesEnabled();
  const env = mockMode ? withMockDefaults(parsed.data) : parsed.data;

  const requiredBase: Array<keyof ServerEnv> = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingBase = requiredBase.filter((key) => !env[key]);
  if (missingBase.length) {
    throw new Error(`Missing environment variables: ${missingBase.join(', ')}. For Vercel test deploy, set USE_MOCK_SERVICES=1.`);
  }

  if (env.NODE_ENV === 'production' && !mockMode) {
    const requiredInProduction: Array<keyof ServerEnv> = [
      'SUPABASE_SERVICE_ROLE_KEY',
      'OMISE_SECRET_KEY',
      'OMISE_WEBHOOK_SECRET',
      'WEBHOOK_SHARED_SECRET',
    ];
    const missing = requiredInProduction.filter((key) => !env[key]);
    if (missing.length) {
      throw new Error(`Missing production environment variables: ${missing.join(', ')}`);
    }
  }

  cachedEnv = env as ServerEnv;
  return cachedEnv;
}

export function requireEnv(name: keyof ServerEnv): string {
  const value = getEnv()[name];
  if (!value) throw new Error(`Missing required environment variable: ${String(name)}`);
  return String(value);
}

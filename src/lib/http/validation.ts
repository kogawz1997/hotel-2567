import { NextResponse } from 'next/server';
import { z } from 'zod';

export async function parseJson<T>(request: Request, schema: z.ZodSchema<T>): Promise<{ data: T; error: null } | { data: null; error: NextResponse }> {
  try {
    const json = await request.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return {
        data: null,
        error: NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 }),
      };
    }
    return { data: parsed.data, error: null };
  } catch {
    return { data: null, error: NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }) };
  }
}

export const uuidSchema = z.string().uuid();
export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

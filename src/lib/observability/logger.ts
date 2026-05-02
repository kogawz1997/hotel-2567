import { randomUUID } from 'crypto';
type LogLevel = 'info' | 'warn' | 'error';

type LogFields = Record<string, unknown>;

function safeFields(fields: LogFields = {}) {
  const redactedKeys = ['password', 'token', 'secret', 'authorization', 'cardToken', 'card_token'];
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [
      key,
      redactedKeys.some((blocked) => key.toLowerCase().includes(blocked)) ? '[redacted]' : value,
    ])
  );
}

export function getRequestId(request: Request) {
  return request.headers.get('x-request-id') || randomUUID();
}

export function logEvent(level: LogLevel, message: string, fields: LogFields = {}) {
  const payload = {
    level,
    message,
    time: new Date().toISOString(),
    ...safeFields(fields),
  };

  if (level === 'error') console.error(JSON.stringify(payload));
  else if (level === 'warn') console.warn(JSON.stringify(payload));
  else console.info(JSON.stringify(payload));
}

export function logError(message: string, error: unknown, fields: LogFields = {}) {
  const err = error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : { error };
  logEvent('error', message, { ...fields, ...err });
}

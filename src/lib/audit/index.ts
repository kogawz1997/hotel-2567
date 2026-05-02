export type AuditActor = {
  userId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
};

export function getAuditActor(request: Request, userId?: string | null): AuditActor {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || null;
  return {
    userId: userId || null,
    ip,
    userAgent: request.headers.get('user-agent'),
  };
}

export async function writeAuditLog(
  supabase: any,
  params: {
    hotelId: string;
    action: string;
    entityType: string;
    entityId?: string | null;
    actor?: AuditActor;
    changes?: Record<string, unknown>;
  }
) {
  try {
    await supabase.from('audit_logs').insert({
      hotel_id: params.hotelId,
      user_id: params.actor?.userId || null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      changes: params.changes || {},
      ip_address: params.actor?.ip || null,
      user_agent: params.actor?.userAgent || null,
    });
  } catch {
    // Audit logging must never break the primary business flow.
  }
}

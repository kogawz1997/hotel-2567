import { createMockTables, createMockUser, MOCK_IDS } from './data';

const tables = createMockTables();

function uuidLike(prefix = '99999999') {
  return `${prefix}-${Math.random().toString(16).slice(2, 6).padEnd(4, '0')}-4${Math.random().toString(16).slice(2, 5).padEnd(3, '0')}-8${Math.random().toString(16).slice(2, 5).padEnd(3, '0')}-${Date.now().toString().slice(-12).padStart(12, '0')}`;
}

function withRelations(table: string, row: any) {
  if (!row) return row;
  if (table === 'reservations') {
    const hotel = tables.hotels.find((item) => item.id === row.hotel_id);
    const guest = tables.guests.find((item) => item.id === row.guest_id);
    const roomType = tables.room_types.find((item) => item.id === row.room_type_id);
    return { ...row, hotels: row.hotels || hotel, guests: guest, room_types: roomType };
  }
  if (table === 'user_profiles') {
    const org = tables.organizations.find((item) => item.id === row.organization_id);
    return { ...row, organizations: row.organizations || org };
  }
  return row;
}

class MockQuery {
  private filters: Array<(row: any) => boolean> = [];
  private maxRows: number | null = null;
  private orderKey: string | null = null;
  private mutation: 'insert' | 'upsert' | 'update' | 'delete' | null = null;
  private payload: any = null;
  private singleMode: 'single' | 'maybeSingle' | null = null;

  constructor(private table: string) {}

  select(_columns?: string) { return this; }
  limit(count: number) { this.maxRows = count; return this; }
  order(key: string) { this.orderKey = key; return this; }
  eq(key: string, value: any) { this.filters.push((row) => row?.[key] === value); return this; }
  neq(key: string, value: any) { this.filters.push((row) => row?.[key] !== value); return this; }
  gt(key: string, value: any) { this.filters.push((row) => row?.[key] > value); return this; }
  gte(key: string, value: any) { this.filters.push((row) => row?.[key] >= value); return this; }
  lt(key: string, value: any) { this.filters.push((row) => row?.[key] < value); return this; }
  lte(key: string, value: any) { this.filters.push((row) => row?.[key] <= value); return this; }
  in(key: string, values: any[]) { this.filters.push((row) => values.includes(row?.[key])); return this; }
  not(key: string, operator: string, value: string) {
    if (operator === 'in') {
      const blocked = value.replace(/[()]/g, '').split(',').map((item) => item.trim());
      this.filters.push((row) => !blocked.includes(String(row?.[key])));
    }
    return this;
  }
  or(expression: string) {
    const parts = expression.split(',').map((part) => part.split('.'));
    this.filters.push((row) => parts.some(([key, op, value]) => op === 'eq' && String(row?.[key]) === value));
    return this;
  }
  single() { this.singleMode = 'single'; return this; }
  maybeSingle() { this.singleMode = 'maybeSingle'; return this; }
  insert(payload: any) { this.mutation = 'insert'; this.payload = payload; return this; }
  upsert(payload: any) { this.mutation = 'upsert'; this.payload = payload; return this; }
  update(payload: any) { this.mutation = 'update'; this.payload = payload; return this; }
  delete() { this.mutation = 'delete'; return this; }

  private rows() {
    const source = tables[this.table] || (tables[this.table] = []);
    let rows = [...source].filter((row) => this.filters.every((filter) => filter(row))).map((row) => withRelations(this.table, row));
    if (this.orderKey) rows = rows.sort((a, b) => String(a?.[this.orderKey!]).localeCompare(String(b?.[this.orderKey!])));
    if (this.maxRows != null) rows = rows.slice(0, this.maxRows);
    return rows;
  }

  private applyMutation() {
    const tableRows = tables[this.table] || (tables[this.table] = []);
    if (this.mutation === 'insert' || this.mutation === 'upsert') {
      const list = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted = list.map((item) => {
        const row = {
          id: item.id || uuidLike(),
          created_at: item.created_at || new Date().toISOString(),
          ...item,
          reservation_code: item.reservation_code || (this.table === 'reservations' ? `MT-MOCK-${String(tableRows.length + 1).padStart(4, '0')}` : item.reservation_code),
        };
        const existingIndex = tableRows.findIndex((old) => old.id === row.id);
        if (existingIndex >= 0) tableRows[existingIndex] = { ...tableRows[existingIndex], ...row };
        else tableRows.push(row);
        return withRelations(this.table, row);
      });
      return inserted;
    }
    if (this.mutation === 'update') {
      const updated: any[] = [];
      for (let index = 0; index < tableRows.length; index += 1) {
        if (this.filters.every((filter) => filter(tableRows[index]))) {
          tableRows[index] = { ...tableRows[index], ...this.payload, updated_at: new Date().toISOString() };
          updated.push(withRelations(this.table, tableRows[index]));
        }
      }
      return updated;
    }
    if (this.mutation === 'delete') {
      const deleted = this.rows();
      tables[this.table] = tableRows.filter((row) => !this.filters.every((filter) => filter(row)));
      return deleted;
    }
    return this.rows();
  }

  async execute() {
    const rows = this.mutation ? this.applyMutation() : this.rows();
    if (this.singleMode) {
      const row = rows[0] || null;
      if (!row && this.singleMode === 'single') return { data: null, error: { message: `Mock row not found in ${this.table}` } };
      return { data: row, error: null };
    }
    return { data: rows, error: null };
  }

  then(resolve: any, reject: any) {
    return this.execute().then(resolve, reject);
  }
}

export function createMockSupabaseClient() {
  return {
    auth: {
      async getUser() { return { data: { user: createMockUser() }, error: null }; },
      async signOut() { return { error: null }; },
      async signInWithPassword() { return { data: { user: createMockUser(), session: { access_token: 'mock-session' } }, error: null }; },
      async signUp() { return { data: { user: createMockUser(), session: { access_token: 'mock-session' } }, error: null }; },
    },
    from(table: string) { return new MockQuery(table); },
    async rpc(name: string, params: any) {
      if (name === 'apply_reservation_payment') {
        const reservation = tables.reservations.find((item) => item.id === params?.p_reservation_id);
        if (reservation) reservation.paid_amount = Number(reservation.paid_amount || 0) + Number(params?.p_amount || 0);
      }
      if (name === 'expire_unpaid_booking_holds') return { data: 0, error: null };
      return { data: null, error: null };
    },
    storage: {
      from() {
        return {
          async upload() { return { data: { path: 'mock/upload.svg' }, error: null }; },
          getPublicUrl(path: string) { return { data: { publicUrl: `/mock/${path}` } }; },
        };
      },
    },
    __mock: { enabled: true, ids: MOCK_IDS, tables },
  } as any;
}

const KEYS: Record<string, string> = {
  series: 'guest_series',
  characters: 'guest_characters',
  groups: 'guest_groups',
  character_groups: 'guest_character_groups',
}

function read<T>(table: string): T[] {
  try { return JSON.parse(localStorage.getItem(KEYS[table] ?? '') ?? '[]') } catch { return [] }
}
function write<T>(table: string, data: T[]) {
  const key = KEYS[table]
  if (key) localStorage.setItem(key, JSON.stringify(data))
}

export const guestDb = {
  getAll<T>(table: string, orderBy = 'created_at', ascending = false): T[] {
    const rows = read<Record<string, unknown>>(table)
    return [...rows].sort((a, b) => {
      const av = String(a[orderBy] ?? '')
      const bv = String(b[orderBy] ?? '')
      const cmp = av.localeCompare(bv, undefined, { numeric: true, sensitivity: 'base' })
      return ascending ? cmp : -cmp
    }) as unknown as T[]
  },

  insert<T extends object>(table: string, data: T): T & { id: string; created_at: string } {
    const item = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    const rows = read<object>(table)
    write(table, [...rows, item])
    return item
  },

  update(table: string, id: string, data: object) {
    const rows = read<{ id: string }>(table)
    write(table, rows.map(r => r.id === id ? { ...r, ...data } : r))
  },

  delete(table: string, id: string) {
    const rows = read<{ id: string }>(table)
    write(table, rows.filter(r => r.id !== id))
  },

  deleteWhere(table: string, field: string, value: string) {
    const rows = read<Record<string, string>>(table)
    write(table, rows.filter(r => r[field] !== value))
  },

  deleteWhereIn(table: string, field: string, values: string[]) {
    const set = new Set(values)
    const rows = read<Record<string, string>>(table)
    write(table, rows.filter(r => !set.has(r[field])))
  },

  getWhere<T>(table: string, field: string, value: string): T[] {
    const rows = read<Record<string, string>>(table)
    return rows.filter(r => r[field] === value) as unknown as T[]
  },

  findById<T>(table: string, id: string): T | null {
    const rows = read<{ id: string }>(table)
    return (rows.find(r => r.id === id) ?? null) as unknown as T | null
  },
}

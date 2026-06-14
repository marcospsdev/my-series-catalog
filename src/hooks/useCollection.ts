import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { guestDb } from '../lib/guestDb'
import { useAuth } from '../contexts/AuthContext'

export function useCollection<T>(
  tableName: string,
  orderByField: string = 'created_at',
  ascending: boolean = false,
) {
  const { isGuest } = useAuth()
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const doFetch = useCallback(async () => {
    setLoading(true)

    if (isGuest) {
      const rows = guestDb.getAll<T>(tableName, orderByField, ascending)
      setData(rows)
      setError(null)
      setLoading(false)
      return
    }

    const { data: rows, error: err } = await supabase
      .from(tableName)
      .select('*')
      .order(orderByField, { ascending })
    if (err) setError(err.message)
    else {
      setData((rows as T[]) ?? [])
      setError(null)
    }
    setLoading(false)
  }, [tableName, orderByField, ascending, isGuest])

  useEffect(() => {
    void doFetch()

    if (isGuest) return

    const channel = supabase
      .channel(`realtime_${tableName}`)
      .on('postgres_changes' as const, { event: '*', schema: 'public', table: tableName }, () =>
        void doFetch(),
      )
      .subscribe()

    return () => { void supabase.removeChannel(channel) }
  }, [doFetch, tableName, isGuest])

  return { data, loading, error, refetch: doFetch }
}

import { Icon } from '@iconify/react'
import { useState } from 'react'
import { useDb } from '../../contexts/DataContext'

interface FavoriteButtonProps {
  table: 'series' | 'characters'
  id: string
  favorite: boolean
}

export default function FavoriteButton({ table, id, favorite }: FavoriteButtonProps) {
  const db = useDb()
  const [active, setActive] = useState(favorite)
  const [loading, setLoading] = useState(false)

  async function toggle(e: React.MouseEvent) {
    e.stopPropagation()
    if (loading) return
    setLoading(true)
    const next = !active
    try {
      await db.toggleFavorite(table, id, next)
      setActive(next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="p-1.5 rounded-full bg-black/40 backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 cursor-pointer"
    >
      <Icon
        icon={active ? 'mdi:heart' : 'mdi:heart-outline'}
        className={`w-5 h-5 transition-colors ${active ? 'text-red-500' : 'text-white/70'}`}
      />
    </button>
  )
}

import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import CharacterCard from '../characters/CharacterCard'
import type { Alignment, Character, Group, Serie } from '../../types'

const PLACEHOLDER = 'https://placehold.co/800x300/1a1a2e/7c3aed?text=?'

interface Props {
  group: Group | null
  serie?: Serie
  onClose: () => void
  onCharacterClick?: (character: Character) => void
}

export default function GroupDetailModal({ group, serie, onClose, onCharacterClick }: Props) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!group) return
    setCharacters([])

    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)

    setLoading(true)
    supabase
      .from('character_groups')
      .select('characters(*)')
      .eq('group_id', group.id)
      .then(({ data }) => {
        setCharacters(
          (data ?? [])
            .map((d) => (d as unknown as { characters: Character }).characters)
            .filter(Boolean),
        )
        setLoading(false)
      })

    return () => document.removeEventListener('keydown', handleKey)
  }, [group, onClose])

  if (!group) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-[#0f0f1e] border border-white/10 rounded-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1 bg-gradient-to-r from-transparent via-violet-500/60 to-transparent rounded-full" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <Icon icon="mdi:close" className="w-5 h-5" />
        </button>

        {/* Hero */}
        <div className="relative h-44 flex-shrink-0 overflow-hidden">
          <img
            src={group.image_url ?? PLACEHOLDER}
            alt={group.name}
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.5)', transform: 'scale(1.05)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1e] via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end gap-3">
            {group.image_url && (
              <img
                src={group.image_url}
                alt={group.name}
                className="w-16 h-16 object-cover rounded-xl border-2 border-white/20 shadow-xl flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="text-2xl font-bold text-white">{group.name}</h2>
                <Badge label={group.alignment} variant={group.alignment as Alignment} />
              </div>
              {serie && (
                <p className="text-violet-400 text-sm flex items-center gap-1.5">
                  <Icon icon="mdi:television-play" className="w-4 h-4" />
                  {serie.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Members */}
        <div className="flex-1 overflow-y-auto p-6">
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Icon icon="mdi:account-group" className="w-4 h-4" />
            {characters.length} membros
          </p>

          {loading ? (
            <div className="flex justify-center py-16">
              <Icon icon="mdi:loading" className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          ) : characters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/30">
              <Icon icon="mdi:account-off-outline" className="w-14 h-14" />
              <p>Nenhum personagem neste grupo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {characters.map((c) => (
                <CharacterCard
                  key={c.id}
                  character={c}
                  onClick={() => onCharacterClick?.(c)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

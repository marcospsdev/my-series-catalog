import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { supabase } from '../../lib/supabase'
import CharacterCard from '../characters/CharacterCard'
import FavoriteButton from '../../components/ui/FavoriteButton'
import { WATCH_STATUS_CONFIG } from '../../components/ui/WatchStatusBadge'
import type { Character, Serie, WatchStatus } from '../../types'

const PLACEHOLDER = 'https://placehold.co/300x420/1a1a2e/7c3aed?text=?'

interface Props {
  serie: Serie | null
  onClose: () => void
  onCharacterClick?: (character: Character) => void
}

export default function SerieDetailModal({ serie, onClose, onCharacterClick }: Props) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(false)
  const [watchStatus, setWatchStatus] = useState<WatchStatus>('unwatched')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (!serie) return
    setCharacters([])
    setWatchStatus(serie.watch_status)

    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)

    setLoading(true)
    supabase
      .from('characters')
      .select('*')
      .eq('serie_id', serie.id)
      .order('name', { ascending: true })
      .then(({ data }) => {
        setCharacters((data as Character[]) ?? [])
        setLoading(false)
      })

    return () => document.removeEventListener('keydown', handleKey)
  }, [serie, onClose])

  async function handleStatusChange(newStatus: WatchStatus) {
    if (!serie || updatingStatus) return
    setUpdatingStatus(true)
    setWatchStatus(newStatus)
    await supabase.from('series').update({ watch_status: newStatus }).eq('id', serie.id)
    setUpdatingStatus(false)
  }

  if (!serie) return null

  const statusCfg = WATCH_STATUS_CONFIG[watchStatus]

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-5xl bg-[#0f0f1e] border border-white/10 rounded-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <Icon icon="mdi:close" className="w-5 h-5" />
        </button>

        {/* Hero banner */}
        <div className="relative h-52 flex-shrink-0 overflow-hidden">
          <img
            src={serie.cover_url ?? PLACEHOLDER}
            alt={serie.title}
            className="w-full h-full object-cover object-center"
            style={{ filter: 'blur(2px) brightness(0.45)', transform: 'scale(1.05)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f1e] via-black/20 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-5">
            <img
              src={serie.cover_url ?? PLACEHOLDER}
              alt={serie.title}
              className="w-20 h-28 object-cover rounded-xl border-2 border-white/20 shadow-2xl flex-shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-2">
              <h2 className="text-2xl font-bold text-white truncate">{serie.title}</h2>

              {/* Meta row: rating + seasons + characters */}
              <div className="flex items-center gap-3 flex-wrap">
                {serie.rating != null && (
                  <span className="flex items-center gap-1 text-yellow-300 text-sm font-semibold">
                    <Icon icon="mdi:star" className="w-4 h-4" />
                    {serie.rating % 1 === 0 ? serie.rating.toFixed(0) : serie.rating.toFixed(1)}
                    <span className="text-white/30 font-normal">/10</span>
                  </span>
                )}
                {serie.seasons != null && (
                  <span className="text-white/50 text-xs flex items-center gap-1">
                    <Icon icon="mdi:television-play" className="w-3.5 h-3.5" />
                    {serie.seasons} temporada{serie.seasons !== 1 ? 's' : ''}
                  </span>
                )}
                {serie.total_episodes != null && (
                  <span className="text-white/50 text-xs flex items-center gap-1">
                    <Icon icon="mdi:format-list-numbered" className="w-3.5 h-3.5" />
                    {serie.total_episodes} episódios
                  </span>
                )}
                <span className="text-white/50 text-xs flex items-center gap-1">
                  <Icon icon="mdi:account-group" className="w-3.5 h-3.5" />
                  {characters.length} personagens
                </span>
              </div>
            </div>
            <FavoriteButton table="series" id={serie.id} favorite={serie.favorite} />
          </div>
        </div>

        {/* Watch status toggle */}
        <div className="px-6 pt-4 pb-1 flex-shrink-0 border-b border-white/5">
          <p className="text-white/30 text-xs uppercase tracking-wider mb-2">Status de exibição</p>
          <div className="flex gap-2 flex-wrap">
            {(Object.entries(WATCH_STATUS_CONFIG) as [WatchStatus, typeof statusCfg][]).map(([val, cfg]) => (
              <button
                key={val}
                type="button"
                onClick={() => handleStatusChange(val)}
                disabled={updatingStatus}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer disabled:opacity-60 ${
                  watchStatus === val
                    ? cfg.cls.replace('text-', 'text-').replace('bg-', 'bg-').replace('border-', 'border-')
                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70'
                }`}
              >
                <Icon icon={cfg.icon} className="w-3.5 h-3.5" />
                {cfg.label}
                {watchStatus === val && updatingStatus && (
                  <Icon icon="mdi:loading" className="w-3 h-3 animate-spin" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        {serie.description && (
          <div className="px-6 pt-4 flex-shrink-0">
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Sinopse</p>
            <p className="text-white/70 text-sm leading-relaxed">{serie.description}</p>
          </div>
        )}

        {/* Characters */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Icon icon="mdi:loading" className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          ) : characters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/30">
              <Icon icon="mdi:account-off-outline" className="w-14 h-14" />
              <p>Nenhum personagem cadastrado nessa série.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {characters.map((c) => (
                <CharacterCard
                  key={c.id}
                  character={c}
                  serie={serie}
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

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../contexts/AuthContext'
import { useCollection } from '../hooks/useCollection'
import SerieCard from '../modules/series/SerieCard'
import CharacterCard from '../modules/characters/CharacterCard'
import CharacterDetailModal from '../modules/characters/CharacterDetailModal'
import type { Character, Serie } from '../types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { isGuest, user } = useAuth()
  const { data: series } = useCollection<Serie>('series')
  const { data: characters } = useCollection<Character>('characters')
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  const watching   = useMemo(() => series.filter(s => s.watch_status === 'watching'),   [series])
  const completed  = useMemo(() => series.filter(s => s.watch_status === 'completed'),  [series])
  const unwatched  = useMemo(() => series.filter(s => s.watch_status === 'unwatched'),  [series])
  const favSeries  = useMemo(() => series.filter(s => s.favorite).slice(0, 6),          [series])
  const favChars   = useMemo(() => characters.filter(c => c.favorite).slice(0, 6),      [characters])
  const serieMap   = useMemo(() => Object.fromEntries(series.map(s => [s.id, s])),       [series])

  const avgRating = useMemo(() => {
    const rated = series.filter(s => s.rating != null)
    if (!rated.length) return null
    return (rated.reduce((acc, s) => acc + (s.rating ?? 0), 0) / rated.length)
  }, [series])

  const stats = [
    { label: 'Total de séries', value: series.length,     icon: 'mdi:television-play',       color: 'text-violet-400',  bg: 'bg-violet-500/10 border-violet-500/20' },
    { label: 'Assistindo',      value: watching.length,   icon: 'mdi:play-circle-outline',   color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Assistidos',      value: completed.length,  icon: 'mdi:check-circle-outline',  color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Não assistidos',  value: unwatched.length,  icon: 'mdi:eye-off-outline',       color: 'text-zinc-400',    bg: 'bg-zinc-500/10 border-zinc-500/20' },
  ]

  const totalPercent = series.length > 0 ? 100 : 0
  const watchedPct  = series.length > 0 ? Math.round((completed.length / series.length) * 100) : 0
  const watchingPct = series.length > 0 ? Math.round((watching.length / series.length) * 100) : 0

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-white/40 text-sm mt-1">
            {isGuest ? 'Modo convidado — dados locais' : (user?.email ?? 'Seu catálogo')}
          </p>
        </div>
        {avgRating != null && (
          <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-2">
            <Icon icon="mdi:star" className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-300 font-bold text-sm">{avgRating.toFixed(1)}</span>
            <span className="text-yellow-300/50 text-xs">média</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon, color, bg }) => (
          <div key={label} className={`border rounded-2xl p-3 sm:p-4 flex items-center gap-3 ${bg}`}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <Icon icon={icon} className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
              <p className="text-white/40 text-xs truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {series.length > 0 && (
        <div className="bg-white/3 border border-white/8 rounded-2xl p-4 sm:p-5 space-y-3">
          <p className="text-white/40 text-xs uppercase tracking-wider">Progresso do catálogo</p>
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${watchedPct}%` }}
              title={`${completed.length} assistidos`}
            />
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${watchingPct}%` }}
              title={`${watching.length} assistindo`}
            />
          </div>
          <div className="flex items-center gap-4 flex-wrap text-xs text-white/40">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{watchedPct}% assistidos</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />{watchingPct}% em andamento</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/20 inline-block" />{100 - watchedPct - watchingPct}% pendentes</span>
          </div>
        </div>
      )}

      {/* Em andamento */}
      {watching.length > 0 && (
        <section>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Icon icon="mdi:play-circle-outline" className="w-5 h-5 text-blue-400" />
            Assistindo agora
          </h2>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {watching.slice(0, 6).map(s => (
              <SerieCard key={s.id} serie={s} onClick={() => navigate(`/series/${s.id}`)} />
            ))}
          </div>
        </section>
      )}

      {/* Séries favoritas */}
      {favSeries.length > 0 && (
        <section>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Icon icon="mdi:heart" className="w-5 h-5 text-red-400" />
            Séries Favoritas
          </h2>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {favSeries.map(s => (
              <SerieCard key={s.id} serie={s} onClick={() => navigate(`/series/${s.id}`)} />
            ))}
          </div>
        </section>
      )}

      {/* Personagens favoritos */}
      {favChars.length > 0 && (
        <section>
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Icon icon="mdi:account-heart" className="w-5 h-5 text-red-400" />
            Personagens Favoritos
          </h2>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {favChars.map(c => (
              <CharacterCard key={c.id} character={c} serie={serieMap[c.serie_id]} onClick={() => setSelectedCharacter(c)} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {series.length === 0 && characters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-white/25">
          <Icon icon="mdi:television-off" className="w-16 h-16" />
          <p className="text-center text-sm">Nenhum conteúdo ainda.<br />Comece adicionando uma série!</p>
        </div>
      )}

      <CharacterDetailModal
        character={selectedCharacter}
        serie={selectedCharacter ? serieMap[selectedCharacter.serie_id] : undefined}
        onClose={() => setSelectedCharacter(null)}
      />
    </div>
  )
}

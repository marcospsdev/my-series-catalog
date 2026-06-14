import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useCollection } from '../hooks/useCollection'
import { useDb } from '../contexts/DataContext'
import SerieCard from '../modules/series/SerieCard'
import SerieForm from '../modules/series/SerieForm'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import type { Character, Serie, WatchStatus } from '../types'

const STATUS_FILTERS: { value: WatchStatus | ''; label: string; icon: string }[] = [
  { value: '', label: 'Todos', icon: 'mdi:view-grid' },
  { value: 'unwatched', label: 'Não assistido', icon: 'mdi:eye-off-outline' },
  { value: 'watching', label: 'Assistindo', icon: 'mdi:play-circle-outline' },
  { value: 'completed', label: 'Assistido', icon: 'mdi:check-circle-outline' },
]

const STATUS_ACTIVE: Record<string, string> = {
  '': 'bg-violet-600/30 border-violet-500/60 text-violet-200',
  unwatched: 'bg-zinc-500/30 border-zinc-500/60 text-zinc-300',
  watching: 'bg-blue-500/30 border-blue-500/60 text-blue-200',
  completed: 'bg-emerald-500/30 border-emerald-500/60 text-emerald-200',
}

export default function SeriesPage() {
  const navigate = useNavigate()
  const db = useDb()
  const { data: series, loading, refetch } = useCollection<Serie>('series', 'title', true)
  const { data: characters } = useCollection<Character>('characters')

  const [search, setSearch] = useState('')
  const [onlyFav, setOnlyFav] = useState(false)
  const [statusFilter, setStatusFilter] = useState<WatchStatus | ''>('')
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Serie | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Serie | null>(null)
  const [deleting, setDeleting] = useState(false)

  const countMap = useMemo(() => {
    const map: Record<string, number> = {}
    characters.forEach((c) => { map[c.serie_id] = (map[c.serie_id] ?? 0) + 1 })
    return map
  }, [characters])

  const filtered = useMemo(
    () =>
      series.filter((s) => {
        if (onlyFav && !s.favorite) return false
        if (statusFilter && s.watch_status !== statusFilter) return false
        if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false
        return true
      }),
    [series, search, onlyFav, statusFilter],
  )

  function handleSuccess() {
    setFormOpen(false)
    setEditTarget(null)
    refetch()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const charIds = characters.filter(c => c.serie_id === deleteTarget.id).map(c => c.id)
      await db.deleteSerieCascade(deleteTarget.id, charIds)
      setDeleteTarget(null)
      refetch()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Séries & Animes</h1>
            <p className="text-white/40 text-sm mt-0.5">{filtered.length} títulos</p>
          </div>
          <button
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Icon icon="mdi:plus" className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Série</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>

        {/* Filtros — scroll horizontal no mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* Busca */}
          <div className="relative flex-shrink-0">
            <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar série..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-sm rounded-lg pl-9 pr-4 py-2 w-44 sm:w-52 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-white/30"
            />
          </div>

          {/* Status */}
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm border transition-colors cursor-pointer flex-shrink-0 ${
                statusFilter === f.value
                  ? STATUS_ACTIVE[f.value]
                  : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              }`}
            >
              <Icon icon={f.icon} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{f.label}</span>
            </button>
          ))}

          {/* Favoritos */}
          <button
            onClick={() => setOnlyFav((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm border transition-colors cursor-pointer flex-shrink-0 ${
              onlyFav ? 'bg-red-500/20 border-red-500/40 text-red-300' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            <Icon icon={onlyFav ? 'mdi:heart' : 'mdi:heart-outline'} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Favoritos</span>
          </button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Icon icon="mdi:loading" className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-white/30">
            <Icon icon="mdi:television-off" className="w-14 h-14" />
            <p>Nenhuma série encontrada.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5">
            {filtered.map((serie) => (
              <SerieCard
                key={serie.id}
                serie={serie}
                characterCount={countMap[serie.id]}
                onClick={() => navigate(`/series/${serie.id}`)}
                onEdit={() => setEditTarget(serie)}
                onDelete={() => setDeleteTarget(serie)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={formOpen} title="Nova Série / Anime" onClose={() => setFormOpen(false)} maxWidth="max-w-lg">
        <SerieForm onSuccess={handleSuccess} onCancel={() => setFormOpen(false)} />
      </Modal>

      <Modal open={!!editTarget} title="Editar Série" onClose={() => setEditTarget(null)} maxWidth="max-w-lg">
        {editTarget && (
          <SerieForm initial={editTarget} onSuccess={handleSuccess} onCancel={() => setEditTarget(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Excluir "${deleteTarget?.title}"?`}
        description="Todos os personagens e grupos dessa série também serão excluídos."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useCollection } from '../hooks/useCollection'
import { useDb } from '../contexts/DataContext'
import GroupForm from '../modules/groups/GroupForm'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Badge from '../components/ui/Badge'
import CustomSelect from '../components/ui/CustomSelect'
import type { Alignment, Group, Serie } from '../types'

const PLACEHOLDER = 'https://placehold.co/300x200/1a1a2e/7c3aed?text=?'

const alignmentOptions = [
  { value: 'hero', label: 'Herói' },
  { value: 'villain', label: 'Vilão' },
  { value: 'neutral', label: 'Neutro' },
]

export default function GroupsPage() {
  const navigate = useNavigate()
  const db = useDb()
  const { data: groups, loading, refetch } = useCollection<Group>('groups', 'name', true)
  const { data: series } = useCollection<Serie>('series', 'title', true)

  const [serieId, setSerieId] = useState('')
  const [alignment, setAlignment] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Group | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null)
  const [deleting, setDeleting] = useState(false)

  const serieMap = useMemo(() => Object.fromEntries(series.map((s) => [s.id, s])), [series])
  const serieOptions = useMemo(() => series.map((s) => ({ value: s.id, label: s.title })), [series])

  const filtered = useMemo(
    () => groups.filter((g) => {
      if (serieId && g.serie_id !== serieId) return false
      if (alignment && g.alignment !== alignment) return false
      return true
    }),
    [groups, serieId, alignment],
  )

  function handleSuccess() {
    setModalOpen(false)
    setEditTarget(null)
    refetch()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await db.deleteGroupCascade(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Grupos & Facções</h1>
            <p className="text-white/40 text-sm mt-0.5">{filtered.length} grupos</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Icon icon="mdi:plus" className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Grupo</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <CustomSelect
            value={serieId}
            onChange={setSerieId}
            options={serieOptions}
            placeholder="Todas as séries"
            className="w-44 flex-shrink-0"
          />
          <CustomSelect
            value={alignment}
            onChange={setAlignment}
            options={alignmentOptions}
            placeholder="Alinhamento"
            className="w-36 flex-shrink-0"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Icon icon="mdi:loading" className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-white/30">
            <Icon icon="mdi:shield-off-outline" className="w-12 h-12" />
            <p>Nenhum grupo encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((g) => (
              <div
                key={g.id}
                onClick={() => navigate(`/groups/${g.id}`)}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all hover:-translate-y-0.5 cursor-pointer relative"
              >
                <div className="h-32 sm:h-36 relative overflow-hidden">
                  <img src={g.image_url ?? PLACEHOLDER} alt={g.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-2.5 left-3">
                    <Badge label={g.alignment} variant={g.alignment as Alignment} />
                  </div>

                  <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditTarget(g) }}
                      className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-violet-600/80 transition-colors cursor-pointer"
                    >
                      <Icon icon="mdi:pencil" className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(g) }}
                      className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-red-600/80 transition-colors cursor-pointer"
                    >
                      <Icon icon="mdi:trash-can-outline" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3">
                  <p className="text-white font-semibold text-sm">{g.name}</p>
                  {serieMap[g.serie_id] && (
                    <p className="text-violet-400 text-xs mt-0.5 flex items-center gap-1">
                      <Icon icon="mdi:television-play" className="w-3 h-3" />
                      {serieMap[g.serie_id].title}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} title="Novo Grupo / Facção" onClose={() => setModalOpen(false)} maxWidth="max-w-xl">
        <GroupForm series={series} onSuccess={handleSuccess} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal open={!!editTarget} title="Editar Grupo" onClose={() => setEditTarget(null)} maxWidth="max-w-xl">
        {editTarget && (
          <GroupForm series={series} initial={editTarget} onSuccess={handleSuccess} onCancel={() => setEditTarget(null)} />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Excluir "${deleteTarget?.name}"?`}
        description="O grupo será removido e seus membros desvinculados."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

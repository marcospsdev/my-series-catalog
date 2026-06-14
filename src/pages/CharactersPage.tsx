import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { useCollection } from '../hooks/useCollection'
import { useDb } from '../contexts/DataContext'
import CharacterCard from '../modules/characters/CharacterCard'
import CharacterFilters, { EMPTY_FILTERS, type CharacterFilterState } from '../modules/characters/CharacterFilters'
import CharacterForm from '../modules/characters/CharacterForm'
import CharacterDetailModal from '../modules/characters/CharacterDetailModal'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import type { Character, Group, Serie } from '../types'

export default function CharactersPage() {
  const db = useDb()
  const { data: characters, loading, refetch } = useCollection<Character>('characters')
  const { data: series } = useCollection<Serie>('series', 'title', true)
  const { data: groups } = useCollection<Group>('groups', 'name', true)

  const [modalOpen, setModalOpen]           = useState(false)
  const [editTarget, setEditTarget]         = useState<Character | null>(null)
  const [deleteTarget, setDeleteTarget]     = useState<Character | null>(null)
  const [deleting, setDeleting]             = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)

  const [filters, setFilters] = useState<CharacterFilterState>(EMPTY_FILTERS)
  const [groupCharIds, setGroupCharIds] = useState<Set<string> | null>(null)

  // When groupId filter changes, fetch the character IDs for that group
  useEffect(() => {
    if (!filters.groupId) {
      setGroupCharIds(null)
      return
    }
    let cancelled = false
    db.getGroupCharacters(filters.groupId).then(chars => {
      if (!cancelled) setGroupCharIds(new Set(chars.map(c => c.id)))
    })
    return () => { cancelled = true }
  }, [filters.groupId, db])

  const serieMap = useMemo(() => Object.fromEntries(series.map((s) => [s.id, s])), [series])

  const filtered = useMemo(() => {
    return characters.filter((c) => {
      if (filters.search && !c.name.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.serieId && c.serie_id !== filters.serieId) return false
      if (filters.groupId && groupCharIds && !groupCharIds.has(c.id)) return false
      if (filters.alignment && c.alignment !== filters.alignment) return false
      if (filters.status && c.status !== filters.status) return false
      if (filters.favorite === 'true' && !c.favorite) return false
      return true
    })
  }, [characters, filters, groupCharIds])

  function handleSuccess() {
    setModalOpen(false)
    setEditTarget(null)
    refetch()
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await db.deleteCharacterCascade(deleteTarget.id)
      setDeleteTarget(null)
      refetch()
    } finally {
      setDeleting(false)
    }
  }

  // If groupId filter is set but groupCharIds haven't loaded yet, show spinner
  const filterLoading = !!filters.groupId && groupCharIds === null

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Personagens</h1>
            <p className="text-white/40 text-sm mt-0.5">{filtered.length} personagens</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            <Icon icon="mdi:plus" className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Personagem</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>

        <div className="overflow-x-auto pb-1 scrollbar-none">
          <CharacterFilters filters={filters} series={series} groups={groups} onChange={setFilters} />
        </div>

        {loading || filterLoading ? (
          <div className="flex items-center justify-center h-64">
            <Icon icon="mdi:loading" className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-white/30">
            <Icon icon="mdi:emoticon-sad-outline" className="w-12 h-12" />
            <p>Nenhum personagem encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filtered.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                serie={serieMap[character.serie_id]}
                onClick={() => setSelectedCharacter(character)}
                onEdit={() => setEditTarget(character)}
                onDelete={() => setDeleteTarget(character)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} title="Novo Personagem" onClose={() => setModalOpen(false)}>
        <CharacterForm series={series} onSuccess={handleSuccess} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal open={!!editTarget} title="Editar Personagem" onClose={() => setEditTarget(null)}>
        {editTarget && (
          <CharacterForm
            series={series}
            initial={editTarget}
            onSuccess={handleSuccess}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>

      <CharacterDetailModal
        character={selectedCharacter}
        serie={selectedCharacter ? serieMap[selectedCharacter.serie_id] : undefined}
        onClose={() => setSelectedCharacter(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Excluir "${deleteTarget?.name}"?`}
        description="O personagem será removido permanentemente."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

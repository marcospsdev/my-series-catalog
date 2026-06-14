import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { supabase } from '../lib/supabase'
import { guestDb } from '../lib/guestDb'
import { useAuth } from '../contexts/AuthContext'
import { useDb } from '../contexts/DataContext'
import CharacterCard from '../modules/characters/CharacterCard'
import CharacterDetailModal from '../modules/characters/CharacterDetailModal'
import GroupForm from '../modules/groups/GroupForm'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Badge from '../components/ui/Badge'
import type { Alignment, Character, Group, Serie } from '../types'

const PLACEHOLDER = 'https://placehold.co/800x300/1a1a2e/7c3aed?text=?'

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isGuest } = useAuth()
  const db = useDb()

  const [group, setGroup] = useState<Group | null>(null)
  const [serie, setSerie] = useState<Serie | null>(null)
  const [series, setSeries] = useState<Serie[]>([])
  const [characters, setCharacters] = useState<Character[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)

    if (isGuest) {
      const grp = guestDb.findById<Group>('groups', id)
      setGroup(grp)
      setSeries(guestDb.getAll<Serie>('series', 'title', true))
      if (grp) {
        db.getGroupCharacters(id).then(setCharacters)
        if (grp.serie_id) setSerie(guestDb.findById<Serie>('series', grp.serie_id))
      }
      setLoading(false)
    } else {
      Promise.all([
        supabase.from('groups').select('*').eq('id', id).single(),
        supabase.from('series').select('*').order('title', { ascending: true }),
      ]).then(([{ data: g }, { data: sr }]) => {
        const grp = g as Group
        setGroup(grp)
        setSeries((sr as Serie[]) ?? [])
        if (grp?.serie_id) {
          supabase.from('series').select('*').eq('id', grp.serie_id).single()
            .then(({ data: s }) => setSerie(s as Serie))
        }
        db.getGroupCharacters(id).then(setCharacters)
        setLoading(false)
      })
    }
  }, [id, isGuest, db])

  async function handleDelete() {
    if (!group) return
    setDeleting(true)
    await db.deleteGroupCascade(group.id)
    navigate('/groups')
  }

  function refetchGroup() {
    if (!id) return
    if (isGuest) {
      setGroup(guestDb.findById<Group>('groups', id))
    } else {
      supabase.from('groups').select('*').eq('id', id).single()
        .then(({ data }) => { if (data) setGroup(data as Group) })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-10 h-10 text-violet-500 animate-spin" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center gap-4 text-white/30">
        <Icon icon="mdi:shield-off-outline" className="w-16 h-16" />
        <p>Grupo não encontrado.</p>
        <button onClick={() => navigate('/groups')} className="text-violet-400 text-sm hover:underline cursor-pointer">
          Voltar para grupos
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      {/* Hero */}
      <div className="relative h-44 sm:h-56 overflow-hidden">
        <img
          src={group.image_url ?? PLACEHOLDER}
          alt={group.name}
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.4)', transform: 'scale(1.05)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-black/20 to-transparent" />

        <button
          onClick={() => navigate('/groups')}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm cursor-pointer bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg"
        >
          <Icon icon="mdi:arrow-left" className="w-4 h-4" />
          <span className="hidden sm:inline">Grupos</span>
        </button>

        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => setEditOpen(true)} className="w-9 h-9 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-violet-600/70 transition-colors cursor-pointer" title="Editar">
            <Icon icon="mdi:pencil" className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteOpen(true)} className="w-9 h-9 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-red-600/70 transition-colors cursor-pointer" title="Excluir">
            <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-5 flex items-end gap-4">
          {group.image_url && (
            <img src={group.image_url} alt={group.name} className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-xl border-2 border-white/20 shadow-xl flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{group.name}</h1>
              <Badge label={group.alignment} variant={group.alignment as Alignment} />
            </div>
            {serie && (
              <p className="text-violet-400 text-sm mt-1 flex items-center gap-1.5">
                <Icon icon="mdi:television-play" className="w-3.5 h-3.5" />
                {serie.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <p className="text-white/40 text-xs uppercase tracking-wider mb-4 flex items-center gap-1.5">
          <Icon icon="mdi:account-group" className="w-4 h-4" />
          {characters.length} membros
        </p>

        {characters.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-white/25">
            <Icon icon="mdi:account-off-outline" className="w-14 h-14" />
            <p>Nenhum membro neste grupo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6">
            {characters.map(c => (
              <CharacterCard key={c.id} character={c} onClick={() => setSelectedCharacter(c)} />
            ))}
          </div>
        )}
      </div>

      <Modal open={editOpen} title="Editar Grupo" onClose={() => setEditOpen(false)} maxWidth="max-w-xl">
        <GroupForm
          series={series}
          initial={group}
          onSuccess={() => { setEditOpen(false); refetchGroup() }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title={`Excluir "${group.name}"?`}
        description="Os membros serão desvinculados. Esta ação não pode ser desfeita."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <CharacterDetailModal character={selectedCharacter} onClose={() => setSelectedCharacter(null)} />
    </div>
  )
}

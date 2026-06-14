import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { supabase } from '../lib/supabase'
import { guestDb } from '../lib/guestDb'
import { useAuth } from '../contexts/AuthContext'
import { useDb } from '../contexts/DataContext'
import CharacterCard from '../modules/characters/CharacterCard'
import CharacterDetailModal from '../modules/characters/CharacterDetailModal'
import SerieForm from '../modules/series/SerieForm'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import FavoriteButton from '../components/ui/FavoriteButton'
import Badge from '../components/ui/Badge'
import { WATCH_STATUS_CONFIG } from '../components/ui/WatchStatusBadge'
import type { Alignment, Character, Group, Serie, WatchStatus } from '../types'

const PLACEHOLDER_SERIE   = 'https://placehold.co/300x420/1a1a2e/7c3aed?text=?'
const PLACEHOLDER_GROUP   = 'https://placehold.co/200x120/1a1a2e/7c3aed?text=?'

export default function SerieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isGuest } = useAuth()
  const db = useDb()

  const [serie, setSerie]           = useState<Serie | null>(null)
  const [characters, setCharacters] = useState<Character[]>([])
  const [groups, setGroups]         = useState<Group[]>([])
  const [loading, setLoading]       = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [editOpen, setEditOpen]     = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting]     = useState(false)

  // Group filter
  const [activeGroup, setActiveGroup]       = useState<Group | null>(null)
  const [groupCharIds, setGroupCharIds]     = useState<Set<string> | null>(null)
  const [loadingFilter, setLoadingFilter]   = useState(false)

  const displayedCharacters = groupCharIds
    ? characters.filter(c => groupCharIds.has(c.id))
    : characters

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setActiveGroup(null)
    setGroupCharIds(null)

    if (isGuest) {
      setSerie(guestDb.findById<Serie>('series', id))
      setCharacters(guestDb.getWhere<Character>('characters', 'serie_id', id))
      setGroups(guestDb.getWhere<Group>('groups', 'serie_id', id).sort((a, b) => a.name.localeCompare(b.name)))
      setLoading(false)
    } else {
      Promise.all([
        supabase.from('series').select('*').eq('id', id).single(),
        supabase.from('characters').select('*').eq('serie_id', id).order('name', { ascending: true }),
        supabase.from('groups').select('*').eq('serie_id', id).order('name', { ascending: true }),
      ]).then(([{ data: s }, { data: c }, { data: g }]) => {
        setSerie(s as Serie)
        setCharacters((c as Character[]) ?? [])
        setGroups((g as Group[]) ?? [])
        setLoading(false)
      })
    }
  }, [id, isGuest])

  async function handleGroupClick(group: Group) {
    if (activeGroup?.id === group.id) {
      setActiveGroup(null)
      setGroupCharIds(null)
      return
    }
    setLoadingFilter(true)
    setActiveGroup(group)
    const chars = await db.getGroupCharacters(group.id)
    setGroupCharIds(new Set(chars.map(c => c.id)))
    setLoadingFilter(false)
  }

  async function handleStatusChange(newStatus: WatchStatus) {
    if (!serie || updatingStatus) return
    setUpdatingStatus(true)
    setSerie(prev => prev ? { ...prev, watch_status: newStatus } : prev)
    await db.updateWatchStatus(serie.id, newStatus)
    setUpdatingStatus(false)
  }

  async function handleDelete() {
    if (!serie) return
    setDeleting(true)
    await db.deleteSerieCascade(serie.id, characters.map(c => c.id))
    navigate('/series')
  }

  function refetchSerie() {
    if (!id) return
    if (isGuest) {
      setSerie(guestDb.findById<Serie>('series', id))
    } else {
      supabase.from('series').select('*').eq('id', id).single()
        .then(({ data }) => { if (data) setSerie(data as Serie) })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-10 h-10 text-violet-500 animate-spin" />
      </div>
    )
  }

  if (!serie) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center gap-4 text-white/30">
        <Icon icon="mdi:television-off" className="w-16 h-16" />
        <p>Série não encontrada.</p>
        <button onClick={() => navigate('/series')} className="text-violet-400 text-sm hover:underline cursor-pointer">
          Voltar para séries
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white">
      {/* Hero */}
      <div className="relative h-52 sm:h-72 overflow-hidden">
        <img
          src={serie.cover_url ?? PLACEHOLDER_SERIE}
          alt={serie.title}
          className="w-full h-full object-cover object-center"
          style={{ filter: 'blur(3px) brightness(0.4)', transform: 'scale(1.08)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d1a] via-black/20 to-transparent" />

        <button
          onClick={() => navigate('/series')}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm cursor-pointer bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-lg"
        >
          <Icon icon="mdi:arrow-left" className="w-4 h-4" />
          <span className="hidden sm:inline">Séries</span>
        </button>

        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => setEditOpen(true)} className="w-9 h-9 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-violet-600/70 transition-colors cursor-pointer" title="Editar">
            <Icon icon="mdi:pencil" className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteOpen(true)} className="w-9 h-9 rounded-lg bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-red-600/70 transition-colors cursor-pointer" title="Excluir">
            <Icon icon="mdi:trash-can-outline" className="w-4 h-4" />
          </button>
          <FavoriteButton table="series" id={serie.id} favorite={serie.favorite} />
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-5 flex items-end gap-4">
          <img src={serie.cover_url ?? PLACEHOLDER_SERIE} alt={serie.title} className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-xl border-2 border-white/20 shadow-2xl flex-shrink-0" />
          <div className="flex-1 min-w-0 pb-1">
            <h1 className="text-xl sm:text-3xl font-bold text-white truncate">{serie.title}</h1>
            <div className="flex items-center gap-3 flex-wrap mt-1.5">
              {serie.rating != null && (
                <span className="flex items-center gap-1 text-yellow-300 text-sm font-semibold">
                  <Icon icon="mdi:star" className="w-4 h-4" />
                  {serie.rating % 1 === 0 ? serie.rating.toFixed(0) : serie.rating.toFixed(1)}
                  <span className="text-white/30 font-normal text-xs">/10</span>
                </span>
              )}
              {serie.seasons != null && (
                <span className="text-white/50 text-xs flex items-center gap-1">
                  <Icon icon="mdi:television-play" className="w-3.5 h-3.5" />
                  {serie.seasons} temp.
                </span>
              )}
              {serie.total_episodes != null && (
                <span className="text-white/50 text-xs flex items-center gap-1">
                  <Icon icon="mdi:format-list-numbered" className="w-3.5 h-3.5" />
                  {serie.total_episodes} eps
                </span>
              )}
              <span className="text-white/50 text-xs flex items-center gap-1">
                <Icon icon="mdi:account-group" className="w-3.5 h-3.5" />
                {characters.length} personagens
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Watch status */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-4">
          <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Status de exibição</p>
          <div className="flex gap-2 flex-wrap">
            {(Object.entries(WATCH_STATUS_CONFIG) as [WatchStatus, (typeof WATCH_STATUS_CONFIG)[WatchStatus]][]).map(([val, cfg]) => (
              <button
                key={val}
                type="button"
                onClick={() => handleStatusChange(val)}
                disabled={updatingStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm border transition-all cursor-pointer disabled:opacity-60 ${
                  serie.watch_status === val
                    ? cfg.cls
                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70'
                }`}
              >
                <Icon icon={cfg.icon} className="w-4 h-4" />
                {cfg.label}
                {serie.watch_status === val && updatingStatus && (
                  <Icon icon="mdi:loading" className="w-3.5 h-3.5 animate-spin" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        {serie.description && (
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Sinopse</p>
            <p className="text-white/70 text-sm leading-relaxed">{serie.description}</p>
          </div>
        )}

        {/* Episodes per season */}
        {serie.episodes_per_season && serie.episodes_per_season.length > 0 && (
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3">Episódios por temporada</p>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {serie.episodes_per_season.map((eps, i) => (
                <div key={i} className="bg-white/5 border border-white/8 rounded-xl p-3 text-center">
                  <p className="text-white/35 text-xs mb-1">Temp. {i + 1}</p>
                  <p className="text-white font-semibold text-sm">{eps}</p>
                  <p className="text-white/30 text-xs">eps</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Grupos ── */}
        {groups.length > 0 && (
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Icon icon="mdi:shield-sword" className="w-4 h-4" />
              Grupos & Facções
            </p>
            <div className="overflow-x-auto pb-2 scrollbar-none -mx-1 px-1">
              <div className="flex gap-3 min-w-max">
                {groups.map(g => {
                  const active = activeGroup?.id === g.id
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleGroupClick(g)}
                      className={`flex-shrink-0 w-32 sm:w-36 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer text-left ${
                        active
                          ? 'border-violet-500 shadow-lg shadow-violet-500/20 scale-[1.02]'
                          : 'border-white/10 hover:border-white/25 hover:scale-[1.01]'
                      }`}
                    >
                      {/* Image */}
                      <div className="relative h-20 sm:h-24 overflow-hidden">
                        <img
                          src={g.image_url ?? PLACEHOLDER_GROUP}
                          alt={g.name}
                          className="w-full h-full object-cover"
                          style={{ filter: active ? 'brightness(1)' : 'brightness(0.75)' }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {active && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                            <Icon icon="mdi:check" className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className={`px-2.5 py-2 transition-colors ${active ? 'bg-violet-600/15' : 'bg-white/5'}`}>
                        <p className="text-white text-xs font-semibold truncate">{g.name}</p>
                        <div className="mt-0.5">
                          <Badge label={g.alignment} variant={g.alignment as Alignment} />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Personagens ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/40 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Icon icon="mdi:account-multiple" className="w-4 h-4" />
              {activeGroup
                ? <><span className="text-violet-300">{activeGroup.name}</span> — {displayedCharacters.length} personagens</>
                : <>Personagens — {characters.length}</>
              }
            </p>
            {activeGroup && (
              <button
                type="button"
                onClick={() => { setActiveGroup(null); setGroupCharIds(null) }}
                className="text-white/40 hover:text-white/70 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Icon icon="mdi:close" className="w-3.5 h-3.5" />
                Limpar filtro
              </button>
            )}
          </div>

          {loadingFilter ? (
            <div className="flex items-center justify-center py-16">
              <Icon icon="mdi:loading" className="w-8 h-8 text-violet-500 animate-spin" />
            </div>
          ) : displayedCharacters.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-white/25">
              <Icon icon="mdi:account-off-outline" className="w-14 h-14" />
              <p>{activeGroup ? 'Nenhum personagem neste grupo.' : 'Nenhum personagem cadastrado.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6">
              {displayedCharacters.map(c => (
                <CharacterCard key={c.id} character={c} serie={serie} onClick={() => setSelectedCharacter(c)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={editOpen} title="Editar Série" onClose={() => setEditOpen(false)} maxWidth="max-w-lg">
        <SerieForm
          initial={serie}
          onSuccess={() => { setEditOpen(false); refetchSerie() }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        title={`Excluir "${serie.title}"?`}
        description="Todos os personagens e grupos serão excluídos. Esta ação não pode ser desfeita."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <CharacterDetailModal character={selectedCharacter} serie={serie} onClose={() => setSelectedCharacter(null)} />
    </div>
  )
}

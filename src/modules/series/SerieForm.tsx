import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useDb } from '../../contexts/DataContext'
import ImageInput from '../../components/ui/ImageInput'
import NumberInput from '../../components/ui/NumberInput'
import type { Serie, WatchStatus } from '../../types'

interface SerieFormProps {
  onSuccess: () => void
  onCancel: () => void
  initial?: Partial<Serie>
}

const WATCH_OPTIONS: { value: WatchStatus; label: string; icon: string; active: string }[] = [
  { value: 'unwatched', label: 'Não assistido', icon: 'mdi:eye-off-outline',     active: 'bg-zinc-500/30 border-zinc-500/60 text-zinc-300' },
  { value: 'watching',  label: 'Assistindo',    icon: 'mdi:play-circle-outline',  active: 'bg-blue-500/30 border-blue-500/60 text-blue-200' },
  { value: 'completed', label: 'Assistido',     icon: 'mdi:check-circle-outline', active: 'bg-emerald-500/30 border-emerald-500/60 text-emerald-200' },
]

function initEpisodes(initial?: Partial<Serie>): (number | '')[] {
  if (initial?.episodes_per_season?.length) return initial.episodes_per_season
  if (initial?.seasons && initial.seasons > 0) return Array(initial.seasons).fill('')
  return []
}

export default function SerieForm({ onSuccess, onCancel, initial }: SerieFormProps) {
  const db = useDb()
  const [title, setTitle]             = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [coverUrl, setCoverUrl]       = useState(initial?.cover_url ?? '')
  const [watchStatus, setWatchStatus] = useState<WatchStatus>(initial?.watch_status ?? 'unwatched')
  const [seasons, setSeasons]         = useState<number | ''>(initial?.seasons ?? '')
  const [episodesPerSeason, setEpsPerSeason] = useState<(number | '')[]>(initEpisodes(initial))
  const [rating, setRating]           = useState<number | ''>(initial?.rating ?? '')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const totalEps = episodesPerSeason.reduce<number>((acc, e) => acc + (e === '' ? 0 : e), 0)
  const LABEL = 'block text-white/60 text-xs font-medium mb-1.5'

  function handleSeasonsChange(v: number | '') {
    setSeasons(v)
    if (v === '' || v <= 0) { setEpsPerSeason([]); return }
    const n = Math.min(Math.floor(typeof v === 'number' ? v : 0), 50)
    setEpsPerSeason(prev => n > prev.length
      ? [...prev, ...Array(n - prev.length).fill('')]
      : prev.slice(0, n)
    )
  }

  function handleEpsChange(i: number, v: number | '') {
    setEpsPerSeason(prev => { const next = [...prev]; next[i] = v; return next })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError('Título é obrigatório.'); return }
    setSaving(true)
    setError(null)
    try {
      const epsArray = episodesPerSeason.map(e => e === '' ? 0 : Number(e))
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        cover_url: coverUrl || null,
        watch_status: watchStatus,
        seasons: seasons === '' ? null : Number(seasons),
        episodes_per_season: epsArray.length ? epsArray : null,
        total_episodes: totalEps > 0 ? totalEps : null,
        rating: rating === '' ? null : Number(rating),
        favorite: initial?.favorite ?? false,
      }
      if (initial?.id) {
        await db.updateSerie(initial.id, payload)
      } else {
        await db.insertSerie(payload)
      }
      onSuccess()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const INPUT = 'w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-white/30'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className={LABEL}>Título *</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className={INPUT} placeholder="Ex: One Piece, Attack on Titan..." required />
      </div>

      <div>
        <label className={LABEL}>Status de exibição</label>
        <div className="flex gap-2 flex-wrap">
          {WATCH_OPTIONS.map(opt => (
            <button key={opt.value} type="button" onClick={() => setWatchStatus(opt.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all cursor-pointer ${
                watchStatus === opt.value ? opt.active : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
              }`}
            >
              <Icon icon={opt.icon} className="w-4 h-4" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={LABEL}>
          <span className="flex items-center gap-1">
            <Icon icon="mdi:star" className="w-3.5 h-3.5 text-yellow-400" />
            Avaliação (0–10)
          </span>
        </label>
        <NumberInput value={rating} onChange={setRating} min={0} max={10} step={0.5} placeholder="8.5" className="w-40" />
      </div>

      <div className="space-y-3">
        <div>
          <label className={LABEL}>
            <span className="flex items-center gap-1">
              <Icon icon="mdi:television-play" className="w-3.5 h-3.5 text-violet-400" />
              Número de temporadas
            </span>
          </label>
          <NumberInput value={seasons} onChange={handleSeasonsChange} min={1} max={50} placeholder="1" className="w-40" />
        </div>

        {episodesPerSeason.length > 0 && (
          <div className="bg-white/3 border border-white/8 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-white/50 text-xs font-medium uppercase tracking-wider">Episódios por temporada</p>
              {totalEps > 0 && <span className="text-violet-400 text-xs font-medium">{totalEps} no total</span>}
            </div>
            <div className="space-y-2">
              {episodesPerSeason.map((eps, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-white/40 text-sm flex-shrink-0 w-24">Temporada {i + 1}</span>
                  <NumberInput value={eps} onChange={v => handleEpsChange(i, v)} min={0} placeholder="0" className="w-36" />
                  <span className="text-white/25 text-xs">eps</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className={LABEL}>Descrição / Sinopse</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${INPUT} min-h-24 resize-y`} placeholder="Sinopse ou descrição da série..." />
      </div>

      <div>
        <label className={LABEL}>Imagem de Capa</label>
        <ImageInput bucket="covers" value={coverUrl} onChange={setCoverUrl} aspect="portrait" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg text-sm text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer">
          {saving && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
          {saving ? 'Salvando...' : 'Salvar Série'}
        </button>
      </div>
    </form>
  )
}

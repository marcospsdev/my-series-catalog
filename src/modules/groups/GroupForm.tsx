import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useDb } from '../../contexts/DataContext'
import ImageInput from '../../components/ui/ImageInput'
import CustomSelect from '../../components/ui/CustomSelect'
import type { Alignment, Group, Serie } from '../../types'

interface GroupFormProps {
  series: Serie[]
  onSuccess: () => void
  onCancel: () => void
  initial?: Partial<Group>
}

const alignmentOptions = [
  { value: 'hero',    label: 'Herói' },
  { value: 'villain', label: 'Vilão' },
  { value: 'neutral', label: 'Neutro' },
]

export default function GroupForm({ series, onSuccess, onCancel, initial }: GroupFormProps) {
  const db = useDb()
  const [serieId, setSerieId]     = useState(initial?.serie_id ?? '')
  const [name, setName]           = useState(initial?.name ?? '')
  const [alignment, setAlignment] = useState<Alignment>(initial?.alignment ?? 'neutral')
  const [imageUrl, setImageUrl]   = useState(initial?.image_url ?? '')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const INPUT = 'w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-white/30'
  const LABEL = 'block text-white/60 text-xs font-medium mb-1'
  const serieOptions = series.map(s => ({ value: s.id, label: s.title }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !serieId) { setError('Nome e série são obrigatórios.'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = { serie_id: serieId, name: name.trim(), alignment, image_url: imageUrl || null }
      if (initial?.id) {
        await db.updateGroup(initial.id, payload)
      } else {
        await db.insertGroup(payload)
      }
      onSuccess()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Série / Anime *</label>
          <CustomSelect value={serieId} onChange={setSerieId} options={serieOptions} placeholder="Selecione uma série..." required />
        </div>
        <div>
          <label className={LABEL}>Nome do Grupo *</label>
          <input value={name} onChange={e => setName(e.target.value)} className={INPUT} placeholder="Ex: Chapéu de Palha, Akatsuki..." required />
        </div>
        <div>
          <label className={LABEL}>Alinhamento</label>
          <CustomSelect value={alignment} onChange={v => setAlignment(v as Alignment)} options={alignmentOptions} required />
        </div>
      </div>

      <div>
        <label className={LABEL}>Imagem do Grupo</label>
        <ImageInput bucket="groups" value={imageUrl} onChange={setImageUrl} aspect="landscape" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg text-sm text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer">
          {saving && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
          {saving ? 'Salvando...' : 'Salvar Grupo'}
        </button>
      </div>
    </form>
  )
}

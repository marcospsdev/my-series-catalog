import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import { useDb } from '../../contexts/DataContext'
import ImageInput from '../../components/ui/ImageInput'
import CustomSelect from '../../components/ui/CustomSelect'
import type { Character, Group, Serie } from '../../types'

interface CharacterFormProps {
  series: Serie[]
  onSuccess: () => void
  onCancel: () => void
  initial?: Partial<Character>
}

const EMPTY: Omit<Character, 'id' | 'created_at'> = {
  serie_id: '', name: '', age: null, gender: '', description: '', images: [],
  alignment: 'neutral', status: 'alive', first_appearance: '', nickname: '', role: '', favorite: false,
}

export default function CharacterForm({ series, onSuccess, onCancel, initial }: CharacterFormProps) {
  const db = useDb()
  const [form, setForm] = useState({ ...EMPTY, ...initial })
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!form.serie_id) { setGroups([]); return }
    db.getGroupsForSerie(form.serie_id).then(setGroups)
  }, [form.serie_id, db])

  useEffect(() => {
    if (!initial?.id) return
    db.getCharacterGroupIds(initial.id).then(setSelectedGroups)
  }, [initial?.id, db])

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.serie_id) { setError('Nome e série são obrigatórios.'); return }
    setSaving(true)
    setError(null)
    try {
      let charId = initial?.id
      if (charId) {
        await db.updateCharacter(charId, form)
      } else {
        const created = await db.insertCharacter(form)
        charId = created.id
      }
      await db.setCharacterGroups(charId!, selectedGroups)
      onSuccess()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const INPUT = 'w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-white/30'
  const LABEL = 'block text-white/60 text-xs font-medium mb-1'

  const serieOptions = series.map(s => ({ value: s.id, label: s.title }))
  const genderOptions = [
    { value: 'Masculino', label: 'Masculino' },
    { value: 'Feminino',  label: 'Feminino' },
    { value: 'Outro',     label: 'Outro' },
  ]
  const alignmentOptions = [
    { value: 'hero',    label: 'Herói' },
    { value: 'villain', label: 'Vilão' },
    { value: 'neutral', label: 'Neutro' },
  ]
  const statusOptions = [
    { value: 'alive',   label: 'Vivo' },
    { value: 'dead',    label: 'Morto' },
    { value: 'unknown', label: 'Desconhecido' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={LABEL}>Série / Anime *</label>
          <CustomSelect value={form.serie_id} onChange={v => set('serie_id', v)} options={serieOptions} placeholder="Selecione uma série..." required />
        </div>
        <div>
          <label className={LABEL}>Nome *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)} className={INPUT} required placeholder="Nome do personagem" />
        </div>
        <div>
          <label className={LABEL}>Alcunha / Apelido</label>
          <input value={form.nickname ?? ''} onChange={e => set('nickname', e.target.value)} className={INPUT} placeholder="Ex: O Rei dos Piratas" />
        </div>
        <div>
          <label className={LABEL}>Função / Classe</label>
          <input value={form.role ?? ''} onChange={e => set('role', e.target.value)} className={INPUT} placeholder="Ex: Capitão, Mago" />
        </div>
        <div>
          <label className={LABEL}>Idade</label>
          <input type="number" value={form.age ?? ''} onChange={e => set('age', e.target.value ? Number(e.target.value) : null)} className={INPUT} placeholder="Ex: 17" />
        </div>
        <div>
          <label className={LABEL}>Sexo</label>
          <CustomSelect value={form.gender ?? ''} onChange={v => set('gender', v)} options={genderOptions} placeholder="Selecione..." />
        </div>
        <div>
          <label className={LABEL}>Alinhamento</label>
          <CustomSelect value={form.alignment} onChange={v => set('alignment', v as typeof form.alignment)} options={alignmentOptions} required />
        </div>
        <div>
          <label className={LABEL}>Status Atual</label>
          <CustomSelect value={form.status} onChange={v => set('status', v as typeof form.status)} options={statusOptions} required />
        </div>
        <div>
          <label className={LABEL}>Primeira Aparição</label>
          <input value={form.first_appearance ?? ''} onChange={e => set('first_appearance', e.target.value)} className={INPUT} placeholder="Ex: Episódio 1, Cap. 1" />
        </div>
      </div>

      <div>
        <label className={LABEL}>Descrição</label>
        <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} className={`${INPUT} min-h-24 resize-y`} placeholder="Descrição do personagem..." />
      </div>

      {groups.length > 0 && (
        <div>
          <label className={LABEL}>Grupos / Facções</label>
          <div className="flex flex-wrap gap-2">
            {groups.map(g => {
              const active = selectedGroups.includes(g.id)
              return (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setSelectedGroups(prev => active ? prev.filter(id => id !== g.id) : [...prev, g.id])}
                  className={`px-3 py-1.5 rounded-lg text-sm border transition-colors cursor-pointer ${
                    active ? 'bg-violet-600/30 border-violet-500 text-violet-200' : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  {g.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div>
        <label className={LABEL}>Imagens do Personagem</label>
        <ImageInput bucket="characters" multiple value={form.images} onChange={urls => set('images', urls)} aspect="portrait" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg text-sm text-white/60 hover:text-white border border-white/10 hover:bg-white/5 transition-colors cursor-pointer">
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer">
          {saving && <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />}
          {saving ? 'Salvando...' : 'Salvar Personagem'}
        </button>
      </div>
    </form>
  )
}

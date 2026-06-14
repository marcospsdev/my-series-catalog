import { Icon } from '@iconify/react'
import CustomSelect from '../../components/ui/CustomSelect'
import type { Group, Serie } from '../../types'

export interface CharacterFilterState {
  search: string
  serieId: string
  groupId: string
  alignment: string
  status: string
  favorite: string
}

interface CharacterFiltersProps {
  filters: CharacterFilterState
  series: Serie[]
  groups: Group[]
  onChange: (f: CharacterFilterState) => void
}

export const EMPTY_FILTERS: CharacterFilterState = {
  search: '',
  serieId: '',
  groupId: '',
  alignment: '',
  status: '',
  favorite: '',
}

export default function CharacterFilters({ filters, series, groups, onChange }: CharacterFiltersProps) {
  function set(key: keyof CharacterFilterState, value: string) {
    onChange({ ...filters, [key]: value })
  }

  const serieOptions = series.map((s) => ({ value: s.id, label: s.title }))

  const groupOptions = filters.serieId
    ? groups.filter(g => g.serie_id === filters.serieId).map(g => ({ value: g.id, label: g.name }))
    : groups.map(g => ({ value: g.id, label: g.name }))

  const alignmentOptions = [
    { value: 'hero', label: 'Herói' },
    { value: 'villain', label: 'Vilão' },
    { value: 'neutral', label: 'Neutro' },
  ]
  const statusOptions = [
    { value: 'alive', label: 'Vivo' },
    { value: 'dead', label: 'Morto' },
    { value: 'unknown', label: 'Desconhecido' },
  ]
  const favoriteOptions = [{ value: 'true', label: 'Favoritos' }]

  const hasAny = Object.values(filters).some(Boolean)

  return (
    <div className="flex gap-2 items-center min-w-max">
      <div className="relative flex-shrink-0">
        <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar personagem..."
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          className="bg-white/5 border border-white/10 text-white text-sm rounded-lg pl-9 pr-4 py-2 w-44 sm:w-52 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-white/30"
        />
      </div>

      <CustomSelect
        value={filters.serieId}
        onChange={(v) => onChange({ ...filters, serieId: v, groupId: '' })}
        options={serieOptions}
        placeholder="Todas as séries"
        className="w-44 flex-shrink-0"
      />

      {groupOptions.length > 0 && (
        <CustomSelect
          value={filters.groupId}
          onChange={(v) => set('groupId', v)}
          options={groupOptions}
          placeholder="Todos os grupos"
          className="w-40 flex-shrink-0"
        />
      )}

      <CustomSelect
        value={filters.alignment}
        onChange={(v) => set('alignment', v)}
        options={alignmentOptions}
        placeholder="Alinhamento"
        className="w-36 flex-shrink-0"
      />

      <CustomSelect
        value={filters.status}
        onChange={(v) => set('status', v)}
        options={statusOptions}
        placeholder="Status"
        className="w-36 flex-shrink-0"
      />

      <CustomSelect
        value={filters.favorite}
        onChange={(v) => set('favorite', v)}
        options={favoriteOptions}
        placeholder="Todos"
        className="w-32 flex-shrink-0"
      />

      {hasAny && (
        <button
          type="button"
          onClick={() => onChange(EMPTY_FILTERS)}
          className="text-white/40 hover:text-white/70 text-xs flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
        >
          <Icon icon="mdi:close" className="w-4 h-4" />
          Limpar
        </button>
      )}
    </div>
  )
}

import { Icon } from '@iconify/react'
import FavoriteButton from '../../components/ui/FavoriteButton'
import WatchStatusBadge from '../../components/ui/WatchStatusBadge'
import type { Serie } from '../../types'

interface SerieCardProps {
  serie: Serie
  characterCount?: number
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const PLACEHOLDER = 'https://placehold.co/300x420/1a1a2e/7c3aed?text=?'

export default function SerieCard({ serie, characterCount, onClick, onEdit, onDelete }: SerieCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden cursor-pointer
                 hover:border-violet-500/50 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300
                 hover:-translate-y-1"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={serie.cover_url ?? PLACEHOLDER}
          alt={serie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

        {/* Edit / Delete — top left */}
        {(onEdit || onDelete) && (
          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit() }}
                className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-violet-600/80 transition-colors cursor-pointer"
                title="Editar"
              >
                <Icon icon="mdi:pencil" className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                className="w-7 h-7 rounded-lg bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-red-600/80 transition-colors cursor-pointer"
                title="Excluir"
              >
                <Icon icon="mdi:trash-can-outline" className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Favorite — top right */}
        <div className="absolute top-2 right-2">
          <FavoriteButton table="series" id={serie.id} favorite={serie.favorite} />
        </div>

        {/* Bottom info strip */}
        <div className="absolute bottom-0 left-0 right-0 px-2.5 py-2 flex items-center justify-between gap-1">
          <WatchStatusBadge status={serie.watch_status} compact />

          <div className="flex items-center gap-1.5">
            {serie.rating != null && (
              <span className="flex items-center gap-0.5 bg-black/60 backdrop-blur-sm text-yellow-300 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                <Icon icon="mdi:star" className="w-3 h-3" />
                {serie.rating % 1 === 0 ? serie.rating.toFixed(0) : serie.rating.toFixed(1)}
              </span>
            )}
            {characterCount !== undefined && characterCount > 0 && (
              <span className="flex items-center gap-0.5 bg-black/60 backdrop-blur-sm text-white/60 text-[10px] px-1.5 py-0.5 rounded-full">
                <Icon icon="mdi:account-group" className="w-3 h-3" />
                {characterCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-white font-semibold text-sm truncate">{serie.title}</h3>
        {serie.seasons != null && (
          <p className="text-white/35 text-xs mt-0.5">
            {serie.seasons} temp.{serie.total_episodes != null ? ` · ${serie.total_episodes} eps` : ''}
          </p>
        )}

      </div>
    </div>
  )
}

import { Icon } from '@iconify/react'
import TiltedCard from '../../components/cards/TiltedCard'
import FavoriteButton from '../../components/ui/FavoriteButton'
import type { Character, Serie } from '../../types'

interface CharacterCardProps {
  character: Character
  serie?: Serie
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const PLACEHOLDER = 'https://placehold.co/200x300/1a1a2e/7c3aed?text=?'

export default function CharacterCard({ character, serie, onClick, onEdit, onDelete }: CharacterCardProps) {
  const mainImage = character.images?.[0] ?? PLACEHOLDER

  return (
    <div className="flex flex-col items-center gap-3 cursor-pointer group" onClick={onClick}>
      <div className="relative">
        <TiltedCard
          imageSrc={mainImage}
          altText={character.name}
          captionText={character.nickname ?? character.name}
          containerWidth="180px"
          containerHeight="260px"
          imageWidth="180px"
          imageHeight="260px"
        />

        {/* Edit / Delete — top left, appear on hover */}
        {(onEdit || onDelete) && (
          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
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

        <div className="absolute top-2 right-2">
          <FavoriteButton table="characters" id={character.id} favorite={character.favorite} />
        </div>
      </div>

      <div className="text-center w-44">
        <p className="text-white font-semibold text-sm truncate">{character.name}</p>
        {character.nickname && (
          <p className="text-white/50 text-xs truncate">&ldquo;{character.nickname}&rdquo;</p>
        )}
        {serie && (
          <p className="text-violet-400 text-xs mt-0.5 flex items-center justify-center gap-1">
            <Icon icon="mdi:television-play" className="w-3 h-3" />
            {serie.title}
          </p>
        )}
      </div>
    </div>
  )
}

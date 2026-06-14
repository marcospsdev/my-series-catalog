import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { useDb } from '../../contexts/DataContext'
import Badge from '../../components/ui/Badge'
import TiltedCard from '../../components/cards/TiltedCard'
import FavoriteButton from '../../components/ui/FavoriteButton'
import Lightbox from '../../components/ui/Lightbox'
import type { Character, Group, Serie } from '../../types'

const PLACEHOLDER = 'https://placehold.co/400x600/1a1a2e/7c3aed?text=?'

interface Props {
  character: Character | null
  serie?: Serie
  onClose: () => void
}

export default function CharacterDetailModal({ character, serie, onClose }: Props) {
  const db = useDb()
  const [groups, setGroups] = useState<Group[]>([])
  const [activeImg, setActiveImg] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const lightboxOpenRef = useRef(false)
  lightboxOpenRef.current = lightboxOpen

  useEffect(() => {
    if (!character) return
    setGroups([])
    setActiveImg(0)
    setLightboxOpen(false)

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !lightboxOpenRef.current) onClose()
    }
    document.addEventListener('keydown', handleKey)

    db.getCharacterGroups(character.id).then(setGroups)

    return () => document.removeEventListener('keydown', handleKey)
  }, [character, onClose, db])

  if (!character) return null

  const images = character.images?.length ? character.images : [PLACEHOLDER]
  const currentImg = images[activeImg] ?? images[0]

  const infoItems = [
    character.role && { label: 'Função', value: character.role },
    character.age != null && { label: 'Idade', value: `${character.age} anos` },
    character.gender && { label: 'Sexo', value: character.gender },
    character.first_appearance && { label: 'Primeira Aparição', value: character.first_appearance },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />

        <div className="relative w-full max-w-4xl bg-[#0f0f1e] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 sm:w-96 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

          {/* Mobile drag handle */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-4 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <Icon icon="mdi:close" className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* === MOBILE LAYOUT: stacked === */}
          <div className="flex flex-col md:hidden overflow-y-auto">
            {/* Compact header: small image + name + badges */}
            <div className="flex gap-4 px-4 pt-2 pb-4 border-b border-white/5">
              <div
                className="relative flex-shrink-0 cursor-pointer rounded-xl overflow-hidden"
                style={{ width: 80, height: 112 }}
                onClick={() => setLightboxOpen(true)}
              >
                <img src={currentImg} alt={character.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Icon icon="mdi:magnify-plus-outline" className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h2 className="text-lg font-bold text-white leading-tight">{character.name}</h2>
                {character.nickname && (
                  <p className="text-violet-400 text-sm mt-0.5">&ldquo;{character.nickname}&rdquo;</p>
                )}
                {serie && (
                  <p className="text-white/40 text-xs mt-1 flex items-center gap-1">
                    <Icon icon="mdi:television-play" className="w-3 h-3 text-violet-500" />
                    {serie.title}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge label={character.alignment} variant={character.alignment} />
                  <Badge label={character.status} variant={character.status} />
                  <FavoriteButton table="characters" id={character.id} favorite={character.favorite} />
                </div>
              </div>
            </div>

            {/* Thumbnails (if multiple) */}
            {images.length > 1 && (
              <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none">
                {images.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    className={`relative rounded-lg overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                      i === activeImg
                        ? 'ring-2 ring-violet-500 ring-offset-1 ring-offset-[#0f0f1e] scale-105'
                        : 'opacity-60 hover:opacity-90'
                    }`}
                    style={{ width: 44, height: 60 }}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Info */}
            <div className="px-4 pb-6 space-y-4 pt-2">
              {infoItems.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {infoItems.map(({ label, value }) => (
                    <div key={label} className="bg-white/5 border border-white/5 rounded-xl p-2.5">
                      <p className="text-white/40 text-xs mb-0.5">{label}</p>
                      <p className="text-white text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {character.description && (
                <div>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Descrição</p>
                  <p className="text-white/70 text-sm leading-relaxed">{character.description}</p>
                </div>
              )}

              {groups.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Grupos & Facções</p>
                  <div className="flex flex-wrap gap-2">
                    {groups.map((g) => (
                      <span
                        key={g.id}
                        className="px-3 py-1.5 bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs rounded-lg"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* === DESKTOP LAYOUT: two columns === */}
          <div className="hidden md:flex overflow-hidden flex-1">
            {/* Left: TiltedCard + thumbnail strip + badges */}
            <div className="w-72 flex-shrink-0 flex flex-col items-center gap-4 p-6 overflow-y-auto">
              <div className="relative group/card">
                <TiltedCard
                  imageSrc={currentImg}
                  altText={character.name}
                  containerWidth="220px"
                  containerHeight="310px"
                  imageWidth="220px"
                  imageHeight="310px"
                  objectFit="contain"
                  scaleOnHover={1.04}
                  rotateAmplitude={12}
                  showTooltip={false}
                  onClick={() => setLightboxOpen(true)}
                />
                <div className="absolute bottom-2 right-2 opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg p-1.5">
                    <Icon icon="mdi:magnify-plus-outline" className="w-4 h-4 text-white/70" />
                  </div>
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 flex-wrap justify-center">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      className={`relative rounded-xl overflow-hidden flex-shrink-0 transition-all cursor-pointer ${
                        i === activeImg
                          ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-[#0f0f1e] scale-105'
                          : 'opacity-60 hover:opacity-90'
                      }`}
                      style={{ width: 56, height: 72 }}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between w-full px-1">
                <div className="flex gap-2 flex-wrap">
                  <Badge label={character.alignment} variant={character.alignment} />
                  <Badge label={character.status} variant={character.status} />
                </div>
                <FavoriteButton table="characters" id={character.id} favorite={character.favorite} />
              </div>
            </div>

            {/* Right: Info */}
            <div className="flex-1 p-6 overflow-y-auto space-y-5 border-l border-white/5">
              <div>
                <h2 className="text-3xl font-bold text-white leading-tight">{character.name}</h2>
                {character.nickname && (
                  <p className="text-violet-400 text-base mt-1">&ldquo;{character.nickname}&rdquo;</p>
                )}
                {serie && (
                  <p className="text-white/40 text-sm mt-2 flex items-center gap-1.5">
                    <Icon icon="mdi:television-play" className="w-4 h-4 text-violet-500" />
                    {serie.title}
                  </p>
                )}
              </div>

              {infoItems.length > 0 && (
                <div className="grid grid-cols-2 gap-2.5">
                  {infoItems.map(({ label, value }) => (
                    <div key={label} className="bg-white/5 border border-white/5 rounded-xl p-3">
                      <p className="text-white/40 text-xs mb-1">{label}</p>
                      <p className="text-white text-sm font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {character.description && (
                <div>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Descrição</p>
                  <p className="text-white/70 text-sm leading-relaxed">{character.description}</p>
                </div>
              )}

              {groups.length > 0 && (
                <div>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">
                    Grupos & Facções
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {groups.map((g) => (
                      <span
                        key={g.id}
                        className="px-3 py-1.5 bg-violet-500/15 border border-violet-500/30 text-violet-300 text-xs rounded-lg"
                      >
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          images={images}
          initialIndex={activeImg}
          alt={character.name}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}

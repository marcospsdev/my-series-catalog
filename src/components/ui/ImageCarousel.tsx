import { useState } from 'react'
import { Icon } from '@iconify/react'

interface ImageCarouselProps {
  images: string[]
  alt?: string
  className?: string
}

export default function ImageCarousel({ images, alt = '', className = '' }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) return null

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length)
  const next = () => setCurrent((i) => (i + 1) % images.length)

  return (
    <div className={`relative group select-none ${className}`}>
      <div className="relative overflow-hidden rounded-2xl aspect-[2/3] bg-white/5">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              i === current ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm
                         flex items-center justify-center text-white opacity-0 group-hover:opacity-100
                         transition-opacity cursor-pointer hover:bg-black/80 shadow-lg"
            >
              <Icon icon="mdi:chevron-left" className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm
                         flex items-center justify-center text-white opacity-0 group-hover:opacity-100
                         transition-opacity cursor-pointer hover:bg-black/80 shadow-lg"
            >
              <Icon icon="mdi:chevron-right" className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    i === current ? 'bg-white w-5' : 'bg-white/40 w-1.5 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <p className="text-white/30 text-xs text-center mt-2">
          {current + 1} / {images.length}
        </p>
      )}
    </div>
  )
}

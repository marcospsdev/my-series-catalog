import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'

interface LightboxProps {
  images: string[]
  initialIndex?: number
  alt?: string
  onClose: () => void
}

export default function Lightbox({ images, initialIndex = 0, alt = '', onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setCurrent(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      e.stopImmediatePropagation() // impede que o ESC feche o modal de baixo ao mesmo tempo
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', handleKey, true) // capture phase — roda antes do listener do modal
    return () => document.removeEventListener('keydown', handleKey, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose])

  function go(dir: 1 | -1) {
    if (images.length <= 1 || animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent((i) => (i + dir + images.length) % images.length)
      setAnimating(false)
    }, 150)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)' }}
      onClick={onClose}
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
      >
        <Icon icon="mdi:close" className="w-6 h-6" />
      </button>

      {/* Nav prev */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); go(-1) }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <Icon icon="mdi:chevron-left" className="w-7 h-7" />
        </button>
      )}

      {/* Image */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          opacity: animating ? 0 : 1,
          transform: animating ? 'scale(0.95)' : 'scale(1)',
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          key={current}
          src={images[current]}
          alt={alt}
          style={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain',
            borderRadius: 16,
            boxShadow: '0 0 60px rgba(124,58,237,0.3), 0 25px 60px rgba(0,0,0,0.8)',
            animation: 'lightbox-zoom-in 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
          }}
        />
      </div>

      {/* Nav next */}
      {images.length > 1 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); go(1) }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
        >
          <Icon icon="mdi:chevron-right" className="w-7 h-7" />
        </button>
      )}

      {/* Counter + thumbnails strip */}
      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <div className="flex gap-2">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                className={`rounded-lg overflow-hidden transition-all cursor-pointer flex-shrink-0 ${
                  i === current
                    ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-black scale-110'
                    : 'opacity-40 hover:opacity-75'
                }`}
                style={{ width: 48, height: 60 }}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <span className="text-white/40 text-xs">{current + 1} / {images.length}</span>
        </div>
      )}
    </div>
  )
}

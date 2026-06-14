import { useRef, useState } from 'react'

interface TiltedCardProps {
  imageSrc: string
  altText?: string
  captionText?: string
  containerHeight?: string
  containerWidth?: string
  imageHeight?: string
  imageWidth?: string
  scaleOnHover?: number
  rotateAmplitude?: number
  showMobileWarning?: boolean
  showTooltip?: boolean
  overlayContent?: React.ReactNode
  objectFit?: 'cover' | 'contain'
  onClick?: () => void
}

export default function TiltedCard({
  imageSrc,
  altText = '',
  captionText = '',
  containerHeight = '300px',
  containerWidth = '200px',
  imageHeight = '300px',
  imageWidth = '200px',
  scaleOnHover = 1.05,
  rotateAmplitude = 14,
  showTooltip = true,
  overlayContent,
  objectFit = 'cover',
  onClick,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const cx = rect.width / 2
    const cy = rect.height / 2
    setTilt({
      x: ((y - cy) / cy) * rotateAmplitude,
      y: -((x - cx) / cx) * rotateAmplitude,
    })
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 })
    setHovered(false)
  }

  return (
    <div
      style={{ width: containerWidth, height: containerHeight, perspective: '900px' }}
      className="relative"
    >
      <div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{
          width: imageWidth,
          height: imageHeight,
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${hovered ? scaleOnHover : 1})`,
          transition: hovered ? 'transform 0.1s ease-out' : 'transform 0.4s ease-out',
          transformStyle: 'preserve-3d',
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        <img
          src={imageSrc}
          alt={altText}
          style={{ width: '100%', height: '100%', objectFit: objectFit, display: 'block' }}
        />

        {overlayContent && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '12px',
            }}
          >
            {overlayContent}
          </div>
        )}

        {showTooltip && captionText && hovered && (
          <div
            style={{
              position: 'absolute',
              bottom: '-36px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.8)',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            {captionText}
          </div>
        )}
      </div>
    </div>
  )
}

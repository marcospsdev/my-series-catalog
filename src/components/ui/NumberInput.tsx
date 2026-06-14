import { Icon } from '@iconify/react'

interface NumberInputProps {
  value: number | ''
  onChange: (v: number | '') => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
  className?: string
}

export default function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder = '0',
  className = '',
}: NumberInputProps) {
  const isDecimal = step < 1

  function decrement() {
    const cur = typeof value === 'number' ? value : (min ?? 0)
    const next = parseFloat((cur - step).toFixed(10))
    if (min !== undefined && next < min) return
    onChange(next)
  }

  function increment() {
    const cur = typeof value === 'number' ? value : (min ?? step)
    const next = parseFloat((cur + step).toFixed(10))
    if (max !== undefined && next > max) return
    onChange(next)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value
    if (raw === '') { onChange(''); return }
    const n = isDecimal ? parseFloat(raw) : parseInt(raw, 10)
    if (isNaN(n)) return
    if (min !== undefined && n < min) return
    if (max !== undefined && n > max) return
    onChange(n)
  }

  const canDec = typeof value === 'number' && (min === undefined || value - step >= min)
  const canInc = value === '' || (max === undefined || (typeof value === 'number' && value + step <= max))

  return (
    <div className={`flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={decrement}
        disabled={!canDec}
        className="px-3 py-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 border-r border-white/8"
      >
        <Icon icon="mdi:minus" className="w-3.5 h-3.5" />
      </button>

      <input
        type="text"
        inputMode={isDecimal ? 'decimal' : 'numeric'}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-white text-sm text-center focus:outline-none placeholder:text-white/25 py-2 min-w-0"
        style={{ width: '3.5rem' }}
      />

      <button
        type="button"
        onClick={increment}
        disabled={!canInc}
        className="px-3 py-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer flex-shrink-0 border-l border-white/8"
      >
        <Icon icon="mdi:plus" className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

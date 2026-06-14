import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from '@iconify/react'

export interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  required?: boolean
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Selecione...',
  className = '',
  required = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  function handleToggle() {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
    }
    setOpen((o) => !o)
  }

  useEffect(() => {
    if (!open) return
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        buttonRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) return
      setOpen(false)
    }
    function handleScroll() { setOpen(false) }
    document.addEventListener('mousedown', handleOutside)
    window.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('mousedown', handleOutside)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open])

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2
                   focus:outline-none focus:ring-2 focus:ring-violet-500 flex items-center justify-between gap-2
                   cursor-pointer hover:bg-white/8 transition-colors"
      >
        <span className={selected ? 'text-white truncate' : 'text-white/30 truncate'}>
          {selected?.label ?? placeholder}
        </span>
        <Icon
          icon="mdi:chevron-down"
          className={`w-4 h-4 text-white/40 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
          className="bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        >
          {!required && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false) }}
              className="w-full px-3 py-2.5 text-left text-sm text-white/30 hover:bg-white/5 cursor-pointer transition-colors"
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full px-3 py-2.5 text-left text-sm cursor-pointer transition-colors hover:bg-violet-500/20 ${
                opt.value === value ? 'text-violet-300 bg-violet-500/10' : 'text-white/80 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  )
}

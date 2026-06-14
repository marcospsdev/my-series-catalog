interface BadgeProps {
  label: string
  variant?: 'hero' | 'villain' | 'neutral' | 'alive' | 'dead' | 'unknown' | 'default'
}

const variantClass: Record<string, string> = {
  hero: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
  villain: 'bg-red-500/20 text-red-300 border border-red-500/40',
  neutral: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40',
  alive: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
  dead: 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/40',
  unknown: 'bg-purple-500/20 text-purple-300 border border-purple-500/40',
  default: 'bg-white/10 text-white/70 border border-white/20',
}

const labelPT: Record<string, string> = {
  hero: 'Herói',
  villain: 'Vilão',
  neutral: 'Neutro',
  alive: 'Vivo',
  dead: 'Morto',
  unknown: 'Desconhecido',
}

export default function Badge({ label, variant = 'default' }: BadgeProps) {
  const displayLabel = labelPT[label] ?? label
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClass[variant] ?? variantClass.default}`}>
      {displayLabel}
    </span>
  )
}

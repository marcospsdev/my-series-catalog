import { Icon } from '@iconify/react'
import type { WatchStatus } from '../../types'

const CONFIG: Record<WatchStatus, { label: string; shortLabel: string; icon: string; cls: string }> = {
  unwatched: {
    label: 'Não assistido',
    shortLabel: 'Não assistido',
    icon: 'mdi:eye-off-outline',
    cls: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
  },
  watching: {
    label: 'Assistindo',
    shortLabel: 'Assistindo',
    icon: 'mdi:play-circle-outline',
    cls: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  },
  completed: {
    label: 'Assistido',
    shortLabel: 'Assistido',
    icon: 'mdi:check-circle-outline',
    cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
}

interface WatchStatusBadgeProps {
  status: WatchStatus
  compact?: boolean
}

export default function WatchStatusBadge({ status, compact = false }: WatchStatusBadgeProps) {
  const cfg = CONFIG[status] ?? CONFIG.unwatched
  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-full font-medium ${cfg.cls} ${
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Icon icon={cfg.icon} className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {!compact && cfg.shortLabel}
    </span>
  )
}

export { CONFIG as WATCH_STATUS_CONFIG }

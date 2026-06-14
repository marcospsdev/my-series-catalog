import { NavLink } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../contexts/AuthContext'

const NAV = [
  { to: '/',           icon: 'mdi:view-dashboard',  label: 'Dashboard' },
  { to: '/series',     icon: 'mdi:television-play', label: 'Séries & Animes' },
  { to: '/characters', icon: 'mdi:account-multiple', label: 'Personagens' },
  { to: '/groups',     icon: 'mdi:shield-sword',    label: 'Grupos' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, isGuest, signOut } = useAuth()

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 h-full bg-[#0a0a16] border-r border-white/5 flex-col z-50 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-56'
        }`}
      >
        {/* Header: logo + toggle */}
        <div className={`border-b border-white/5 flex items-center gap-2.5 ${collapsed ? 'p-3 justify-center flex-col gap-2' : 'p-4'}`}>
          {/* Logo */}
          <div className={`flex items-center gap-2.5 flex-1 min-w-0 ${collapsed ? 'flex-col' : ''}`}>
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center flex-shrink-0">
              <Icon icon="mdi:television-play" className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1">
                <p className="text-white font-bold text-sm leading-none whitespace-nowrap">Meu Catálogo</p>
                <p className="text-white/30 text-[11px] mt-0.5 whitespace-nowrap">de Séries</p>
              </div>
            )}
          </div>

          {/* Toggle button — no topo */}
          <button
            onClick={onToggle}
            title={collapsed ? 'Expandir' : 'Recolher'}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/8 transition-colors cursor-pointer flex-shrink-0"
          >
            <Icon
              icon={collapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'}
              className="w-4 h-4"
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-hidden">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon icon={icon} className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Footer: user + logout */}
        <div className="border-t border-white/5 p-2 space-y-0.5">
          {!collapsed && (
            <div className="px-3 py-2">
              {isGuest ? (
                <p className="text-white/30 text-xs flex items-center gap-1.5">
                  <Icon icon="mdi:account-outline" className="w-3.5 h-3.5" />
                  Modo convidado
                </p>
              ) : user ? (
                <p className="text-white/40 text-xs truncate" title={user.email}>{user.email}</p>
              ) : null}
            </div>
          )}

          <button
            onClick={() => signOut()}
            title={collapsed ? 'Sair' : undefined}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer ${collapsed ? 'justify-center' : ''}`}
          >
            <Icon icon="mdi:logout" className="w-4 h-4 flex-shrink-0" />
            {!collapsed && 'Sair'}
          </button>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a16]/95 backdrop-blur-md border-t border-white/10 flex">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-violet-400' : 'text-white/40 hover:text-white/70'
              }`
            }
          >
            <Icon icon={icon} className="w-5 h-5" />
            <span className="hidden xs:block">{label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}

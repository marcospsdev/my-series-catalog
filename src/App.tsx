import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import Sidebar from './components/ui/Sidebar'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import SeriesPage from './pages/SeriesPage'
import SerieDetailPage from './pages/SerieDetailPage'
import CharactersPage from './pages/CharactersPage'
import GroupsPage from './pages/GroupsPage'
import GroupDetailPage from './pages/GroupDetailPage'

function AppShell() {
  const { user, isGuest, loading } = useAuth()
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === '1',
  )

  function toggleSidebar() {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem('sidebarCollapsed', next ? '1' : '0')
      return next
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <Icon icon="mdi:loading" className="w-10 h-10 text-violet-500 animate-spin" />
      </div>
    )
  }

  if (!user && !isGuest) {
    return <LoginPage />
  }

  return (
    <DataProvider>
      <div className="flex min-h-screen bg-[#0d0d1a]">
        <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
        <main
          className="flex-1 min-h-screen overflow-y-auto pb-16 lg:pb-0 transition-all duration-300"
          style={{ marginLeft: `${collapsed ? 4 : 14}rem` }}
          // Override to 0 on mobile (sidebar is hidden on mobile, bottom nav is used)
        >
          {/* On mobile the sidebar is hidden so no margin needed */}
          <style>{`@media (max-width: 1023px) { main { margin-left: 0 !important; } }`}</style>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/series" element={<SeriesPage />} />
            <Route path="/series/:id" element={<SerieDetailPage />} />
            <Route path="/characters" element={<CharactersPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:id" element={<GroupDetailPage />} />
          </Routes>
        </main>
      </div>
    </DataProvider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </BrowserRouter>
  )
}

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  isGuest: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
  enterGuestMode: () => void
}

const AuthContext = createContext<AuthContextValue>(null!)

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isGuest, setIsGuest] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const sessionUser = data.session?.user ?? null
      setUser(sessionUser)
      if (!sessionUser) {
        setIsGuest(localStorage.getItem('guest_mode') === '1')
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) { setIsGuest(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string): Promise<string | null> {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    localStorage.removeItem('guest_mode')
    setIsGuest(false)
    return null
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setIsGuest(false)
    localStorage.removeItem('guest_mode')
  }

  function enterGuestMode() {
    localStorage.setItem('guest_mode', '1')
    setIsGuest(true)
  }

  return (
    <AuthContext.Provider value={{ user, isGuest, loading, signIn, signOut, enterGuestMode }}>
      {children}
    </AuthContext.Provider>
  )
}

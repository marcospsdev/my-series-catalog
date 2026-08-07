import { useState } from 'react'
import { Icon } from '@iconify/react'
import { useAuth } from '../contexts/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

export default function LoginPage() {
  const { signIn, enterGuestMode } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPass, setShowPass] = useState(false)

  const INPUT = 'w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder:text-white/30'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('Preencha e-mail e senha.'); return }
    setLoading(true)
    setError(null)
    const err = await signIn(email, password)
    if (err) setError(err)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm space-y-6">
        {/* Logo / title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto">
            <Icon icon="mdi:television-play" className="w-7 h-7 text-violet-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">My Series Catalog</h1>
          <p className="text-white/40 text-sm">Faça login para sincronizar seu catálogo</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          {!isSupabaseConfigured && (
            <div className="bg-amber-500/15 border border-amber-500/30 text-amber-300 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <Icon icon="mdi:alert-circle-outline" className="w-4 h-4 flex-shrink-0" />
              Login indisponível: Supabase não configurado. Use o modo convidado abaixo.
            </div>
          )}

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <Icon icon="mdi:alert-circle-outline" className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className={INPUT}
                autoComplete="email"
                disabled={!isSupabaseConfigured}
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${INPUT} pr-11`}
                  autoComplete="current-password"
                  disabled={!isSupabaseConfigured}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                >
                  <Icon icon={showPass ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isSupabaseConfigured}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
              ) : (
                <Icon icon="mdi:login" className="w-4 h-4" />
              )}
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs">ou</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Guest mode */}
        <button
          onClick={enterGuestMode}
          className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white font-medium py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Icon icon="mdi:account-outline" className="w-4 h-4" />
          Continuar como convidado
        </button>

        <p className="text-white/25 text-xs text-center leading-relaxed">
          No modo convidado, os dados ficam salvos localmente no navegador.<br />
          Imagens por URL externa. Sem sincronização entre dispositivos.
        </p>
      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ShieldCheck, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      alert(error.message)
    } else {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
            Welcome_Back
          </h2>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Enter credentials to access impact</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                required
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password" 
                placeholder="PASSWORD" 
                required
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                onChange={(e) => setPassword(e.target.value)} 
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 group"
          >
            {loading ? 'Authenticating...' : 'Sign In System'}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Footer Links */}
        <div className="pt-4 space-y-4">
          <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            New player? <Link href="/signup" className="text-blue-500 hover:text-blue-400 underline underline-offset-4">Create Account</Link>
          </p>

          <div className="border-t border-white/5 pt-6 flex justify-center">
            <Link 
              href="/admin" 
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl text-[9px] font-black text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-all uppercase tracking-tighter"
            >
              <ShieldCheck size={14} /> Admin Portal
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
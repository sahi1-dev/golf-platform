'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [charity, setCharity] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // 1. Supabase Auth se user create karo [cite: 125]
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      alert(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // 2. Profiles table mein user details aur charity lock karo 
      const { error: profileError } = await supabase.from('profiles').insert([
        { 
          id: data.user.id, 
          charity_id: charity || null, 
          charity_percentage: 10, // PRD Mandatory Min 10% [cite: 77]
          subscription_status: 'inactive' 
        }
      ])

      if (profileError) {
        console.error("Profile Error:", profileError)
      } else {
        alert('Signup successful! Please check your email for verification.')
        router.push('/login')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md space-y-8 bg-[#1e293b] p-10 rounded-[2rem] shadow-2xl border border-slate-700/50">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Play for a Purpose
          </h2>
          <p className="mt-3 text-slate-400">Join the movement. Support your cause.</p>
        </div>
        
        <form className="mt-8 space-y-5" onSubmit={handleSignup}>
          <div className="space-y-4">
            <input
              type="email"
              placeholder="Email address"
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              required
              className="w-full px-5 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500"
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {/* Charity Selection Dropdown [cite: 76, 81] */}
            <div className="relative">
              <select 
                className="w-full px-5 py-4 rounded-2xl bg-slate-800/50 border border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-300 appearance-none cursor-pointer"
                required
                value={charity}
                onChange={(e) => setCharity(e.target.value)}
              >
                <option value="" disabled>Select your Charity</option>
                {/* Teri di hui IDs yahan set hain */}
                <option value="672fab01-0df1-4bf9-90cf-8686ddc4d8d7">Clean Water Foundation</option>
                <option value="fb30d87f-226f-4586-9421-3bb9a6fdb1dd">Youth Sports Initiative</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-4 text-md font-bold rounded-2xl text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all shadow-xl shadow-blue-900/20 mt-4"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-500">
          Already have an account? <a href="/login" className="text-blue-400 hover:underline">Login</a>
        </p>
      </div>
    </div>
  )
}
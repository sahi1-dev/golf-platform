'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { Trophy, Target, LogOut, Zap, ChevronRight, History, Globe, ShieldCheck } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

// --- Interfaces ---
interface Score { id: string; score_value: number; created_at: string; }
interface Profile { 
  subscription_status: string; 
  charity_percentage: number; 
  charities: { name: string } | null; 
}

interface RawProfileData {
  subscription_status: string;
  charity_percentage: number;
  charities: { name: string } | { name: string }[] | null;
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [score, setScore] = useState('')
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const router = useRouter()
  const channelRef = useRef<any>(null) // To prevent duplicate subscriptions

  // --- Data Fetching Logic ---
  const fetchDashboardData = useCallback(async (userId: string) => {
    try {
      const [profileRes, scoresRes] = await Promise.all([
        supabase
          .from('profiles')
          .select(`subscription_status, charity_percentage, charities ( name )`)
          .eq('id', userId)
          .single(),
        supabase
          .from('scores')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      if (profileRes.data) {
        const data = profileRes.data as unknown as RawProfileData;
        const formattedProfile: Profile = {
          subscription_status: data.subscription_status || 'inactive',
          charity_percentage: data.charity_percentage || 0,
          charities: Array.isArray(data.charities) ? data.charities[0] : data.charities
        };
        setProfile(formattedProfile);
      }
      if (scoresRes.data) setScores(scoresRes.data)
    } catch (err) {
      console.error("Fetch error:", err)
    }
  }, [])

  // --- Realtime & Init Logic ---
  useEffect(() => {
    const setupApp = async () => {
      // 1. Get Session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/login')
        return
      }

      const authUser = session.user
      setUser(authUser)
      await fetchDashboardData(authUser.id)
      setLoading(false)

      // 2. Realtime FIX: Initialize channel
      if (!channelRef.current) {
        const channel = supabase.channel(`db-sync-${authUser.id}`)
        
        // 3. IMPORTANT: Chain .on() BEFORE .subscribe()
        channel
          .on(
            'postgres_changes',
            { 
              event: '*', 
              schema: 'public', 
              table: 'scores', 
              filter: `user_id=eq.${authUser.id}` 
            },
            (payload: any) => {
              console.log("Realtime Sync Triggered", payload)
              fetchDashboardData(authUser.id)
            }
          )
          .subscribe((status: string) => {
            if (status === 'SUBSCRIBED') {
              console.log('Realtime Status: Active')
            }
          })

        channelRef.current = channel
      }
    }

    setupApp()

    return () => { 
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [router, fetchDashboardData])

  // --- Handlers ---
  const addScore = async (e: React.FormEvent) => {
    e.preventDefault()

    if (profile?.subscription_status?.toLowerCase() !== 'active') {
      alert("Subscription Required: Please click 'Upgrade' to start.")
      return
    }

    const val = parseInt(score)
    if (isNaN(val) || val < 1 || val > 45) {
      alert("Invalid Score: 1-45 range.")
      return
    }

    if (!user || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('scores')
        .insert([{ user_id: user.id, score_value: val }])
      
      if (error) throw error
      setScore('')
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubscribe = async () => {
    if (profile?.subscription_status === 'active') return;
    try {
      const res = await fetch('/api/checkout', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ email: user?.email, userId: user?.id }) 
      })
      const data = await res.json()
      const stripe = await stripePromise;
      
      // FIXED: Added 'as any' to prevent Vercel Type Error
      if (stripe && data.sessionId) {
        await (stripe as any).redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (err) {
      console.error("Stripe error:", err)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="h-10 w-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 font-sans p-4 md:p-8 selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center px-8 py-5 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <Target size={22} className="text-blue-500" />
            <h1 className="text-xl font-black text-white uppercase italic tracking-tighter">Impact_Dashboard</h1>
          </div>
          <button 
            onClick={() => supabase.auth.signOut().then(() => router.push('/login'))} 
            className="text-[10px] font-black text-slate-500 hover:text-rose-400 uppercase flex items-center gap-2 transition-all"
          >
            Logout <LogOut size={14} />
          </button>
        </header>

        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap size={16} className="text-blue-500 animate-pulse" />
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Live Sync Active</p>
          </div>
          <div className="hidden md:block text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">
            Tier: {profile?.subscription_status === 'active' ? 'PRO_OPERATOR' : 'FREE_TIER'}
          </div>
        </div>

        <main className="grid lg:grid-cols-12 gap-8">
          <section className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <h2 className="text-2xl font-black text-white italic uppercase mb-8">Log Round</h2>
              <form onSubmit={addScore} className="space-y-8 relative z-10">
                <div className="relative">
                  <input 
                    type="number" 
                    value={score} 
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-white/5 focus:border-blue-500 py-6 text-6xl font-black text-white outline-none transition-all placeholder:text-slate-800"
                    placeholder="00" 
                  />
                  <span className="absolute right-0 bottom-6 text-[10px] font-bold text-slate-600 uppercase">Points</span>
                </div>
                <button 
                  disabled={isSubmitting} 
                  className="w-full py-5 bg-blue-600 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20"
                >
                  {isSubmitting ? 'Syncing...' : 'Submit Score'}
                </button>
              </form>
            </div>

            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-3xl flex justify-between items-center">
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Impact Factor</p>
                <p className="text-3xl font-black text-white italic">{profile?.charity_percentage || 0}%</p>
                <p className="text-[9px] font-bold text-blue-500 uppercase mt-1">
                  Partner: {profile?.charities?.name || 'Education for All'}
                </p>
              </div>
              <button 
                onClick={handleSubscribe} 
                className={`px-5 py-2 font-black text-[9px] uppercase rounded-xl transition-all border ${
                  profile?.subscription_status === 'active' 
                    ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                    : 'bg-blue-600 text-white border-transparent'
                }`}
              >
                {profile?.subscription_status === 'active' ? 'Verified' : 'Upgrade'}
              </button>
            </div>
          </section>

          <section className="lg:col-span-8 bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-10">
              <Trophy size={18} className="text-yellow-500" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Performance</h3>
            </div>

            <div className="space-y-4">
              {scores.length > 0 ? (
                scores.map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-6 bg-white/[0.01] border border-white/5 rounded-[1.5rem] group hover:border-blue-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-800 rounded-xl">
                        <History size={16} className="text-slate-500" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-200 italic">Score: {s.score_value}</p>
                        <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                          {new Date(s.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-700" />
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] italic">No Records Found</div>
              )}
            </div>
          </section>
        </main>

        <footer className="mt-16 pb-10 text-center space-y-3">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />
          
          <div className="inline-flex items-center gap-4 px-6 py-2 bg-white/[0.02] border border-white/5 rounded-full backdrop-blur-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Dev_Terminal: <span className="text-blue-500">Md Sahil</span> 
            </p>
            <div className="h-3 w-[1px] bg-white/10" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Role: <span className="text-blue-500">ML & Web Engineer</span> 
            </p>
          </div>

          <div className="flex justify-center gap-6 text-[8px] font-bold text-slate-600 uppercase tracking-widest">
            <span>© 2026 Impact_Systems</span>
            <span className="text-slate-800">|</span>
            <span>Built with Next.js & Supabase</span>
            <span className="text-slate-800">|</span>
            <span>v1.0.5_Stable</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
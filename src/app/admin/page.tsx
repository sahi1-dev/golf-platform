'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Users, 
  ShieldCheck, 
  LogOut, 
  Zap, 
  Gift, 
  CheckCircle, 
  PlayCircle, 
  Edit3, 
  ArrowLeftRight,
  UserPlus
} from 'lucide-react'

// --- Interfaces ---
interface AdminUser {
  id: string;
  subscription_status: string;
  charity_percentage: number;
  charities: { name: string } | null;
  role: string;
}

type AdminTab = 'users' | 'draws' | 'charity' | 'winners';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('users')
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [usersList, setUsersList] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [newCharity, setNewCharity] = useState({ name: '', description: '' })
  
  const router = useRouter()

  // --- Fetch Users Logic ---
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select(`id, subscription_status, charity_percentage, role, charities(name)`)
    
    if (!error && data) {
      setUsersList(data as unknown as AdminUser[])
    }
    setLoading(false)
  }, [])

  // --- Session & Role Check ---
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Master Bypass for your specific UID or Admin Role
        const isMaster = session.user.id === 'e7d64053-ce16-4a31-b52a-de11526ab4f0';
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        if (isMaster || profile?.role === 'admin') {
          setIsAdmin(true)
          fetchUsers()
        } else {
          // If logged in but NOT admin, send to user dashboard
          router.push('/dashboard')
        }
      }
    }
    checkSession()
  }, [fetchUsers, router])

  // --- Admin Login Handler ---
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email: email.trim().toLowerCase(), 
      password 
    })

    if (!error && data?.user) {
      const isMaster = data.user.id === 'e7d64053-ce16-4a31-b52a-de11526ab4f0';
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      
      if (isMaster || profile?.role === 'admin') {
        setIsAdmin(true)
        fetchUsers()
      } else {
        alert("Redirecting to User Dashboard...")
        router.push('/dashboard')
      }
    } else {
      alert("Invalid Admin Credentials")
    }
    setLoading(false)
  }

  // --- Admin Actions ---
  const runDrawSimulation = () => {
    const winningNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 45) + 1);
    alert(`[Simulation] Winning Numbers: ${winningNumbers.join(' - ')}`);
  }

  const handleEditScore = async (userId: string) => {
    const newScore = prompt("Admin: Enter manual score override (1-45):");
    if (newScore && parseInt(newScore) >= 1 && parseInt(newScore) <= 45) {
      const { error } = await supabase
        .from('scores')
        .insert([{ user_id: userId, score_value: parseInt(newScore) }]);
      if (!error) alert("Score synchronized!");
    }
  }

  const handleAddCharity = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('charities').insert([newCharity])
    if (!error) {
      alert("Charity Registered!");
      setNewCharity({ name: '', description: '' });
    }
  }

  // --- LOGIN UI (With Redirection Options) ---
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 selection:bg-blue-500/30">
        <div className="max-w-md w-full bg-slate-900 border border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full" />
          
          <div className="text-center mb-8 relative z-10">
            <div className="inline-block p-4 bg-blue-600/10 rounded-2xl mb-4">
              <ShieldCheck className="text-blue-500" size={40} />
            </div>
            <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Admin_Console</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">Identity Verification Required</p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-4 relative z-10">
            <input 
              type="email" 
              placeholder="Admin Email" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              type="password" 
              placeholder="Authorization Key" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-700" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button 
              disabled={loading} 
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase rounded-2xl transition-all shadow-lg shadow-blue-900/40 active:scale-[0.98]"
            >
              {loading ? 'Processing...' : 'Access Terminal'}
            </button>
          </form>

          {/* --- REDIRECT OPTIONS SECTION --- */}
          <div className="mt-10 pt-8 border-t border-white/5 relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-[1px] flex-1 bg-white/5" />
              <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">Quick Navigation</p>
              <div className="h-[1px] flex-1 bg-white/5" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => router.push('/dashboard')}
                className="group flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all"
              >
                <Zap size={16} className="text-slate-500 group-hover:text-blue-400" />
                <span className="text-[9px] font-black text-slate-500 group-hover:text-white uppercase">Dashboard</span>
              </button>
              
              <button 
                onClick={() => router.push('/login')}
                className="group flex flex-col items-center gap-2 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] hover:border-white/10 transition-all"
              >
                <ArrowLeftRight size={16} className="text-slate-500 group-hover:text-emerald-400" />
                <span className="text-[9px] font-black text-slate-500 group-hover:text-white uppercase">User Login</span>
              </button>
            </div>

            <button 
              onClick={() => router.push('/signup')}
              className="w-full mt-4 py-3 flex items-center justify-center gap-2 text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.2em] transition-colors"
            >
              <UserPlus size={12} /> Join Platform
            </button>
          </div>
        </div>
      </div>
    )
  }

  // --- MAIN ADMIN UI ---
  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center bg-[#090e1a] p-6 border border-white/5 rounded-3xl backdrop-blur-md">
          <div className="flex items-center gap-6">
            <h1 className="text-lg font-black text-white uppercase italic tracking-widest">Control_Center</h1>
            <nav className="flex gap-2">
              {['users', 'draws', 'winners', 'charity'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab as AdminTab)} 
                  className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          <button 
            onClick={() => { supabase.auth.signOut().then(() => router.push('/login')) }} 
            className="text-[10px] font-black text-slate-600 uppercase flex items-center gap-2 hover:text-rose-500 transition-colors"
          >
            Terminate_Session <LogOut size={14} />
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', val: usersList.length, icon: Users, color: 'text-blue-500' },
            { label: 'Draw Status', val: 'READY', icon: Zap, color: 'text-yellow-500' },
            { label: 'Pool Status', val: '40% Live', icon: Gift, color: 'text-rose-500' },
            { label: 'Verification', val: 'Automated', icon: CheckCircle, color: 'text-emerald-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-[#0b1221] p-6 rounded-3xl border border-white/5 flex items-center gap-4 hover:border-white/10 transition-all">
              <stat.icon className={stat.color} size={24} />
              <div>
                <p className="text-[8px] text-slate-500 font-bold uppercase">{stat.label}</p>
                <p className="text-lg font-black text-white italic">{stat.val}</p>
              </div>
            </div>
          ))}
        </div>

        <main className="bg-[#0b1221] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-black uppercase text-slate-500 border-b border-white/5 tracking-widest">
                    <th className="p-6">Subscriber_ID</th>
                    <th className="p-6">Status</th>
                    <th className="p-6">Impact_%</th>
                    <th className="p-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-6 font-mono text-xs text-slate-400">{u.id.substring(0, 15)}...</td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${u.subscription_status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {u.subscription_status || 'Inactive'}
                        </span>
                      </td>
                      <td className="p-6 font-black text-white italic">{u.charity_percentage || 0}%</td>
                      <td className="p-6 text-right">
                        <button 
                          onClick={() => handleEditScore(u.id)} 
                          className="p-2 text-slate-600 hover:text-blue-500 transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'draws' && (
            <div className="text-center py-20 space-y-6">
              <Zap size={48} className="mx-auto text-yellow-500 animate-pulse" />
              <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Monthly Reward Engine</h3>
              <button onClick={runDrawSimulation} className="px-8 py-4 bg-blue-600 text-white font-black uppercase rounded-2xl flex items-center gap-3 mx-auto hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
                <PlayCircle size={20} /> Execute Simulation
              </button>
            </div>
          )}

          {activeTab === 'charity' && (
            <div className="max-w-md mx-auto py-10">
              <h3 className="text-lg font-black text-white uppercase italic mb-8">Register New Partner</h3>
              <form onSubmit={handleAddCharity} className="space-y-6">
                <input type="text" placeholder="Partner Name" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-all" value={newCharity.name} onChange={(e) => setNewCharity({...newCharity, name: e.target.value})} required />
                <textarea placeholder="Partner Mission" rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-blue-500 transition-all" value={newCharity.description} onChange={(e) => setNewCharity({...newCharity, description: e.target.value})} required />
                <button className="w-full py-4 bg-rose-600 text-white font-black uppercase rounded-2xl hover:bg-rose-500 transition-all">Add to Platform</button>
              </form>
            </div>
          )}

          {activeTab === 'winners' && (
            <div className="text-center py-20 opacity-40">
              <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
              <p className="text-sm font-black text-slate-500 uppercase tracking-widest italic">Waiting for monthly draw completion...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
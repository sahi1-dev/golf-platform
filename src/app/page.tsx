'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      // Check checking user session
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Agar login hai toh seedha dashboard
        router.push('/dashboard')
      } else {
        // Agar login nahi hai toh login page
        router.push('/login')
      }
    }
    checkUser()
  }, [router])

  // Jab tak redirect ho raha hai, tab tak ye loader dikhega
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="h-16 w-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      </div>
      <p className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">
        Syncing_Systems...
      </p>
    </div>
  )
}
"use client"

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LogoutButton({ className }: { className?: string }) {
  const { signOut } = useClerk()
  const router = useRouter()
  const handleLogout = async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser')
        localStorage.removeItem('pendingUser')
        localStorage.removeItem('rememberedEmail')
      }
      await signOut()
    } catch {}
    try {
      router.push('/')
    } catch {}
    if (typeof window !== 'undefined') {
      try { window.location.assign('/') } catch {}
    }
  }
  return (
    <Button variant="outline" className={className || "text-maroon border-maroon hover:bg-cream"} onClick={handleLogout}>
      Logout
    </Button>
  )
}

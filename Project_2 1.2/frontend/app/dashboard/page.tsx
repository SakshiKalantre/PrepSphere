"use client"
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    const go = async () => {
      if (!isSignedIn || !user) { router.replace('/sign-in'); return }
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const res = await fetch(`${API_BASE}/api/v1/users/clerk/${user.id}`)
        if (res.ok) {
          const data = await res.json()
          const role = (data.role || 'student').toLowerCase()
          router.replace(`/dashboard/${role}`)
          return
        }
      } catch {}
      router.replace('/dashboard/student')
    }
    go()
  }, [isSignedIn, user, router])

  return null
}

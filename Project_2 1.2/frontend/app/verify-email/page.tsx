"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verifying your email...")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Invalid verification link.")
      return
    }

    const verify = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const res = await fetch(`${API_BASE}/api/v1/users/verify-email?token=${token}`)
        const data = await res.json()
        
        if (res.ok) {
          setStatus("success")
          setMessage("Email verified successfully! You can now sign in.")
        } else {
          setStatus("error")
          let errorMessage = "Verification failed."
          if (data.detail) {
            if (typeof data.detail === "string") {
              errorMessage = data.detail
            } else if (Array.isArray(data.detail)) {
              errorMessage = data.detail.map((err: any) => err.msg).join(", ")
            } else {
              errorMessage = JSON.stringify(data.detail)
            }
          }
          setMessage(errorMessage)
        }
      } catch (err) {
        setStatus("error")
        setMessage("An error occurred during verification.")
      }
    }

    verify()
  }, [token])

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h1 className="text-2xl font-bold text-maroon mb-4">Email Verification</h1>
        
        <p className={`mb-6 ${status === "error" ? "text-red-600" : "text-gray-700"}`}>
          {message}
        </p>

        {status === "loading" && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon mx-auto"></div>
        )}

        {status === "success" && (
          <Link href="/sign-in">
            <Button className="bg-maroon hover:bg-maroon/90 text-white w-full">
              Sign In
            </Button>
          </Link>
        )}

        {status === "error" && (
          <Link href="/">
            <Button variant="outline" className="border-maroon text-maroon hover:bg-cream w-full">
              Go Home
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

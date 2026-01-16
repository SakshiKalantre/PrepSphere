"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid or missing reset token. Please try the password reset process again.");
    }
  }, [token]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!password) newErrors.password = "Password is required";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm password";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !token) return;

    setIsLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_BASE}/api/v1/users/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (res.ok) {
        setSuccess(true);
        setMessage("Password has been reset successfully. You can now sign in with your new password.");
        setTimeout(() => {
          router.push("/sign-in");
        }, 3000);
      } else {
        const errorData = await res.json().catch(() => ({}));
        setMessage(errorData.detail || "Failed to reset password. Please try again.");
      }
    } catch (error: any) {
      setMessage("Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{minHeight: '100vh', backgroundColor: '#FFF8F2'}} className="flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div style={{backgroundColor: 'white'}} className="rounded-lg shadow-md p-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-maroon mb-6">Password Reset Successful</h1>
              <p className="text-green-600 mb-6">{message}</p>
              <Link href="/sign-in" prefetch={false}>
                <Button className="bg-maroon hover:bg-maroon/90 text-white font-semibold py-3 rounded-lg w-full">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#FFF8F2'}} className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div style={{backgroundColor: 'white'}} className="rounded-lg shadow-md p-8">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-maroon">Reset Password</h1>
            <Link href="/sign-in" prefetch={false}>
              <Button variant="outline" size="sm" className="text-maroon border-maroon hover:bg-cream">
                ← Back to Sign In
              </Button>
            </Link>
          </div>

          {message && (
            <div className={`p-3 mb-4 rounded-lg text-sm ${
              message.includes("Invalid") || message.includes("Failed") 
                ? "bg-red-50 border border-red-200 text-red-700" 
                : "bg-blue-50 border border-blue-200 text-blue-700"
            }`}>
              {message}
            </div>
          )}

          {!token ? (
            <div className="text-center py-8">
              <p className="text-red-500">Invalid or missing reset token.</p>
              <Link href="/sign-in" prefetch={false}>
                <Button className="mt-4 bg-maroon hover:bg-maroon/90 text-white">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-maroon mb-2">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent bg-cream"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-maroon mb-2">
                  Confirm New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent bg-cream"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-maroon hover:bg-maroon/90 text-white font-semibold py-3 rounded-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
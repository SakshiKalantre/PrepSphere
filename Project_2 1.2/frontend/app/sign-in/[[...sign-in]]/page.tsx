"use client";

import { useState, useEffect } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function SignInPage() {
  const router = useRouter();
  const { isLoaded, signIn } = useSignIn();
  const [role, setRole] = useState("");
  const [secretPassword, setSecretPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resetMessage, setResetMessage] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [recaptchaError, setRecaptchaError] = useState("");

  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    // Initialize reCAPTCHA when it's available
    if (window.grecaptcha && document.getElementById("recaptcha-container")) {
      const container = document.getElementById("recaptcha-container");
      // Clear any existing reCAPTCHA before rendering
      if (container && container.innerHTML === "") {
        window.grecaptcha.render("recaptcha-container", {
          sitekey: "6LfpQR8sAAAAAAobkCurmWSGgJQE9yMCcR08OwpE",
          callback: onRecaptchaChange,
        });
      }
    }
  }, []);

  const onRecaptchaChange = (token: string) => {
    setRecaptchaToken(token);
    setRecaptchaError("");
  };

  const validateSignIn = () => {
    const newErrors: Record<string, string> = {};

    if (!role) newErrors.role = "Please select a role";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if ((role === "TPO" || role === "ADMIN") && !secretPassword) {
      newErrors.secretPassword = "Secret password is required for this role";
    }
    if (role === "TPO" && secretPassword !== "Tpo@2025") {
      newErrors.secretPassword = "Invalid TPO secret password";
    }
    if (role === "ADMIN" && secretPassword !== "Admin@2025") {
      newErrors.secretPassword = "Invalid Admin secret password";
    }
    if (!recaptchaToken) {
      setRecaptchaError("Please complete the reCAPTCHA verification");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignIn()) return;
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';
      const res = await fetch(`${API_BASE}/api/v1/users/by-email/${encodeURIComponent(email)}`);
      if (!res.ok) {
        setErrors({ submit: "Account not found. Please sign up first." });
        return;
      }
      const data = await res.json();
      const userRole = String(data.role || "student").toLowerCase();
      localStorage.setItem("currentUser", JSON.stringify({ email, role: userRole, rememberMe }));
      if (rememberMe) localStorage.setItem("rememberedEmail", email);
      router.push(`/dashboard/${userRole}`);
    } catch (err: any) {
      setErrors({ submit: "Unable to sign in. Please try again." });
    }
  };

  const handleSocialSignIn = async (provider: string) => {
    if (!isLoaded || !signIn) return;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('selectedRole', role || 'STUDENT')
      }
    const strategy =
      provider.toLowerCase() === "google"
        ? "oauth_google"
        : provider.toLowerCase() === "github"
        ? "oauth_github"
        : provider.toLowerCase() === "linkedin"
        ? "oauth_linkedin"
        : "oauth_google";
    await signIn.authenticateWithRedirect({
      strategy,
      redirectUrl: "/dashboard",
      redirectUrlComplete: "/dashboard",
    });
    } catch {}
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setErrors({ ...errors, forgotEmail: "Please enter your email" });
      return;
    }
    // Simulate password reset
    setResetMessage(
      `Password reset link has been sent to ${forgotEmail}. Please check your email.`
    );
    setTimeout(() => {
      setShowForgotPassword(false);
      setResetMessage("");
      setForgotEmail("");
    }, 3000);
  };

  const showSecretPasswordField = role === "TPO" || role === "ADMIN";

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#FFF8F2'}} className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div style={{backgroundColor: 'white'}} className="rounded-lg shadow-md p-8">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-maroon">Welcome</h1>
            <Link href="/">
              <Button variant="outline" size="sm" className="text-maroon border-maroon hover:bg-cream">
                ← Back to Home
              </Button>
            </Link>
          </div>

          <p className="text-center text-gray-600 mb-6">
            Sign in or create an account to continue
          </p>

          {/* Sign In / Sign Up Tabs */}
          <div className="flex gap-2 mb-6">
            <Button className="flex-1 bg-taupe text-maroon hover:bg-taupe/90">
              Sign In
            </Button>
            <Link href="/sign-up" className="flex-1" prefetch={false}>
              <Button variant="outline" className="w-full text-maroon border-maroon hover:bg-cream">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Forgot Password Form */}
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="forgotEmail" className="block text-sm font-medium text-maroon mb-2">
                  Enter your email
                </label>
                <input
                  type="email"
                  id="forgotEmail"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent bg-cream"
                />
                {errors.forgotEmail && (
                  <p className="text-red-500 text-xs mt-1">{errors.forgotEmail}</p>
                )}
              </div>
              {resetMessage && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                  {resetMessage}
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 bg-maroon hover:bg-maroon/90 text-white font-semibold py-3 rounded-lg"
                >
                  Send Reset Link
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 text-maroon border-maroon hover:bg-cream"
                >
                  Back
                </Button>
              </div>
            </form>
          ) : (
            /* Sign In Form */
            <form onSubmit={handleSignIn} className="space-y-4">
              {role === 'STUDENT' && (
                <>
                  {/* Social Sign-In Options */}
                  <div className="space-y-3">
                    <p className="text-center text-sm text-gray-600 mb-3">Sign in with</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleSocialSignIn("Google")}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="text-sm font-medium">Google</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSocialSignIn("GitHub")}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#333">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span className="text-sm font-medium">GitHub</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSocialSignIn("LinkedIn")}
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0A66C2">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/>
                        </svg>
                        <span className="text-sm font-medium">LinkedIn</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or continue with email</span>
                    </div>
                  </div>
                </>
              )}
              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-maroon mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent bg-cream"
                >
                  <option value="">Select your role</option>
                  <option value="STUDENT">Student</option>
                  <option value="TPO">TPO</option>
                  <option value="ADMIN">Admin</option>
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>

              {/* Secret Password Field (for TPO/Admin) */}
              {showSecretPasswordField && (
                <div>
                  <label htmlFor="secretPassword" className="block text-sm font-medium text-maroon mb-2">
                    Secret Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="secretPassword"
                    value={secretPassword}
                    onChange={(e) => setSecretPassword(e.target.value)}
                    placeholder="Enter secret password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent bg-cream"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Contact admin for the secret password required for this role
                  </p>
                  {errors.secretPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.secretPassword}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-maroon mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent bg-cream"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-maroon mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent bg-cream"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-maroon accent-maroon rounded focus:ring-maroon"
                  />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-maroon hover:underline"
                >
                  Forgot password?
                </button>
              </div>

            {/* reCAPTCHA */}
            <div className="my-4">
              <div id="recaptcha-container" className="flex justify-center"></div>
              {recaptchaError && (
                <p className="text-red-500 text-xs mt-2 text-center">{recaptchaError}</p>
              )}
            </div>
              <Button
                type="submit"
                className="w-full bg-maroon hover:bg-maroon/90 text-white font-semibold py-3 rounded-lg mt-6"
              >
                Sign In
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

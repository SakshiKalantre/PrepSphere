"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function SignUpPage() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  const [role, setRole] = useState("");
  const [secretPassword, setSecretPassword] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [recaptchaError, setRecaptchaError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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
    if (window.grecaptcha && document.getElementById("recaptcha-container-signup")) {
      const container = document.getElementById("recaptcha-container-signup");
      if (container && container.innerHTML === "") {
        window.grecaptcha.render("recaptcha-container-signup", {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "role") {
      setRole(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!role) newErrors.role = "Please select a role";
    if ((role === "TPO" || role === "ADMIN") && !secretPassword) {
      newErrors.secretPassword = "Secret password is required for this role";
    }
    if (role === "TPO" && secretPassword !== "Tpo@2025") {
      newErrors.secretPassword = "Invalid TPO secret password";
    }
    if (role === "ADMIN" && secretPassword !== "Admin@2025") {
      newErrors.secretPassword = "Invalid Admin secret password";
    }
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    // Basic phone validation (digits, +, - only, length 10-15)
    if (formData.phoneNumber && !/^[\d\+\-\s]{10,15}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Please enter a valid phone number";
    }
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword) newErrors.confirmPassword = "Please confirm password";
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!recaptchaToken) {
      setRecaptchaError("Please complete the reCAPTCHA verification");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          first_name: formData.fullName.split(" ")[0],
          last_name: formData.fullName.split(" ").slice(1).join(" ") || "",
          phone_number: formData.phoneNumber,
          password: formData.password,
          role: (role || "student").toLowerCase(),
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Registration failed");
      }
      setRegistrationSuccess(true);
      localStorage.setItem("pendingUser", JSON.stringify({ email: formData.email, role }));
      setIsLoading(false);
      router.push("/sign-in");
    } catch (error: any) {
      console.error("SignUp error:", error);
      setIsLoading(false);
      setErrors({ submit: error.message || "Failed to create account. Please try again." });
    }
  };

  

  const showSecretPasswordField = role === "TPO" || role === "ADMIN";

  

  

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#FFF8F2'}} className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div style={{backgroundColor: 'white'}} className="rounded-lg shadow-md p-8">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-maroon">Welcome</h1>
            <Link href="/" prefetch={false}>
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
            <Link href="/sign-in" className="flex-1" prefetch={false}>
              <Button variant="outline" className="w-full text-maroon border-maroon hover:bg-cream">
                Sign In
              </Button>
            </Link>
            <Button className="flex-1 bg-white text-maroon border-2 border-maroon hover:bg-cream">
              Sign Up
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-maroon mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={handleInputChange}
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

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-maroon mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent bg-cream"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-maroon mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent bg-cream"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              <div className="mt-2 text-xs">
                <a href="https://mail.google.com/" target="_blank" rel="noreferrer" className="text-maroon hover:underline">Verify on Gmail</a>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-maroon mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+91 1234567890"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent bg-cream"
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-maroon mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent bg-cream"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-maroon mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-maroon focus:border-transparent bg-cream"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* reCAPTCHA */}
            <div className="my-4">
              <div id="recaptcha-container-signup" className="flex justify-center"></div>
              {recaptchaError && (
                <p className="text-red-500 text-xs mt-2 text-center">{recaptchaError}</p>
              )}
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Sign Up Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-maroon hover:bg-maroon/90 text-white font-semibold py-3 rounded-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
            {registrationSuccess && (
              <div className="p-3 mt-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">Account created. Verify your email in Gmail and sign in.</div>
            )}
          </form>

          {/* Footer Text */}
          <p className="text-center text-xs text-gray-600 mt-6">
            By signing up, you agree to our <a href="#" className="text-maroon hover:underline">Terms of Service</a> and <a href="#" className="text-maroon hover:underline">Privacy Policy</a>
          </p>
          <p className="text-center text-xs text-gray-500 mt-4">We recommend verifying your email in Gmail.</p>
        </div>
      </div>
    </div>
  );
}

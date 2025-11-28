"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { login } from "../actions";

import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

export default function LoginForm() {
  const supabase = createClient();

  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      setSubmitting(true);
      setShowLoadingModal(true);

      const formData = new FormData(e.currentTarget);
      const result = await login(formData);

      setShowLoadingModal(false);

      if (!result.success) {
        setError(result.error ?? "Login failed. Please try again.");
        return;
      }

      window.location.href = result.redirect;
    } catch (err) {
      console.error("Login failed:", err);
      setShowLoadingModal(false);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setResetMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setResetMessage("Error: " + error.message);
    } else {
      setResetMessage("Reset link sent! Check your inbox.");
    }
  };

  return (
    <>
      {/* MAIN WRAPPER */}
      <div className="flex flex-col md:flex-row min-h-[75vh] justify-center items-center px-4 lg:px-8">

        {/* MOBILE VERSION */}
        <div className="md:hidden w-full flex justify-center mt-4">
          <div className="w-[92%] max-w-sm scale-[1.1] origin-top animate-[fadeIn_0.5s_ease]">

            <div className="rounded-2xl border border-slate-200 shadow-xl bg-white p-5">
              <div className="text-center space-y-1 animate-[fadeUp_0.45s_ease]">
                <h1 className="text-2xl font-semibold text-[#102E4A]">
                  <span className="font-bold text-[#E59E2C]">Welcome</span> Back!
                </h1>
                <p className="text-[#577C8E] text-xs">
                  Sign in to continue your journey
                </p>
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="mt-5 space-y-5 animate-[fadeUp_0.45s_ease]">

                {/* EMAIL */}
                <div className="grid gap-1">
                  <Label className="text-xs text-[#102E4A]">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter Email"
                      className="pl-10 rounded-xl border-slate-300 text-xs h-8 shadow-sm"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="grid gap-1">
                  <Label className="text-xs text-[#102E4A]">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      className="pl-10 pr-10 rounded-xl border-slate-300 text-xs h-8 shadow-sm"
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={submitting}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-[11px] text-[#102E4A]"
                        >
                          Forgot Password?
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Reset your password</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4">
                          <Input
                            type="email"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                          />
                          <Button type="button" onClick={handleForgotPassword}>
                            Send Reset Link
                          </Button>
                          {resetMessage && (
                            <p className="text-sm text-center text-muted-foreground">
                              {resetMessage}
                            </p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {error && <p className="text-xs text-red-600 text-center">{error}</p>}

                {/* BUTTON */}
                <Button
                  type="submit"
                  className="w-full bg-[#F3D58D] text-[#3A2D13] rounded-xl h-9 shadow-md hover:scale-[1.05] transition-all duration-300"
                  disabled={submitting}
                >
                  {submitting ? "Signing in…" : "Login"}
                </Button>

              </form>
            </div>
          </div>
        </div>

        {/* DESKTOP VERSION */}
        <div className="hidden md:flex w-full max-w-2xl justify-center animate-[fadeIn_0.5s_ease]">
          <div className="w-full border border-slate-200 rounded-3xl shadow-xl p-10 bg-white">

            <div className="text-center space-y-2">
              <h1 className="text-4xl font-semibold text-[#102E4A]">
                <span className="font-bold text-[#E59E2C]">Welcome</span> Back!
              </h1>
              <p className="text-[#577C8E]">Sign in to continue your journey</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">

              {/* EMAIL */}
              <div className="grid gap-2">
                <Label className="text-[#102E4A]">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    name="email"
                    type="email"
                    placeholder="Enter Email"
                    className="pl-10 rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="grid gap-2">
                <Label className="text-[#102E4A]">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    className="pl-10 pr-10 rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300"
                    required
                    disabled={submitting}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#102E4A]"
                    disabled={submitting}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="text-right">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-[#102E4A] font-normal"
                      >
                        Forgot Password?
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Reset your password</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 mt-2">
                        <Label>Email address</Label>
                        <Input
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                        />
                        <Button type="button" onClick={handleForgotPassword}>
                          Send Reset Link
                        </Button>
                        {resetMessage && (
                          <p className="text-sm text-center text-muted-foreground">
                            {resetMessage}
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              {/* LOGIN BUTTON */}
              <Button
                type="submit"
                className="w-full bg-[#C7D9E5] text-[#3A2D13] rounded-xl h-11 shadow-md hover:scale-[1.05] transition-all duration-300"
                disabled={submitting}
              >
                {submitting ? "Signing in…" : "Login"}
              </Button>

            </form>
          </div>
        </div>
      </div>

      {/* LOADING MODAL */}
      {showLoadingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl animate-[scaleIn_0.4s_ease]">
            <h2 className="text-lg font-medium text-gray-700 animate-pulse">
              Signing you in...
            </h2>
            <div className="mt-4 w-10 h-10 border-4 border-[#102E4A] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}
    </>
  );
}

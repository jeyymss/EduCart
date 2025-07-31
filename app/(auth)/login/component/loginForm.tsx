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
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import Link from "next/link";

export default function LoginForm() {
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const result = await login(formData);

    if (result.error) {
      setError(result.error);
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
      <div className="flex flex-col md:flex-row min-h-[75vh] justify-center items-center px-4 lg:px-8">
        {/* LEFT SIDE – Login */}
        <div className="w-full max-w-2xl flex flex-col justify-center items-center px-6">
          <div className="w-full border-2 border-[#F4EFEB] p-6 md:p-10 lg:p-12 rounded-lg">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-medium text-[#333333]">
                <span className="text-[#577C8E]">Welcome</span> Back!
              </h1>
              <p className="text-[#8692A6] text-lg">
                Sign in to continue your journey
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6 mt-6">
                {/* Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-[#333333]">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter Email"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-[#333333]">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      className="pl-10 pr-10"
                      required
                    />
                    <div
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </div>
                  </div>

                  {/* Forgot Password */}
                  <div className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-[#333333] font-normal"
                        >
                          Forgot Password?
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reset your password</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 mt-2">
                          <Label htmlFor="forgot-email">Email address</Label>
                          <Input
                            id="forgot-email"
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
                  <p className="text-sm text-red-600 text-center mt-4">
                    {error}
                  </p>
                )}

                <div className="mt-3">
                  <Button
                    type="submit"
                    className="w-full bg-[#C7D9E5] text-[#333333] hover:text-white hover:bg-[#122C4F] hover:cursor-pointer"
                  >
                    Login
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* "Create Account" on mobile only */}
          <div className="md:hidden items-center mt-5">
            <span className="text-sm">New here?</span>
            <Link href={"/signup"}>
              <Button variant="link" className="hover:cursor-pointer">
                Create Account <ArrowRight />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

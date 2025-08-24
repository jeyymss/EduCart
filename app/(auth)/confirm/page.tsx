"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, TriangleAlert, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

type State = "idle" | "verifying" | "success" | "already" | "error";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<PageFrame title="Verifying..." state="verifying" />}>
      <ConfirmEmailClient />
    </Suspense>
  );
}

function ConfirmEmailClient() {
  const sp = useSearchParams();
  const supabase = createClient();

  // A) redirect_to style → /confirm?code=...
  const code = sp.get("code");
  // B) token-hash style → /confirm?token_hash=...&type=signup
  const token_hash = sp.get("token_hash");
  const type =
    (sp.get("type") as "signup" | "recovery" | "invite" | "magiclink" | null) ??
    "signup";

  const emailFromQuery = sp.get("email") || "";

  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string>("");

  const handledRef = useRef(false);

  const origin = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    if (process.env.NEXT_PUBLIC_SITE_URL)
      return process.env.NEXT_PUBLIC_SITE_URL;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return "http://localhost:3000";
  }, []);

  // remove query params WITHOUT navigation so we don't re-run into the error branch
  const stripQuerySilently = () => {
    if (typeof window !== "undefined") {
      const { pathname, hash } = window.location;
      window.history.replaceState({}, "", pathname + hash);
    }
  };

  useEffect(() => {
    if (handledRef.current) return;

    (async () => {
      setState("verifying");

      // --- Flow A: PKCE code (auto-login by exchanging for a session) ---
      if (code) {
        handledRef.current = true;
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        await sleep(2000);
        if (error) {
          setState("error");
          setMessage(error.message || "Verification failed.");
        } else {
          setState("success");
          setMessage("You're signed in. Welcome back!");
        }
        stripQuerySilently();
        return;
      }

      // --- Flow B: token_hash verify (auto-login on success) ---
      if (token_hash && type) {
        handledRef.current = true;
        const { error } = await supabase.auth.verifyOtp({ type, token_hash });
        await sleep(2000);
        if (error) {
          const msg = (error.message || "").toLowerCase();
          if (msg.includes("already confirmed")) {
            setState("already");
            setMessage("Your email is already verified. You're signed in.");
          } else {
            setState("error");
            setMessage(error.message || "Verification failed.");
          }
        } else {
          setState("success");
          setMessage("You're signed in. Welcome to EduCart!");
        }
        stripQuerySilently();
        return;
      }

      // --- Neither param present ---
      await sleep(2000);
      setState("error");
      setMessage("Invalid or missing confirmation link.");
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, token_hash, type]);

  return (
    <PageFrame
      title={
        state === "verifying"
          ? "Verifying..."
          : state === "success"
          ? "Email Confirmed"
          : state === "already"
          ? "Email Already Confirmed"
          : "Verification Issue"
      }
      state={state}
      message={message}
    >
      {(state === "success" || state === "already") && (
        <>
          <div className="mt-6">
            <Link href="/home">
              <Button className="w-full bg-[#E59E2C] hover:bg-[#d08a1c] text-white font-medium py-2 rounded-lg">
                Go to Home
              </Button>
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            You&apos;re now signed in on this device.
          </p>
        </>
      )}

      {state === "error" && (
        <>
          <div className="mt-6">
            <ResendConfirmation
              origin={origin}
              emailFromQuery={emailFromQuery}
            />
          </div>
          <div className="pt-3">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </div>
        </>
      )}
    </PageFrame>
  );
}

function PageFrame({
  title,
  state,
  message,
  children,
}: {
  title: string;
  state?: State;
  message?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center border border-gray-200">
        <div className="flex justify-center mb-4">
          {state === "verifying" && (
            <Loader2 className="w-14 h-14 animate-spin text-gray-500" />
          )}
          {state === "success" && (
            <CheckCircle2 className="w-14 h-14 text-green-500" />
          )}
          {state === "already" && (
            <CheckCircle2 className="w-14 h-14 text-emerald-500" />
          )}
          {state === "error" && (
            <TriangleAlert className="w-14 h-14 text-red-500" />
          )}
        </div>

        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>

        {typeof message === "string" && (
          <p className="mt-2 text-gray-600">
            {state === "verifying" &&
              "Please wait while we confirm your email."}
            {(state === "success" || state === "already") && (
              <>
                {message} <br />
                Use the button below to continue.
              </>
            )}
            {state === "error" && (
              <>
                {message}
                <br />
                The link may have expired (OTP is short-lived) or was already
                used.
              </>
            )}
          </p>
        )}

        {children}
      </div>
    </div>
  );
}

/* -------------------------- Resend UI -------------------------- */

function ResendConfirmation({
  origin,
  emailFromQuery,
}: {
  origin: string;
  emailFromQuery?: string;
}) {
  const supabase = createClient();
  const [email, setEmail] = useState(emailFromQuery ?? "");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) return;
    setSending(true);
    setErr(null);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          // Ignored if your email template uses token-hash (which is fine).
          emailRedirectTo: `${origin}/confirm?email=${encodeURIComponent(
            email
          )}`,
        },
      });
      if (error) throw error;
      setDone(true);
      setCooldown(45);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to resend email.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-left">
        <div className="flex items-center gap-2 text-green-700 font-medium">
          <CheckCircle2 className="w-5 h-5" />
          New confirmation link sent
        </div>
        <p className="text-sm text-green-700 mt-1">
          Check your inbox (and spam folder). The link expires quickly.
        </p>
        {cooldown > 0 && (
          <p className="text-xs text-green-700 mt-1">
            You can resend again in {cooldown}s.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="text-left">
      <label className="block text-sm text-gray-700 mb-1">
        Need a new link?
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E59E2C]"
          />
        </div>
        <Button
          onClick={handleResend}
          disabled={sending || !email || cooldown > 0}
          className="bg-gray-900 hover:bg-black text-white"
        >
          {sending
            ? "Sending..."
            : cooldown > 0
            ? `Wait ${cooldown}s`
            : "Resend"}
        </Button>
      </div>
      {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
      <p className="text-xs text-gray-500 mt-2">
        Tip: Use the same email you registered with. Links typically expire in a
        few minutes.
      </p>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { register } from "../actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = "Student" | "Faculty" | "Alumni";
type Uni = { id: number; abbreviation: string; domain: string };

const steps = ["Account Type", "University", "Valid ID", "Password", "Review"] as const;

// Palette
const COLOR_DONE = "#577C8E";
const COLOR_CURRENT = "#102E4A";
const COLOR_UPCOMING = "#DEDEDE";
const COLOR_NEXT_OK = "#C7D9E5";

/* ===================== Helpers ===================== */

// Strong email check + special guard for incomplete Gmail like ".c" or ".co"
function emailLooksValid(val: string) {
  const v = val.trim();
  if (!v || v.endsWith(".") || v.endsWith("@")) return false;

  // basic RFC-ish pattern with TLD >= 2
  const basic = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!basic.test(v)) return false;

  const [, domain] = v.split("@");
  if (!domain || domain.includes("..")) return false;

  const labels = domain.split(".");
  if (
    !labels.every(
      (l) => l.length > 0 && /^[A-Z0-9-]+$/i.test(l) && !l.startsWith("-") && !l.endsWith("-")
    )
  ) {
    return false;
  }

  // block incomplete Gmail ".c" or ".co" while typing
  if (/@gmail\.(c|co)$/i.test(v)) return false;

  return true;
}

// ensure it always returns "@host.tld" (lower-cased)
function normalizeDomain(d?: string) {
  const v = (d || "").trim().toLowerCase();
  if (!v) return "";
  return v.startsWith("@") ? v : `@${v}`;
}

// returns "host.tld" (no leading "@") for display
function cleanDomainForExample(d?: string) {
  const v = normalizeDomain(d);
  return v.startsWith("@") ? v.slice(1) : v;
}

/* ===================== Component ===================== */

export default function SignUpForm() {
  // data
  const [universities, setUniversities] = useState<Uni[]>([]);

  // form state
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);

  const [idImage, setIdImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"Verified" | "Failed" | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  // UI state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // inline errors
  const [emailError, setEmailError] = useState("");
  const [emailDomainError, setEmailDomainError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // fetch universities
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("universities")
        .select("id, abbreviation, domain")
        .order("abbreviation", { ascending: true });
      setUniversities(data ?? []);
    })();
  }, []);

  const selectedUniversity = useMemo(
    () => universities.find((u) => String(u.id) === selectedUniversityId) || null,
    [universities, selectedUniversityId]
  );

  function validateEmailInline(value: string) {
    if (!value.trim()) return "Email is required.";
    if (!emailLooksValid(value)) return "Not a valid email address.";
    return "";
  }

  // domain error sync
  useEffect(() => {
    const needsDomain = selectedRole === "Student" || selectedRole === "Faculty";
    const uniDomain = normalizeDomain(selectedUniversity?.domain);
    const uniExample = cleanDomainForExample(selectedUniversity?.domain);

    if (!needsDomain || !uniDomain) {
      setEmailDomainError("");
      return;
    }
    if (!email || !emailLooksValid(email)) {
      setEmailDomainError("");
      return;
    }
    if (!email.toLowerCase().endsWith(uniDomain)) {
      setEmailDomainError(`Use your university email (e.g., *@${uniExample}).`);
    } else {
      setEmailDomainError("");
    }
  }, [email, selectedRole, selectedUniversity]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setIdImage(f);
    setPreviewUrl(URL.createObjectURL(f));
    setVerificationStatus(null);
  }

  async function verifyID() {
    if (!idImage || !fullName) return;
    setIsVerifying(true);
    setVerificationStatus(null);

    try {
      const fd = new FormData();
      fd.append("image", idImage);
      const res = await fetch("https://ocr-verification.up.railway.app/api/ocr", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      const extracted = data?.Name?.toLowerCase().trim();
      const typed = fullName.toLowerCase().trim();
      setVerificationStatus(extracted && typed && extracted === typed ? "Verified" : "Failed");
    } catch (e) {
      console.error(e);
      setVerificationStatus("Failed");
    } finally {
      setIsVerifying(false);
    }
  }

  // strict gating per step
  const stepIsValid = useMemo(() => {
    if (activeStep === 0) {
      // If a uni is already chosen (user navigated back), enforce domain here too.
      const uniDomain = normalizeDomain(selectedUniversity?.domain);
      const domainOK =
        !selectedUniversity ||
        selectedRole === "Alumni" ||
        (emailLooksValid(email) && uniDomain && email.toLowerCase().endsWith(uniDomain));

      return (
        !!selectedRole &&
        !!fullName &&
        emailLooksValid(email) &&
        emailError === "" &&
        (emailDomainError === "" || domainOK)
      );
    }
    if (activeStep === 1) {
      // Require university AND domain match (for Student/Faculty).
      const needsDomain = selectedRole === "Student" || selectedRole === "Faculty";
      const uniDomain = normalizeDomain(selectedUniversity?.domain);
      const domainOK =
        !needsDomain ||
        !selectedUniversity ||
        (emailLooksValid(email) && uniDomain && email.toLowerCase().endsWith(uniDomain));

      return !!selectedUniversityId && domainOK;
    }
    if (activeStep === 2) return !!idImage && verificationStatus === "Verified";
    if (activeStep === 3) {
      const strongEnough = password.length >= 8;
      return strongEnough && confirmPassword === password && agree;
    }
    if (activeStep === 4) return true;
    return false;
  }, [
    activeStep,
    selectedRole,
    fullName,
    email,
    emailError,
    emailDomainError,
    selectedUniversity,
    selectedUniversityId,
    idImage,
    verificationStatus,
    password,
    confirmPassword,
    agree,
  ]);

  function next() {
    if (!stepIsValid) return;
    setError(null);
    if (activeStep < steps.length - 1) setActiveStep((s) => s + 1);
  }
  function prev() {
    setError(null);
    if (activeStep > 0) setActiveStep((s) => s - 1);
  }

  // submit (no backend changes)
  async function onSubmitFinal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stepIsValid) return;

    if (!selectedRole) return setError("Please select a role.");
    if (!selectedUniversity) return setError("Please select a university.");

    const uniDomain = normalizeDomain(selectedUniversity.domain);
    if (
      (selectedRole === "Student" || selectedRole === "Faculty") &&
      uniDomain &&
      !email.toLowerCase().endsWith(uniDomain)
    ) {
      return setError(`Email must end with ${uniDomain}`);
    }
    if (password !== confirmPassword) return setError("Passwords do not match.");
    if (verificationStatus !== "Verified") return setError("Please verify your ID.");

    const formData = new FormData();
    formData.append("role", selectedRole);
    formData.append("name", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);
    formData.append("university", String(selectedUniversity.id));
    formData.append("verificationStatus", "Verified");
    if (idImage) formData.append("idImage", idImage);

    setLoading(true);
    setShowLoadingModal(true);
    const res = await register(formData);
    setShowLoadingModal(false);
    setLoading(false);

    if (res?.error) return setError(res.error);
    setShowSuccessModal(true);
  }

  // stepper visual
  const Stepper = () => (
    <div className="flex items-center gap-3">
      {steps.map((_, i) => {
        const state =
          i < activeStep ? "done" : i === activeStep ? "current" : "upcoming";
        const dotColor =
          state === "current" ? COLOR_CURRENT : state === "done" ? COLOR_DONE : COLOR_UPCOMING;
        const dashColor = i < activeStep ? COLOR_DONE : COLOR_UPCOMING;
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: dotColor }} />
            {i !== steps.length - 1 && (
              <span className="h-[2px] w-10 rounded-full" style={{ backgroundColor: dashColor }} />
            )}
          </div>
        );
      })}
    </div>
  );

  // aria helper to avoid empty ids
  const emailDescribedBy =
    [emailError ? "email-error" : "", !emailError && emailDomainError ? "email-domain-error" : ""]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <>
      <div className="w-full min-h-screen flex items-start justify-center px-6 py-8 md:py-14">
        <div className="w-full max-w-2xl">
          {/* Make the card a column so the footer stays fixed and height is uniform */}
          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="p-6 md:p-8 flex flex-col min-h-[640px]">
              {/* stepper */}
              <div className="mt-2 mb-6">
                <Stepper />
              </div>

              {/* title */}
              <h1 className="text-3xl md:text-[32px] font-semibold tracking-tight">
                <span className="font-bold" style={{ color: COLOR_DONE }}>Create</span> an Account
              </h1>
              <p className="mt-1 text-slate-500">Get started in less than 5 minutes</p>

              {/* STEP CONTENT */}
              <form onSubmit={onSubmitFinal} className="mt-6 flex-1 flex flex-col">
                {/* Give the content area a consistent min height so the card doesn't jump */}
                <div className="space-y-6 flex-1 min-h-[360px]">
                  {/* STEP 0 */}
                  {activeStep === 0 && (
                    <div className="space-y-5">
                      <div>
                        <Label className="text-sm">I am a:</Label>
                        <div className="mt-2 flex gap-3">
                          {(["Student", "Faculty", "Alumni"] as Role[]).map((r) => {
                            const isActive = selectedRole === r;
                            return (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setSelectedRole(r)}
                                className={`rounded-full px-4 py-2 border transition
                                  ${isActive ? "text-white" : "text-slate-700 bg-white"}
                                `}
                                style={{
                                  borderColor: isActive ? COLOR_CURRENT : "#e5e7eb",
                                  backgroundColor: isActive ? COLOR_CURRENT : undefined,
                                }}
                              >
                                {r}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="name">Full name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Enter Full Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                        <p className="text-xs text-slate-500">
                          Do not include your middle initial.
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="@university.edu.ph"
                          value={email}
                          onChange={(e) => {
                            const v = e.target.value;
                            setEmail(v);
                            setEmailError(validateEmailInline(v));
                          }}
                          required
                          aria-invalid={!!(emailError || emailDomainError)}
                          aria-describedby={emailDescribedBy}
                        />
                        {emailError && (
                          <p id="email-error" className="text-xs text-red-600">{emailError}</p>
                        )}
                        {!emailError && emailDomainError && (
                          <p id="email-domain-error" className="text-xs text-red-600">{emailDomainError}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 1 */}
                  {activeStep === 1 && (
                    <div className="space-y-5">
                      <div className="grid gap-2">
                        <Label>University</Label>
                        <Select
                          onValueChange={setSelectedUniversityId}
                          value={selectedUniversityId ?? undefined}
                          name="university"
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select University" />
                          </SelectTrigger>
                          <SelectContent>
                            {universities.map((u) => (
                              <SelectItem key={u.id} value={String(u.id)}>
                                {u.abbreviation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {emailDomainError && (
                          <p className="text-xs text-red-600">{emailDomainError}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEP 2 - ID Upload (only ONE Verify ID button — the overlay) */}
                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <Label>Upload Valid ID</Label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 h-40 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-center cursor-pointer"
                      >
                        {previewUrl ? (
                          <div className="relative h-full w-full overflow-hidden rounded-xl">
                            <Image src={previewUrl} alt="ID Preview" fill className="object-cover" />
                            <div className="absolute bottom-2 right-2">
                              {isVerifying ? (
                                <span className="text-xs bg-white/80 px-2 py-1 rounded">Verifying…</span>
                              ) : verificationStatus ? (
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    verificationStatus === "Verified"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {verificationStatus === "Verified" ? "✔ Verified" : "✖ Failed"}
                                </span>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="secondary"
                                  className="text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    verifyID();
                                  }}
                                >
                                  Verify ID
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-slate-500">
                            <div className="mb-1 text-2xl">⬆</div>
                            <div>Click to upload your ID or drag and drop</div>
                            <div className="text-xs">PNG or JPG up to 10MB</div>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        name="idImage"
                        onChange={onFileChange}
                      />
                      <p className="text-xs text-slate-500">
                        This ID will be used for verification purposes.
                      </p>
                    </div>
                  )}

                  {/* STEP 3 - Passwords (aligned) */}
                  {activeStep === 3 && (
                    <div className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Password"
                            required
                          />
                          <p className="text-xs text-slate-500">At least 8 characters</p>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                          />
                          {/* keep an empty spacer line to keep heights equal */}
                          <p className="text-xs invisible select-none">spacer</p>
                        </div>
                      </div>

                      <label className="flex items-start gap-3 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={agree}
                          onChange={(e) => setAgree(e.target.checked)}
                        />
                        <span>
                          I agree with the <a className="underline">Terms of Service</a> and{" "}
                          <a className="underline">Privacy Policy</a>
                        </span>
                      </label>
                    </div>
                  )}

                  {/* STEP 4 */}
                  {activeStep === 4 && (
                    <div className="space-y-4 text-sm">
                      <div className="rounded-lg border p-4">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-slate-500">Role</span>
                          <span className="font-medium">{selectedRole || "—"}</span>

                          <span className="text-slate-500">Full Name</span>
                          <span className="font-medium">{fullName || "—"}</span>

                          <span className="text-slate-500">Email</span>
                          <span className="font-medium break-all">{email || "—"}</span>

                          <span className="text-slate-500">University</span>
                          <span className="font-medium">{selectedUniversity?.abbreviation || "—"}</span>

                          <span className="text-slate-500">ID Status</span>
                          <span className="font-medium">
                            {verificationStatus || (idImage ? "Not verified" : "No file")}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">Make sure your details are correct before registering.</p>
                    </div>
                  )}

                  {/* global error */}
                  {error && <p className="text-sm text-red-600">{error}</p>}

                  {/* hidden mirrors for final submit */}
                  <input type="hidden" name="role" value={selectedRole} />
                  <input type="hidden" name="name" value={fullName} />
                  <input type="hidden" name="email" value={email} />
                  {selectedUniversity && (
                    <input type="hidden" name="university" value={String(selectedUniversity.id)} />
                  )}
                  <input type="hidden" name="password" value={password} />
                  <input type="hidden" name="confirmPassword" value={confirmPassword} />
                  {verificationStatus === "Verified" && (
                    <input type="hidden" name="verificationStatus" value="Verified" />
                  )}
                </div>

                {/* FOOTER (fixed place; card height uniform) */}
                <div className="mt-4 flex items-center justify-between">
                  <button
                    type="button"
                    className="rounded-md px-4 py-2 border bg-white text-slate-600 disabled:opacity-60"
                    onClick={prev}
                    disabled={activeStep === 0}
                  >
                    Previous
                  </button>

                  {activeStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={next}
                      disabled={!stepIsValid}
                      className="rounded-md px-6 py-2 text-slate-900 disabled:text-slate-600"
                      style={{
                        backgroundColor: stepIsValid ? COLOR_NEXT_OK : COLOR_UPCOMING,
                        cursor: stepIsValid ? "pointer" : "not-allowed",
                      }}
                    >
                      Next
                    </button>
                  ) : (
                    <Button type="submit" disabled={loading || !stepIsValid}>
                      {loading ? "Registering..." : "Register"}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="mt-4 text-center text-slate-600">
            Register an Organization?{" "}
            <Link href="/organization-signup" className="font-medium" style={{ color: COLOR_DONE }}>
              Create
            </Link>
          </p>
        </div>
      </div>

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4">
            <h2 className="text-lg font-medium text-gray-700 animate-pulse">Creating your account...</h2>
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4">
            <h2 className="text-xl font-bold text-green-700">Registered Successfully!</h2>
            <p className="text-sm text-gray-600">Please check your email to confirm your account.</p>
            <Link href="/login">
              <Button className="w-full">Close</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
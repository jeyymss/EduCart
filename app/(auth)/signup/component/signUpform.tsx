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
import { Eye, EyeOff } from "lucide-react";

import TermsPrivacyDialog from "@/components/auth/TermsPrivacyDialog";

type Role = "Student" | "Faculty" | "Alumni";
type Uni = { id: number; abbreviation: string; domain: string };

const steps = ["Account Type", "Valid ID", "Password", "Review"] as const;

function emailLooksValid(val: string) {
  const v = val.trim();
  if (!v || v.endsWith(".") || v.endsWith("@")) return false;

  const basic = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!basic.test(v)) return false;

  const [, domain] = v.split("@");
  if (!domain || domain.includes("..")) return false;

  const labels = domain.split(".");
  if (!labels.every((l) => l.length > 0 && /^[A-Z0-9-]+$/i.test(l))) return false;

  return true;
}

function normalizeDomain(d?: string) {
  const v = (d || "").trim().toLowerCase();
  return v.startsWith("@") ? v : `@${v}`;
}

function cleanDomainForExample(d?: string) {
  const v = normalizeDomain(d);
  return v.startsWith("@") ? v.slice(1) : v;
}

export default function SignUpForm() {
  const [universities, setUniversities] = useState<Uni[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedUniversityId, setSelectedUniversityId] =
    useState<string | null>(null);

  const [idImage, setIdImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] =
    useState<"Verified" | "Failed" | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emailError, setEmailError] = useState("");
  const [emailDomainError, setEmailDomainError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUni = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("universities")
        .select("id, abbreviation, domain")
        .order("abbreviation", { ascending: true });
      setUniversities(data ?? []);
    };
    fetchUni();
  }, []);

  const selectedUniversity = useMemo(
    () =>
      universities.find((u) => String(u.id) === selectedUniversityId) || null,
    [universities, selectedUniversityId]
  );

  function validateEmailInline(v: string) {
    if (!v.trim()) return "Email is required.";
    if (!emailLooksValid(v)) return "Not a valid email.";
    return "";
  }

  useEffect(() => {
    const needsDomain =
      selectedRole === "Student" || selectedRole === "Faculty";
    const uniDomain = normalizeDomain(selectedUniversity?.domain);
    const uniExample = cleanDomainForExample(selectedUniversity?.domain);

    if (!needsDomain || !uniDomain) return setEmailDomainError("");
    if (!email || !emailLooksValid(email)) return setEmailDomainError("");

    if (!email.toLowerCase().endsWith(uniDomain)) {
      setEmailDomainError(`Use your university email (e.g., *@${uniExample}).`);
    } else setEmailDomainError("");
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
    setError(null);

    try {
      const fd = new FormData();
      fd.append("image", idImage);

      const res = await fetch(
        "https://ocr-verification2.up.railway.app/api/ocr",
        { method: "POST", body: fd }
      );

      const data = await res.json();
      const extracted = data?.Name?.toLowerCase().trim();
      const typed = fullName.toLowerCase().trim();

      const match = extracted && typed && extracted === typed;

      setVerificationStatus(match ? "Verified" : "Failed");

      if (!match) {
        setError("Please make sure your entered name matches your ID.");
      }
    } catch {
      setVerificationStatus("Failed");
    } finally {
      setIsVerifying(false);
    }
  }

  const stepIsValid = useMemo(() => {
    if (activeStep === 0) {
      const needsDomain =
        selectedRole === "Student" || selectedRole === "Faculty";
      const uniDomain = normalizeDomain(selectedUniversity?.domain);

      const domainOk =
        !needsDomain ||
        (email &&
          emailLooksValid(email) &&
          uniDomain &&
          email.toLowerCase().endsWith(uniDomain));

      return (
        selectedRole &&
        selectedUniversityId &&
        fullName &&
        emailLooksValid(email) &&
        domainOk &&
        !emailError
      );
    }

    if (activeStep === 1) return idImage && verificationStatus === "Verified";

    if (activeStep === 2)
      return password.length >= 8 && password === confirmPassword && agree;

    return true;
  }, [
    activeStep,
    selectedRole,
    selectedUniversityId,
    fullName,
    email,
    emailError,
    selectedUniversity,
    idImage,
    verificationStatus,
    password,
    confirmPassword,
    agree,
  ]);

  function next() {
    if (stepIsValid && activeStep < 3) setActiveStep((s) => s + 1);
  }

  function prev() {
    if (activeStep > 0) setActiveStep((s) => s - 1);
  }

  async function onSubmitFinal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stepIsValid) return;

    if (!selectedUniversity || !selectedRole)
      return setError("Missing required fields.");

    const fd = new FormData();
    fd.append("role", selectedRole);
    fd.append("name", fullName);
    fd.append("email", email);
    fd.append("password", password);
    fd.append("confirmPassword", confirmPassword);
    fd.append("university", String(selectedUniversity.id));
    fd.append("verificationStatus", "Verified");
    if (idImage) fd.append("idImage", idImage);

    setLoading(true);
    setShowLoadingModal(true);
    const res = await register(fd);
    setLoading(false);
    setShowLoadingModal(false);

    if (res?.error) return setError(res.error);

    setShowSuccessModal(true);
  }

  const Stepper = () => (
    <div className="flex gap-3">
      {steps.map((_, i) => {
        const state =
          i < activeStep ? "done" : i === activeStep ? "current" : "upcoming";

        return (
          <div
            key={i}
            className={`
              h-2 rounded-full transition-all duration-700
              ${state === "current" ? "w-8 bg-[#102E4A]" : ""}
              ${state === "done" ? "w-6 bg-[#577C8E]" : ""}
              ${state === "upcoming" ? "w-4 bg-[#DEDEDE]" : ""}
            `}
          />
        );
      })}
    </div>
  );

  return (
    <>
      <div className="w-full min-h-screen flex items-start justify-center px-3 md:px-6 py-6 md:py-14 bg-white">

        {/* MOBILE VERSION */}
        <div className="md:hidden w-full flex justify-center">
          <div className="w-[92%] max-w-xs scale-[1.1] origin-top">
            <Card className="rounded-2xl border border-slate-200 shadow-xl bg-white animate-[fadeIn_0.5s_ease]">
              <CardContent className="p-3 flex flex-col min-h-[500px]">

                <div className="mt-1 mb-4 scale-[0.85]">
                  <Stepper />
                </div>

                <h1 className="text-xl font-semibold text-[#102E4A]">
                  <span className="font-bold text-[#E59E2C]">Create</span> Account
                </h1>
                <p className="mt-1 text-slate-600 text-xs">
                  Get started in less than 5 minutes
                </p>

                {/* MOBILE FORM */}
                <form onSubmit={onSubmitFinal} className="mt-4 flex-1 flex flex-col">
                  <div key={activeStep} className="space-y-4 flex-1 animate-[fadeUp_0.45s_ease]">

                    {/* STEP 0 */}
                    {activeStep === 0 && (
                      <div className="space-y-4">

                        {/* ROLE */}
                        <div>
                          <Label className="text-xs mb-1 block">I am a:</Label>
                          <div className="flex gap-1.5">
                            {(["Student", "Faculty", "Alumni"] as Role[]).map((r) => {
                              const active = selectedRole === r;
                              return (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => setSelectedRole(r)}
                                  className={`
                                    px-3 py-2 rounded-xl border text-xs shadow-sm 
                                    ${active ? "bg-[#102E4A] text-white" : "bg-white border-slate-300 text-slate-700"}
                                  `}
                                >
                                  {r}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* UNIVERSITY FIXED DROPDOWN */}
                        <div className="grid gap-1.5">
                          <Label className="text-xs">University</Label>

                          <Select
                            value={selectedUniversityId ?? undefined}
                            onValueChange={setSelectedUniversityId}
                          >
                            <SelectTrigger className="rounded-xl border-slate-300 text-xs h-8 px-2">
                              <SelectValue placeholder="Select University" />
                            </SelectTrigger>

                            <SelectContent
                              className="
                                p-0
                                w-[160px]
                                [&_*]:text-xs           
                                [&_*]:leading-tight    
                                [&_*]:h-6              
                                [&_*]:px-2
                                [&>div]:p-0
                              "
                            >
                              {universities.map((u) => (
                                <SelectItem
                                  key={u.id}
                                  value={String(u.id)}
                                  className="text-xs h-6 px-2"
                                >
                                  {u.abbreviation}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* FULL NAME */}
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Full name</Label>
                          <Input
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="rounded-xl border-slate-300 text-xs h-8"
                            placeholder="Enter Full Name"
                          />
                        </div>

                        {/* EMAIL */}
                        <div className="grid gap-1.5">
                          <Label className="text-xs">Email Address</Label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              setEmailError(validateEmailInline(e.target.value));
                            }}
                            className="rounded-xl border-slate-300 text-xs h-8"
                            placeholder="@university.edu.ph"
                          />
                          {emailError && (
                            <p className="text-[10px] text-red-600">{emailError}</p>
                          )}
                          {emailDomainError && !emailError && (
                            <p className="text-[10px] text-red-600">{emailDomainError}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* STEP 1 — MOBILE */}
                    {activeStep === 1 && (
                      <div className="space-y-2">
                        <Label className="text-xs">Upload Valid ID</Label>

                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-1 h-36 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-center cursor-pointer"
                        >
                          {previewUrl ? (
                            <div className="relative h-full w-full overflow-hidden rounded-2xl">
                              <Image
                                src={previewUrl}
                                alt="ID Preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="text-slate-500 text-xs">
                              <div className="text-lg mb-1">⬆</div>
                              Tap to upload
                            </div>
                          )}
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onFileChange}
                        />

                        {previewUrl && (
                          <div className="flex justify-end items-center gap-2 mt-1">
                            {isVerifying && (
                              <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded">
                                Verifying…
                              </span>
                            )}

                            {!isVerifying && verificationStatus === "Verified" && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-green-100 text-green-700">
                                ✔ Verified
                              </span>
                            )}

                            {!isVerifying && verificationStatus === "Failed" && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-700">
                                ✖ Failed
                              </span>
                            )}

                            {!isVerifying && !verificationStatus && (
                              <Button
                                type="button"
                                size="sm"
                                className="text-[10px] h-6"
                                onClick={verifyID}
                              >
                                Verify ID
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* STEP 2 — MOBILE */}
                    {activeStep === 2 && (
                      <div className="space-y-4">

                        {/* PASSWORD */}
                        <div className="grid gap-2">
                          <Label className="text-xs">Password</Label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="rounded-xl border-slate-300 text-xs h-8 pr-8"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600"
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="grid gap-2">
                          <Label className="text-xs">Confirm Password</Label>
                          <div className="relative">
                            <Input
                              type={showConfirm ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="rounded-xl border-slate-300 text-xs h-8 pr-8"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((s) => !s)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600"
                            >
                              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* AGREEMENT */}
                        <label className="flex items-start gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={agree}
                            onChange={(e) => setAgree(e.target.checked)}
                            className="mt-0.5 scale-[0.85]"
                          />
                          <span>
                            I agree with the <TermsPrivacyDialog />
                          </span>
                        </label>

                      </div>
                    )}

                    {/* STEP 3 — MOBILE */}
                    {activeStep === 3 && (
                      <div className="space-y-2 text-xs">
                        <div className="rounded-xl border p-3 shadow-sm bg-white">
                          <div className="grid grid-cols-2 gap-1 text-[11px]">
                            <span className="text-slate-500">Role</span>
                            <span className="font-medium">{selectedRole}</span>

                            <span className="text-slate-500">Full Name</span>
                            <span className="font-medium">{fullName}</span>

                            <span className="text-slate-500">Email</span>
                            <span className="font-medium">{email}</span>

                            <span className="text-slate-500">University</span>
                            <span className="font-medium">
                              {selectedUniversity?.abbreviation}
                            </span>

                            <span className="text-slate-500">ID Status</span>
                            <span className="font-medium">{verificationStatus}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <p className="text-xs text-red-600">{error}</p>
                    )}

                  </div>

                  {/* MOBILE BUTTONS */}
                  <div className="mt-4 flex justify-between items-center">
                    {activeStep > 0 ? (
                      <button
                        type="button"
                        onClick={prev}
                        className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm text-xs"
                      >
                        Previous
                      </button>
                    ) : (
                      <div />
                    )}

                    {activeStep < 3 ? (
                      <button
                        type="button"
                        onClick={next}
                        disabled={!stepIsValid}
                        className={`
                          px-4 py-2 rounded-lg text-[#3A2D13] text-xs font-medium shadow-md
                          ${
                            stepIsValid
                              ? "bg-[#C7D9E5]"
                              : "bg-[#C7D9E5] text-[#AFA78F] cursor-not-allowed"
                          }
                        `}
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={!stepIsValid || loading}
                        className="px-4 py-2 rounded-lg bg-[#102E4A] text-white text-xs shadow-md"
                      >
                        {loading ? "Registering..." : "Register"}
                      </button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* MOBILE LINK */}
            <p className="md:hidden mt-4 text-center text-slate-600 text-xs">
              Register an Organization?{" "}
              <Link href="/organization-signup" className="font-medium text-[#577C8E]">
                Create
              </Link>
            </p>
          </div>
        </div>

        {/* DESKTOP VERSION */}
        <div className="hidden md:block w-full max-w-4xl">
          <Card className="rounded-3xl border border-slate-200 shadow-xl bg-white animate-[fadeIn_0.5s_ease]">
            <CardContent className="p-8 flex flex-col min-h-[500px]">

              {/* DESKTOP STEPPER */}
              <div className="mt-2 mb-6">
                <Stepper />
              </div>

              <h1 className="text-3xl md:text-[32px] font-semibold tracking-tight text-[#102E4A]">
                <span className="font-bold text-[#E59E2C]">Create</span> an Account
              </h1>
              <p className="mt-1 text-slate-600">
                Get started in less than 5 minutes
              </p>

              {/* DESKTOP FORM */}
              <form onSubmit={onSubmitFinal} className="mt-6 flex-1 flex flex-col">
                <div key={activeStep} className="space-y-6 flex-1 animate-[fadeUp_0.45s_ease]">

                  {/* STEP 0 — DESKTOP */}
                  {activeStep === 0 && (
                    <div className="space-y-6">

                      <div>
                        <Label className="text-sm mb-1 block">I am a:</Label>
                        <div className="flex gap-3">
                          {(["Student", "Faculty", "Alumni"] as Role[]).map((r) => {
                            const active = selectedRole === r;
                            return (
                              <button
                                key={r}
                                type="button"
                                onClick={() => setSelectedRole(r)}
                                className={`
                                  px-5 py-2.5 rounded-xl border shadow-sm 
                                  transition-all duration-300 ease-out
                                  ${
                                    active
                                      ? "bg-[#102E4A] text-white border-[#102E4A] shadow-md scale-[1.06]"
                                      : "bg-white border-slate-300 text-slate-700 hover:scale-[1.05] hover:bg-slate-50"
                                  }
                                `}
                              >
                                {r}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>University</Label>

                        <Select
                          value={selectedUniversityId ?? undefined}
                          onValueChange={setSelectedUniversityId}
                        >
                          <SelectTrigger className="rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 focus:ring-2 focus:ring-[#102E4A]">
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

                      </div>

                      <div className="grid gap-2">
                        <Label>Full name</Label>
                        <Input
                          placeholder="Enter Full Name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300"
                        />
                        <p className="text-xs text-slate-500">
                          Do not include your middle initial.
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label>Email Address</Label>
                        <Input
                          type="email"
                          placeholder="@university.edu.ph"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError(validateEmailInline(e.target.value));
                          }}
                          className="rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300"
                        />
                        {emailError && (
                          <p className="text-xs text-red-600">{emailError}</p>
                        )}
                        {emailDomainError && !emailError && (
                          <p className="text-xs text-red-600">
                            {emailDomainError}
                          </p>
                        )}
                      </div>

                    </div>
                  )}

                  {/* STEP 1 — DESKTOP */}
                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <Label>Upload Valid ID</Label>

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 h-44 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center text-center cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-slate-50"
                      >
                        {previewUrl ? (
                          <div className="relative h-full w-full overflow-hidden rounded-2xl">
                            <Image
                              src={previewUrl}
                              alt="ID Preview"
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="text-slate-500">
                            <div className="mb-1 text-2xl">⬆</div>
                            <div>Click to upload your ID</div>
                            <div className="text-xs">PNG or JPG up to 10MB</div>
                          </div>
                        )}
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onFileChange}
                      />

                      {previewUrl && (
                        <div className="mt-2 flex items-center justify-end gap-3">
                          {isVerifying && (
                            <span className="text-xs bg-white/80 px-2 py-1 rounded">
                              Verifying…
                            </span>
                          )}

                          {!isVerifying && verificationStatus === "Verified" && (
                            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                              ✔ Verified
                            </span>
                          )}

                          {!isVerifying && verificationStatus === "Failed" && (
                            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                              ✖ Failed
                            </span>
                          )}

                          {!isVerifying && !verificationStatus && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="text-xs"
                              onClick={verifyID}
                            >
                              Verify ID
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 2 — DESKTOP (PASSWORD ALIGNMENT FIX) */}
                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">

                        <div className="grid gap-2">
                          <Label>Password</Label>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 pr-10"
                              placeholder="Enter Password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#102E4A] transition"
                            >
                              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>Confirm Password</Label>
                          <div className="relative">
                            <Input
                              type={showConfirm ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              className="rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 pr-10"
                              placeholder="Confirm Password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((s) => !s)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#102E4A] transition"
                            >
                              {showConfirm ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* helper text UNDER both fields */}
                      <p className="text-xs text-slate-500">
                        At least 8 characters
                      </p>

                      <label className="flex items-start gap-3 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={agree}
                          onChange={(e) => setAgree(e.target.checked)}
                        />
                        <span>
                          I agree with the <TermsPrivacyDialog />
                        </span>
                      </label>
                    </div>
                  )}

                  {/* STEP 3 — DESKTOP */}
                  {activeStep === 3 && (
                    <div className="space-y-4 text-sm">
                      <div className="rounded-xl border p-4 shadow-sm bg-white">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-slate-500">Role</span>
                          <span className="font-medium">{selectedRole}</span>

                          <span className="text-slate-500">Full Name</span>
                          <span className="font-medium">{fullName}</span>

                          <span className="text-slate-500">Email</span>
                          <span className="font-medium">{email}</span>

                          <span className="text-slate-500">University</span>
                          <span className="font-medium">
                            {selectedUniversity?.abbreviation}
                          </span>

                          <span className="text-slate-500">ID Status</span>
                          <span className="font-medium">{verificationStatus}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500">
                        Ensure your details are correct before proceeding.
                      </p>
                    </div>
                  )}

                  {error && <p className="text-sm text-red-600">{error}</p>}

                </div>

                {/* DESKTOP BUTTONS */}
                <div className="mt-6 flex justify-between items-center">
                  {activeStep > 0 ? (
                    <button
                      type="button"
                      onClick={prev}
                      className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.05]"
                    >
                      Previous
                    </button>
                  ) : (
                    <div />
                  )}

                  {activeStep < 3 ? (
                    <button
                      type="button"
                      onClick={next}
                      disabled={!stepIsValid}
                      className={`
                        px-6 py-2 rounded-lg text-[#3A2D13] font-medium shadow-md 
                        transition-all duration-300
                        ${
                          stepIsValid
                            ? "bg-[#C7D9E5] hover:bg-[#E8C986] hover:scale-[1.07]"
                            : "bg-[#C7D9E5] text-[#AFA78F] cursor-not-allowed shadow-sm"
                        }
                      `}
                    >
                      Next
                    </button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={!stepIsValid || loading}
                      className="px-6 py-2 rounded-lg bg-[#102E4A] text-white shadow-md hover:shadow-lg hover:bg-[#0d243b] transition-all duration-300 hover:scale-[1.07]"
                    >
                      {loading ? "Registering..." : "Register"}
                    </Button>
                  )}
                </div>

              </form>

            </CardContent>
          </Card>

          <p className="mt-4 text-center text-slate-600">
            Register an Organization?{" "}
            <Link href="/organization-signup" className="font-medium text-[#577C8E]">
              Create
            </Link>
          </p>
        </div>
      </div>

      {/* LOADING MODAL */}
      {showLoadingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-[fadeIn_0.3s_ease]">
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-[scaleIn_0.4s_ease]">
            <h2 className="text-lg font-medium text-slate-700 animate-pulse">
              Creating your account...
            </h2>
            <div className="mt-4 w-10 h-10 border-4 border-[#102E4A] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-[fadeIn_0.3s_ease]">
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-[scaleIn_0.4s_ease]">
            <h2 className="text-xl font-bold text-green-700">
              Registered Successfully!
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Please check your email to confirm your account.
            </p>

            <Link href="/login">
              <Button className="w-full mt-4 bg-[#102E4A] hover:bg-[#0d243b] hover:scale-[1.05] transition-all duration-300">
                Close
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { register } from "../actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  EyeOff,
  User,
  GraduationCap,
  Shield,
  Lock,
  Check,
  ChevronRight,
  ChevronLeft,
  Upload,
  Building2,
  UserCircle,
  Briefcase,
  Users,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Globe,
  X,
} from "lucide-react";

import TermsPrivacyDialog from "@/components/auth/TermsPrivacyDialog";

type Role = "Student" | "Faculty" | "Alumni";
type Uni = { id: number; name: string; abbreviation: string; domain: string };

const stepConfig = [
  {
    id: 0,
    title: "About You",
    description: "Tell us who you are",
    icon: User,
  },
  {
    id: 1,
    title: "University",
    description: "Your academic institution",
    icon: GraduationCap,
  },
  {
    id: 2,
    title: "Verification",
    description: "Confirm your identity",
    icon: Shield,
  },
  {
    id: 3,
    title: "Security",
    description: "Create your password",
    icon: Lock,
  },
];

const roleConfig = [
  {
    value: "Student" as Role,
    label: "Student",
    description: "Currently enrolled",
    icon: GraduationCap,
  },
  {
    value: "Faculty" as Role,
    label: "Faculty",
    description: "Teaching staff",
    icon: Briefcase,
  },
  {
    value: "Alumni" as Role,
    label: "Alumni",
    description: "Graduate",
    icon: Users,
  },
];

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

function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score: 2, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score: 3, label: "Good", color: "bg-yellow-500" };
  if (score <= 4) return { score: 4, label: "Strong", color: "bg-green-500" };
  return { score: 5, label: "Very Strong", color: "bg-emerald-500" };
}

export default function SignUpForm() {
  const [universities, setUniversities] = useState<Uni[]>([]);
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

  // School request modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSchoolName, setRequestSchoolName] = useState("");
  const [requestAbbreviation, setRequestAbbreviation] = useState("");
  const [requestDomain, setRequestDomain] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestName, setRequestName] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUni = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("universities")
        .select("id, name, abbreviation, domain")
        .order("name", { ascending: true });
      setUniversities(data ?? []);
    };
    fetchUni();
  }, []);

  const selectedUniversity = useMemo(
    () => universities.find((u) => String(u.id) === selectedUniversityId) || null,
    [universities, selectedUniversityId]
  );

  function validateEmailInline(v: string) {
    if (!v.trim()) return "Email is required.";
    if (!emailLooksValid(v)) return "Not a valid email.";
    return "";
  }

  useEffect(() => {
    const needsDomain = selectedRole === "Student" || selectedRole === "Faculty";
    const uniDomain = normalizeDomain(selectedUniversity?.domain);
    const uniExample = cleanDomainForExample(selectedUniversity?.domain);

    if (!needsDomain || !uniDomain) return setEmailDomainError("");
    if (!email || !emailLooksValid(email)) return setEmailDomainError("");

    if (!email.toLowerCase().endsWith(uniDomain)) {
      setEmailDomainError(`Use your university email (e.g., name@${uniExample})`);
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

      const res = await fetch("https://ocr-api-uugb.onrender.com/api/ocr", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      const extracted = data?.Name?.toLowerCase().trim();
      const typed = fullName.toLowerCase().trim();

      const match = extracted && typed && extracted === typed;

      setVerificationStatus(match ? "Verified" : "Failed");

      if (!match) {
        setError("Name on ID doesn't match. Please check your full name.");
      }
    } catch {
      setVerificationStatus("Failed");
      setError("Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  }

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);

  const stepIsValid = useMemo(() => {
    if (activeStep === 0) {
      return selectedRole && fullName.trim().length >= 2;
    }

    if (activeStep === 1) {
      const needsDomain = selectedRole === "Student" || selectedRole === "Faculty";
      const uniDomain = normalizeDomain(selectedUniversity?.domain);

      const domainOk =
        !needsDomain ||
        (email && emailLooksValid(email) && uniDomain && email.toLowerCase().endsWith(uniDomain));

      return selectedUniversityId && emailLooksValid(email) && domainOk && !emailError;
    }

    if (activeStep === 2) return idImage && verificationStatus === "Verified";

    if (activeStep === 3)
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
    if (stepIsValid && activeStep < 3) {
      setActiveStep((s) => s + 1);
      setError(null);
    }
  }

  function prev() {
    if (activeStep > 0) {
      setActiveStep((s) => s - 1);
      setError(null);
    }
  }

  function resetRequestModal() {
    setShowRequestModal(false);
    setRequestSchoolName("");
    setRequestAbbreviation("");
    setRequestDomain("");
    setRequestReason("");
    setRequestEmail("");
    setRequestName("");
    setRequestError(null);
    setRequestSuccess(false);
  }

  async function submitSchoolRequest() {
    if (!requestSchoolName.trim() || !requestEmail.trim() || !requestName.trim()) {
      setRequestError("Please fill in all required fields.");
      return;
    }

    setRequestSubmitting(true);
    setRequestError(null);

    try {
      const supabase = createClient();
      const rawDomain = requestDomain.trim().toLowerCase();
      const domain = rawDomain ? (rawDomain.startsWith("@") ? rawDomain : `@${rawDomain}`) : null;

      // 1️⃣ Check if university already exists (approved)
      const { data: existingUniversity, error: uniError } = await supabase
        .from("universities")
        .select("id")
        .eq("domain", domain)
        .limit(1)
        .single();

      if (existingUniversity) {
        throw new Error("This university is already registered.");
      }

      if (uniError && uniError.code !== "PGRST116") {
        throw uniError;
      }

      // 2️⃣ Check if university is already under review
      const { data: existingRequest, error: reqError } = await supabase
        .from("university_requests")
        .select("id")
        .eq("domain", domain)
        .limit(1)
        .single();

      if (existingRequest) {
        throw new Error("This university is already under review.");
      }

      if (reqError && reqError.code !== "PGRST116") {
        throw reqError;
      }

      // 3️⃣ Insert request
      const { error: insertError } = await supabase
        .from("university_requests")
        .insert({
          school_name: requestSchoolName.trim(),
          abbreviation: requestAbbreviation.trim() || null,
          domain,
          reason: requestReason.trim() || null,
          requester_email: requestEmail.trim(),
          requester_name: requestName.trim(),
          status: "pending",
        });

      if (insertError) throw insertError;

    setRequestSuccess(true);
    } catch (err: any) {
      setRequestError(err.message || "Failed to submit request. Please try again.");
    } finally {
      setRequestSubmitting(false);
    }

  }

  async function onSubmitFinal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stepIsValid) return;

    if (!selectedUniversity || !selectedRole) return setError("Missing required fields.");

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

  const progress = ((activeStep + 1) / stepConfig.length) * 100;

  return (
    <>
      <div className="flex flex-col md:flex-row min-h-[75vh] justify-center items-center px-2 lg:px-8 mt-10">
        <div className="w-full max-w-2xl">
          {/* Main Card */}
          <div className="border border-slate-200 rounded-3xl shadow-xl bg-white p-6 md:p-10 animate-[fadeIn_0.5s_ease]">
            {/* Header */}
            <div className="text-center space-y-2 mb-6">
              <h1 className="text-2xl md:text-4xl font-semibold text-[#102E4A]">
                <span className="font-bold text-[#E59E2C]">Create</span> Account
              </h1>
              <p className="text-[#577C8E] text-sm md:text-base">
                Join EduCart in just a few steps
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs md:text-sm font-medium text-[#102E4A]">
                  Step {activeStep + 1} of {stepConfig.length}
                </span>
                <span className="text-xs md:text-sm text-[#577C8E]">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#102E4A] rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Step Indicators - Desktop */}
            <div className="hidden md:flex justify-between mb-8">
              {stepConfig.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;

                return (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center transition-all duration-300 ${
                      isActive ? "scale-105" : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                        isCompleted
                          ? "bg-[#E59E2C] text-white"
                          : isActive
                          ? "bg-[#102E4A] text-white shadow-md"
                          : "bg-slate-200 text-slate-400"
                      }`}
                    >
                      {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isActive ? "text-[#102E4A]" : isCompleted ? "text-[#E59E2C]" : "text-slate-400"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Step Indicators - Mobile */}
            <div className="md:hidden flex items-center justify-center gap-2 mb-6">
              {stepConfig.map((step, index) => {
                const isActive = index === activeStep;
                const isCompleted = index < activeStep;

                return (
                  <div
                    key={step.id}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isCompleted
                        ? "w-8 bg-[#E59E2C]"
                        : isActive
                        ? "w-10 bg-[#102E4A]"
                        : "w-6 bg-slate-200"
                    }`}
                  />
                );
              })}
            </div>

            {/* Step Title */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              {(() => {
                const Icon = stepConfig[activeStep].icon;
                return <Icon size={20} className="text-[#102E4A]" />;
              })()}
              <div>
                <h2 className="text-base md:text-lg font-semibold text-[#102E4A]">{stepConfig[activeStep].title}</h2>
                <p className="text-xs text-[#577C8E]">{stepConfig[activeStep].description}</p>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={onSubmitFinal}>
              <div
                key={activeStep}
                className="min-h-[280px] animate-[fadeIn_0.3s_ease-out]"
              >
                {/* Step 0: About You */}
                {activeStep === 0 && (
                  <div className="space-y-5">
                    <div>
                      <Label className="text-[#102E4A] mb-2 block">I am a...</Label>
                      <div className="grid grid-cols-3 gap-2 md:gap-3">
                        {roleConfig.map((role) => {
                          const Icon = role.icon;
                          const isSelected = selectedRole === role.value;

                          return (
                            <button
                              key={role.value}
                              type="button"
                              onClick={() => setSelectedRole(role.value)}
                              className={`relative p-3 md:p-4 rounded-xl border transition-all duration-300 hover:cursor-pointer ${
                                isSelected
                                  ? "border-[#102E4A] bg-[#102E4A]/5 shadow-md scale-[1.02]"
                                  : "border-slate-300 hover:border-slate-400 hover:bg-slate-50 hover:scale-[1.02]"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#E59E2C] rounded-full flex items-center justify-center">
                                  <Check size={12} className="text-white" />
                                </div>
                              )}
                              <Icon
                                size={22}
                                className={`mx-auto mb-1.5 ${
                                  isSelected ? "text-[#102E4A]" : "text-gray-400"
                                }`}
                              />
                              <div
                                className={`text-sm font-medium ${
                                  isSelected ? "text-[#102E4A]" : "text-slate-600"
                                }`}
                              >
                                {role.label}
                              </div>
                              <div className="text-[10px] md:text-xs text-[#577C8E] mt-0.5">
                                {role.description}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-[#102E4A]">Full Name</Label>
                      <div className="relative">
                        <UserCircle
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10 rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <p className="text-xs text-[#577C8E]">
                        Use the name shown on your school ID (no middle initial)
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 1: University */}
                {activeStep === 1 && (
                  <div className="space-y-5">
                    <div className="grid gap-2">
                      <Label className="text-[#102E4A]">University</Label>
                      <div className="relative">
                        <Building2
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10"
                        />
                        <Select
                          value={selectedUniversityId ?? undefined}
                          onValueChange={setSelectedUniversityId}
                        >
                          <SelectTrigger className="pl-10 rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300">
                            <SelectValue placeholder="Choose your university" />
                          </SelectTrigger>
                          <SelectContent>
                            {universities.map((u) => (
                              <SelectItem key={u.id} value={String(u.id)}>
                                {u.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowRequestModal(true)}
                        className="text-xs text-[#577C8E] hover:text-[#102E4A] hover:underline transition-colors hover:cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={12} />
                        Can&apos;t find your school? Request to add it
                      </button>
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-[#102E4A]">Email Address</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError(validateEmailInline(e.target.value));
                        }}
                        className="rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300"
                        placeholder={
                          selectedUniversity
                            ? `name@${cleanDomainForExample(selectedUniversity.domain)}`
                            : "your@email.edu"
                        }
                      />
                      {emailError && (
                        <p className="text-xs text-red-600 mt-1">{emailError}</p>
                      )}
                      {emailDomainError && !emailError && (
                        <p className="text-xs text-amber-600 mt-1">{emailDomainError}</p>
                      )}
                    </div>

                    {(selectedRole === "Student" || selectedRole === "Faculty") && (
                      <div className="bg-[#C7D9E5]/30 border border-[#C7D9E5] rounded-xl p-3">
                        <p className="text-xs md:text-sm text-[#102E4A]">
                          <strong>Note:</strong> {selectedRole}s must use their official university email.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 2: Verification */}
                {activeStep === 2 && (
                  <div className="space-y-5">
                    <div className="grid gap-2">
                      <Label className="text-[#102E4A]">Upload Your School ID</Label>
                      <p className="text-xs text-[#577C8E]">
                        We&apos;ll verify your name matches your ID
                      </p>

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative h-44 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer hover:scale-[1.01] ${
                          previewUrl
                            ? "border-[#102E4A] bg-[#102E4A]/5"
                            : "border-slate-300 hover:border-[#102E4A] hover:bg-slate-50"
                        }`}
                      >
                        {previewUrl ? (
                          <div className="relative h-full w-full overflow-hidden rounded-xl">
                            <Image
                              src={previewUrl}
                              alt="ID Preview"
                              fill
                              className="object-contain p-2"
                            />
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Upload size={28} className="mb-2" />
                            <span className="font-medium text-sm">Click to upload</span>
                            <span className="text-xs mt-1">PNG or JPG up to 10MB</span>
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
                    </div>

                    {previewUrl && (
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2">
                          {isVerifying ? (
                            <>
                              <Loader2 size={18} className="text-[#102E4A] animate-spin" />
                              <span className="text-sm text-[#577C8E]">Verifying...</span>
                            </>
                          ) : verificationStatus === "Verified" ? (
                            <>
                              <CheckCircle2 size={18} className="text-green-600" />
                              <span className="text-sm font-medium text-green-700">Verified</span>
                            </>
                          ) : verificationStatus === "Failed" ? (
                            <>
                              <AlertCircle size={18} className="text-red-600" />
                              <span className="text-sm font-medium text-red-700">Failed - Name doesn&apos;t match</span>
                            </>
                          ) : (
                            <span className="text-sm text-[#577C8E]">Ready to verify</span>
                          )}
                        </div>

                        {!isVerifying && verificationStatus !== "Verified" && (
                          <Button
                            type="button"
                            onClick={verifyID}
                            size="sm"
                            className="bg-[#C7D9E5] text-[#3A2D13] hover:bg-[#F3D58D] hover:cursor-pointer transition-all duration-300"
                          >
                            {verificationStatus === "Failed" ? "Retry" : "Verify"}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Security */}
                {activeStep === 3 && (
                  <div className="space-y-5">
                    <div className="grid gap-2">
                      <Label className="text-[#102E4A]">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300"
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#102E4A] hover:cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      {/* Password Strength Indicator */}
                      {password && (
                        <div className="mt-1">
                          <div className="flex gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`h-1 flex-1 rounded-full transition-all ${
                                  level <= passwordStrength.score
                                    ? passwordStrength.color
                                    : "bg-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-[#577C8E]">
                            {passwordStrength.label} · Min 8 characters
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label className="text-[#102E4A]">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10 pr-10 rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#102E4A] hover:cursor-pointer"
                        >
                          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-600">Passwords don&apos;t match</p>
                      )}
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        className="mt-1"
                      />
                      <span className="text-sm text-[#577C8E]">
                        I agree to the <TermsPrivacyDialog />
                      </span>
                    </label>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <p className="mt-4 text-sm text-red-600 text-center">{error}</p>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="mt-6 flex justify-between items-center gap-3">
                {activeStep > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prev}
                    className="flex items-center gap-1 rounded-xl border-slate-300 text-[#102E4A] hover:bg-slate-50 hover:cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {activeStep < 3 ? (
                  <Button
                    type="button"
                    onClick={next}
                    disabled={!stepIsValid}
                    className="flex items-center gap-1 bg-[#C7D9E5] text-[#3A2D13] rounded-xl shadow-md transition-all duration-300 hover:bg-[#F3D58D] hover:scale-[1.02] hover:cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight size={16} />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={!stepIsValid || loading}
                    className="flex items-center gap-1 bg-[#C7D9E5] text-[#3A2D13] rounded-xl shadow-md transition-all duration-300 hover:bg-[#F3D58D] hover:scale-[1.02] hover:cursor-pointer disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Footer Links - Outside Card */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-[#577C8E] text-sm">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#102E4A] hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-[#577C8E] text-xs">
              Registering an organization?{" "}
              <Link href="/organization-signup" className="font-medium text-[#102E4A] hover:underline">
                Create organization account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl animate-[scaleIn_0.4s_ease]">
            <h2 className="text-lg font-medium text-gray-700 animate-pulse">
              Creating your account...
            </h2>
            <div className="mt-4 w-10 h-10 border-4 border-[#102E4A] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm mx-4 text-center animate-[scaleIn_0.4s_ease]">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} className="text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-[#102E4A] mt-4">
              <span className="text-[#E59E2C]">Welcome</span> to EduCart!
            </h2>
            <p className="text-[#577C8E] mt-2 text-sm">
              Check your email to confirm your account before signing in.
            </p>
            <Link href="/login">
              <Button className="w-full mt-5 bg-[#C7D9E5] text-[#3A2D13] rounded-xl shadow-md transition-all duration-300 hover:bg-[#F3D58D] hover:scale-[1.02]">
                Go to Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Request School Modal */}
      <Dialog open={showRequestModal} onOpenChange={(open) => !open && resetRequestModal()}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-100">
            <DialogTitle className="text-lg font-semibold text-[#102E4A] flex items-center gap-2">
              <GraduationCap size={20} className="text-[#E59E2C]" />
              Request to Add Your School
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {requestSuccess ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-[#102E4A] mt-4">Request Submitted!</h3>
                <p className="text-sm text-[#577C8E] mt-2">
                  Thank you for your request. We&apos;ll review it and get back to you via email.
                </p>
                <Button
                  onClick={resetRequestModal}
                  className="mt-5 bg-[#C7D9E5] text-[#3A2D13] rounded-xl hover:bg-[#F3D58D] hover:cursor-pointer"
                >
                  Close
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[#577C8E]">
                  Fill out the form below and we&apos;ll review your request to add your school to EduCart.
                </p>

                <div className="grid gap-2">
                  <Label className="text-[#102E4A] text-sm">
                    School Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={requestSchoolName}
                      onChange={(e) => setRequestSchoolName(e.target.value)}
                      placeholder="e.g., University of the Philippines"
                      className="pl-10 rounded-xl border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label className="text-[#102E4A] text-sm">Abbreviation</Label>
                    <Input
                      value={requestAbbreviation}
                      onChange={(e) => setRequestAbbreviation(e.target.value)}
                      placeholder="e.g., UP"
                      className="rounded-xl border-slate-300"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[#102E4A] text-sm">Email Domain</Label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        value={requestDomain}
                        onChange={(e) => setRequestDomain(e.target.value)}
                        placeholder="e.g., up.edu.ph"
                        className="pl-10 rounded-xl border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-[#102E4A] text-sm">
                    Your Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <UserCircle size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={requestName}
                      onChange={(e) => setRequestName(e.target.value)}
                      placeholder="Your full name"
                      className="pl-10 rounded-xl border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="text-[#102E4A] text-sm">
                    Your Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={requestEmail}
                    onChange={(e) => setRequestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="rounded-xl border-slate-300"
                  />
                </div>

                <div className="grid gap-2">
                  <Label className="text-[#102E4A] text-sm">Why should we add your school?</Label>
                  <Textarea
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Tell us why you'd like your school to be on EduCart..."
                    className="rounded-xl border-slate-300 resize-none"
                    rows={3}
                  />
                </div>

                {requestError && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {requestError}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetRequestModal}
                    className="flex-1 rounded-xl border-slate-300 hover:cursor-pointer"
                    disabled={requestSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={submitSchoolRequest}
                    disabled={requestSubmitting}
                    className="flex-1 bg-[#C7D9E5] text-[#3A2D13] rounded-xl hover:bg-[#F3D58D] hover:cursor-pointer disabled:opacity-50"
                  >
                    {requestSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

type Role = "Student" | "Faculty" | "Alumni";
type Uni = { id: number; abbreviation: string; domain: string };

const steps = ["Account Type", "Valid ID", "Password", "Review"] as const;

// Palette
const COLOR_DONE = "#577C8E";
const COLOR_CURRENT = "#102E4A";
const COLOR_UPCOMING = "#DEDEDE";
const COLOR_NEXT_OK = "#C7D9E5";

//  email check + special guard for incomplete email
function emailLooksValid(val: string) {
  const v = val.trim();
  if (!v || v.endsWith(".") || v.endsWith("@")) return false;

  const basic = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  if (!basic.test(v)) return false;

  const [, domain] = v.split("@");
  if (!domain || domain.includes("..")) return false;

  const labels = domain.split(".");
  if (
    !labels.every(
      (l) =>
        l.length > 0 &&
        /^[A-Z0-9-]+$/i.test(l) &&
        !l.startsWith("-") &&
        !l.endsWith("-")
    )
  ) {
    return false;
  }

  if (/@gmail\.(c|co)$/i.test(v)) return false;

  return true;
}

function normalizeDomain(d?: string) {
  const v = (d || "").trim().toLowerCase();
  if (!v) return "";
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
  const [selectedUniversityId, setSelectedUniversityId] = useState<
    string | null
  >(null);

  const [idImage, setIdImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "Verified" | "Failed" | null
  >(null);
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
    () =>
      universities.find((u) => String(u.id) === selectedUniversityId) || null,
    [universities, selectedUniversityId]
  );

  function validateEmailInline(value: string) {
    if (!value.trim()) return "Email is required.";
    if (!emailLooksValid(value)) return "Not a valid email address.";
    return "";
  }

  // domain error sync
  useEffect(() => {
    const needsDomain =
      selectedRole === "Student" || selectedRole === "Faculty";
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
      const res = await fetch(
        "https://ocr-verification.up.railway.app/api/ocr",
        {
          method: "POST",
          body: fd,
        }
      );
      const data = await res.json();
      const extracted = data?.Name?.toLowerCase().trim();
      const typed = fullName.toLowerCase().trim();
      setVerificationStatus(
        extracted && typed && extracted === typed ? "Verified" : "Failed"
      );

      if (extracted !== typed) {
        setError(
          "Please make sure your entered name matches the name on your ID."
        );
      }
    } catch (e) {
      console.error(e);
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
      const domainOK =
        !needsDomain ||
        (!!email &&
          emailLooksValid(email) &&
          !!uniDomain &&
          email.toLowerCase().endsWith(uniDomain));

      return (
        !!selectedRole &&
        !!selectedUniversityId &&
        !!fullName &&
        emailLooksValid(email) &&
        emailError === "" &&
        domainOK &&
        (emailDomainError === "" || domainOK)
      );
    }
    if (activeStep === 1) return !!idImage && verificationStatus === "Verified";
    if (activeStep === 2) {
      const strongEnough = password.length >= 8;
      return strongEnough && confirmPassword === password && agree;
    }
    if (activeStep === 3) return true;
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
    if (password !== confirmPassword)
      return setError("Passwords do not match.");
    if (verificationStatus !== "Verified")
      return setError("Please verify your ID.");

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

  const Stepper = () => (
    <div className="flex items-center gap-3">
      {steps.map((_, i) => {
        const state =
          i < activeStep ? "done" : i === activeStep ? "current" : "upcoming";
        const dotColor =
          state === "current"
            ? COLOR_CURRENT
            : state === "done"
            ? COLOR_DONE
            : COLOR_UPCOMING;
        const dashColor = i < activeStep ? COLOR_DONE : COLOR_UPCOMING;
        return (
          <div key={i} className="flex items-center gap-3">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
            {i !== steps.length - 1 && (
              <span
                className="h-[2px] w-10 rounded-full"
                style={{ backgroundColor: dashColor }}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  const emailDescribedBy =
    [
      emailError ? "email-error" : "",
      !emailError && emailDomainError ? "email-domain-error" : "",
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <>
      <div className="w-full min-h-screen flex items-start justify-center px-6 py-8 md:py-14">
        <div className="w-full max-w-2xl">
          <Card className="rounded-2xl border shadow-sm">
            <CardContent className="p-6 md:p-8 flex flex-col min-h-[640px]">
              <div className="mt-2 mb-6">
                <Stepper />
              </div>

              <h1 className="text-3xl md:text-[32px] font-semibold tracking-tight">
                <span className="font-bold" style={{ color: COLOR_DONE }}>
                  Create
                </span>{" "}
                an Account
              </h1>
              <p className="mt-1 text-slate-500">
                Get started in less than 5 minutes
              </p>

              <form
                onSubmit={onSubmitFinal}
                className="mt-6 flex-1 flex flex-col"
              >
                <div className="space-y-6 flex-1 min-h-[360px]">
                  {activeStep === 0 && (
                    <div className="space-y-5">
                      <div>
                        <Label className="text-sm">I am a:</Label>
                        <div className="mt-2 flex gap-3">
                          {(["Student", "Faculty", "Alumni"] as Role[]).map(
                            (r) => {
                              const isActive = selectedRole === r;
                              return (
                                <button
                                  key={r}
                                  type="button"
                                  onClick={() => setSelectedRole(r)}
                                  className={`rounded-full px-4 py-2 border transition
                                  ${
                                    isActive
                                      ? "text-white"
                                      : "text-slate-700 bg-white"
                                  }
                                `}
                                  style={{
                                    borderColor: isActive
                                      ? COLOR_CURRENT
                                      : "#e5e7eb",
                                    backgroundColor: isActive
                                      ? COLOR_CURRENT
                                      : undefined,
                                  }}
                                >
                                  {r}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>

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
                          <p id="email-error" className="text-xs text-red-600">
                            {emailError}
                          </p>
                        )}
                        {!emailError && emailDomainError && (
                          <p
                            id="email-domain-error"
                            className="text-xs text-red-600"
                          >
                            {emailDomainError}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <Label>Upload Valid ID</Label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-1 h-40 rounded-xl border-2 border-dashed border-slate-300 bg-white flex items-center justify-center text-center cursor-pointer"
                      >
                        {previewUrl ? (
                          <div className="relative h-full w-full overflow-hidden rounded-xl">
                            <Image
                              src={previewUrl}
                              alt="ID Preview"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute bottom-2 right-2">
                              {isVerifying ? (
                                <span className="text-xs bg-white/80 px-2 py-1 rounded">
                                  Verifying…
                                </span>
                              ) : verificationStatus ? (
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    verificationStatus === "Verified"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {verificationStatus === "Verified"
                                    ? "✔ Verified"
                                    : "✖ Failed"}
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

                  {activeStep === 2 && (
                    <div className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="password">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter Password"
                              required
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-slate-800"
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              title={
                                showPassword ? "Hide password" : "Show password"
                              }
                            >
                              {showPassword ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-slate-500">
                            At least 8 characters
                          </p>
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor="confirmPassword">
                            Confirm Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirm ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) =>
                                setConfirmPassword(e.target.value)
                              }
                              placeholder="Confirm Password"
                              required
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirm((s) => !s)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-slate-800"
                              aria-label={
                                showConfirm ? "Hide password" : "Show password"
                              }
                              title={
                                showConfirm ? "Hide password" : "Show password"
                              }
                            >
                              {showConfirm ? (
                                <EyeOff size={18} />
                              ) : (
                                <Eye size={18} />
                              )}
                            </button>
                          </div>
                          <p className="text-xs invisible select-none">
                            spacer
                          </p>
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
                          I agree with the{" "}
                          <Dialog>
                            <DialogTrigger asChild>
                              <span className="underline hover:cursor-pointer">
                                Terms of Service
                              </span>
                            </DialogTrigger>
                            <DialogContent className="max-h-[85vh] overflow-y-auto px-6 py-5 bg-white text-gray-800 text-sm leading-relaxed">
                              <DialogHeader>
                                <DialogTitle>
                                  EduCart Terms of Service{" "}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="flex flex-col">
                                  <h1>
                                    <b>Effective Date:</b> October 7, 2025
                                  </h1>
                                  <h1>
                                    <b>Last Updated:</b> October 7, 2025
                                  </h1>
                                </div>
                                <div className="space-y-5">
                                  <div>
                                    <h2 className="font-bold text-base mb-1">
                                      1. Acceptance of Terms
                                    </h2>
                                    <p className="text-justify">
                                      By accessing or using EduCart (“the
                                      Platform”), you agree to comply with these
                                      Terms of Service (“Terms”). If you
                                      disagree with any part of these Terms, you
                                      must not access or use the Platform.
                                      EduCart may revise these Terms from time
                                      to time, and continued use implies
                                      acceptance of the revised version.
                                    </p>
                                  </div>
                                  <div>
                                    <h2 className="font-bold text-base mb-1">
                                      2. Overview
                                    </h2>
                                    <p className="text-justify">
                                      EduCart is a university-based marketplace
                                      platform that allows verified members of
                                      academic institutions—including students,
                                      faculty, alumni, organizations, and
                                      recognized student businesses—to buy,
                                      sell, rent, trade, give away, or request
                                      items and services within a verified
                                      educational ecosystem.
                                    </p>
                                  </div>
                                  <div>
                                    <h2 className="font-bold text-base mb-1">
                                      3. Eligibility
                                    </h2>
                                    <ul className="list-disc list-inside space-y-1 pl-4">
                                      <li>
                                        Users must have a valid
                                        university-affiliated email address or
                                        be verified as alumni or a recognized
                                        business/organization.
                                      </li>
                                      <li>
                                        False representation or impersonation is
                                        strictly prohibited.
                                      </li>
                                    </ul>
                                  </div>
                                  <div>
                                    <h2 className="font-bold text-base mb-1">
                                      4. Account Registration and Verification
                                    </h2>
                                    <p className="text-justify mb-3">
                                      EduCart uses a tiered verification process
                                      to maintain trust within its university
                                      community.
                                    </p>

                                    <p className="font-semibold mb-1">
                                      a. Students and Faculty
                                    </p>
                                    <p className="text-justify mb-3">
                                      Accounts are verified via official
                                      university email domains (e.g.,{" "}
                                      <span className="font-mono bg-gray-100 px-1 rounded">
                                        @university.edu.ph
                                      </span>
                                      ).
                                    </p>

                                    <p className="font-semibold mb-1">
                                      b. Organizations and Businesses
                                    </p>
                                    <p className="text-justify mb-3">
                                      Student organizations and faculty-owned
                                      businesses must undergo document and ID
                                      verification to obtain a{" "}
                                      <span className="font-semibold">
                                        Verified Badge
                                      </span>
                                      , which grants access to enhanced posting
                                      limits and marketplace sections.
                                    </p>

                                    <p className="font-semibold mb-1">
                                      c. Alumni Honor System
                                    </p>
                                    <p className="text-justify mb-3">
                                      Alumni verification follows an{" "}
                                      <span className="font-semibold">
                                        Honor System
                                      </span>{" "}
                                      combining university email authentication
                                      with an ethical declaration.
                                    </p>

                                    <p className="mb-2">
                                      By registering as an Alumni User, you
                                      agree that:
                                    </p>
                                    <ol className="list-decimal list-inside space-y-1 pl-4">
                                      <li>
                                        You are a legitimate alumnus/alumna of
                                        your declared university.
                                      </li>
                                      <li>
                                        You will uphold honesty and integrity in
                                        all platform interactions.
                                      </li>
                                      <li>
                                        You understand that any false
                                        representation, misconduct, or
                                        fraudulent transaction will be logged
                                        under the{" "}
                                        <span className="font-semibold">
                                          EduCart Alumni Honor Registry
                                        </span>{" "}
                                        and may result in permanent account
                                        suspension.
                                      </li>
                                      <li>
                                        You consent that reports involving
                                        alumni may be reviewed internally by
                                        EduCart administrators for
                                        accountability.
                                      </li>
                                    </ol>
                                  </div>
                                  <div>
                                    <h2 className="font-bold text-base mb-1">
                                      5. User Conduct
                                    </h2>

                                    <p className="mb-2">You agree to:</p>
                                    <ul className="list-disc list-inside space-y-1 pl-4">
                                      <li>
                                        Use EduCart only for lawful purposes.
                                      </li>
                                      <li>
                                        Provide accurate item details and
                                        truthful descriptions.
                                      </li>
                                      <li>
                                        Communicate respectfully with other
                                        users.
                                      </li>
                                      <li>
                                        Complete transactions with honesty and
                                        transparency.
                                      </li>
                                      <li>
                                        Uphold the{" "}
                                        <span className="font-semibold">
                                          EduCart Honor System
                                        </span>{" "}
                                        at all times.
                                      </li>
                                    </ul>

                                    <p className="mt-4 mb-2">
                                      Prohibited activities include:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 pl-4">
                                      <li>
                                        Selling or listing illegal or prohibited
                                        items.
                                      </li>
                                      <li>
                                        Misrepresentation of identity or
                                        affiliation.
                                      </li>
                                      <li>
                                        Circumventing payment, escrow, or
                                        reporting systems.
                                      </li>
                                      <li>
                                        Posting offensive, harmful, or
                                        fraudulent content.
                                      </li>
                                    </ul>
                                  </div>

                                  <div>
                                    <h2 className="font-bold text-base mb-1">
                                      6. Transactions and Payments
                                    </h2>
                                    <p className="text-justify mb-3">
                                      EduCart supports{" "}
                                      <span className="font-semibold">
                                        GCash (escrow)
                                      </span>{" "}
                                      and{" "}
                                      <span className="font-semibold">
                                        Cash-on-Meetup
                                      </span>{" "}
                                      transactions.
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 pl-4">
                                      <li>
                                        GCash payments are processed via an
                                        escrow system held until both parties
                                        confirm receipt/delivery.
                                      </li>
                                      <li>
                                        Commissions are applied to GCash
                                        transactions (2%–10%, based on total
                                        price).
                                      </li>
                                      <li>
                                        Cash meetups are conducted at the users’
                                        discretion; EduCart is not liable for
                                        any loss or dispute arising outside the
                                        platform.
                                      </li>
                                    </ul>
                                  </div>

                                  <div>
                                    <h2 className="font-bold text-base mb-1">
                                      7. Posting Limits and Subscriptions
                                    </h2>
                                    <ul className="list-disc list-inside space-y-1 pl-4">
                                      <li>
                                        Students/Faculty/Alumni: 3 free
                                        posts/month
                                      </li>
                                      <li>
                                        Businesses/Organizations: 5 free
                                        posts/month
                                      </li>
                                      <li>
                                        Additional posts can be purchased or
                                        earned through escrow completion
                                        bonuses. Premium plans offer unlimited
                                        and boosted listings.
                                      </li>
                                    </ul>
                                  </div>

                                  <div>
                                    <h2 className="font-bold text-base mb-1">
                                      8. Dispute Resolution
                                    </h2>
                                    <ul className="list-disc list-inside space-y-1 pl-4">
                                      <li>
                                        Reports involving students, faculty, or
                                        organizations will be forwarded to the
                                        respective{" "}
                                        <span className="font-semibold">
                                          Student Affairs Office
                                        </span>
                                        .
                                      </li>
                                      <li>
                                        Reports involving alumni will be handled
                                        under the{" "}
                                        <span className="font-semibold">
                                          Alumni Honor Review System
                                        </span>{" "}
                                        by EduCart administrators.
                                      </li>
                                      <li>
                                        Disputes may require submission of
                                        screenshots, messages, or receipts for
                                        verification.
                                      </li>
                                    </ul>
                                  </div>

                                  <div>
                                    <h2 className="font-bold text-base mb-1">
                                      9. Content Ownership and Usage
                                    </h2>
                                    <p className="text-justify">
                                      Users retain ownership of content they
                                      upload (e.g., listings, photos, reviews).
                                      By posting, users grant EduCart a
                                      non-exclusive, worldwide license to
                                      display, reproduce, and distribute that
                                      content as necessary for platform
                                      operation.
                                    </p>
                                  </div>

                                  <div>
                                    <h2 className="font-bold text-base mb-1">
                                      10. Suspension and Termination
                                    </h2>
                                    <p className="text-justify mb-2">
                                      EduCart reserves the right to suspend or
                                      permanently remove any account found to
                                      be:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 pl-4">
                                      <li>In violation of these Terms</li>
                                      <li>
                                        Misrepresenting verification status
                                      </li>
                                      <li>
                                        Engaged in fraudulent, abusive, or
                                        unethical conduct
                                      </li>
                                    </ul>
                                  </div>

                                  <div>
                                    <h2 className="font-bold text-base mb-1">
                                      11. Liability Disclaimer
                                    </h2>
                                    <p className="text-justify mb-2">
                                      EduCart serves solely as an intermediary
                                      platform. It does not assume liability
                                      for:
                                    </p>
                                    <ul className="list-disc list-inside space-y-1 pl-4">
                                      <li>
                                        Any damages or disputes resulting from
                                        user-to-user transactions
                                      </li>
                                      <li>
                                        Lost, delayed, or mishandled deliveries
                                        by third-party couriers
                                      </li>
                                      <li>
                                        Cash payments conducted outside
                                        EduCart’s escrow system
                                      </li>
                                    </ul>
                                  </div>

                                  <div>
                                    <h2 className="font-bold text-base mb-1">
                                      12. Indemnity
                                    </h2>
                                    <p className="text-justify">
                                      Users agree to indemnify and hold harmless
                                      EduCart, its developers, and affiliated
                                      universities from any claim, loss, or
                                      liability arising from misuse or violation
                                      of these Terms.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>{" "}
                          and{" "}
                          <a className="underline">
                            <Dialog>
                              <DialogTrigger asChild>
                                <span className="underline hover:cursor-pointer">
                                  Privacy Policy
                                </span>
                              </DialogTrigger>
                              <DialogContent className="max-h-[85vh] overflow-y-auto px-6 py-5 bg-white text-gray-800 text-sm leading-relaxed">
                                <DialogHeader>
                                  <DialogTitle>
                                    EduCart Privacy Policy{" "}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="flex flex-col">
                                    <h1>
                                      <b>Effective Date:</b> October 7, 2025
                                    </h1>
                                    <h1>
                                      <b>Last Updated:</b> October 7, 2025
                                    </h1>
                                  </div>
                                  <div className="space-y-5">
                                    <div>
                                      <h2 className="font-bold text-base mb-1">
                                        1. Introduction
                                      </h2>
                                      <p className="text-justify">
                                        EduCart values your privacy. This
                                        Privacy Policy explains how we collect,
                                        use, store, and protect your information
                                        when you use the EduCart platform, a
                                        verified university-based marketplace.
                                      </p>
                                    </div>

                                    <div>
                                      <h2 className="font-bold text-base mb-1">
                                        2. Information We Collect
                                      </h2>
                                      <p className="text-justify mb-2">
                                        We collect data necessary to operate
                                        securely and effectively:
                                      </p>
                                      <ul className="list-disc list-inside space-y-1 pl-4">
                                        <li>
                                          <span className="font-semibold">
                                            Personal Information:
                                          </span>{" "}
                                          Name, university email, contact
                                          number, user role (student, faculty,
                                          alumni, org, business).
                                        </li>
                                        <li>
                                          <span className="font-semibold">
                                            Verification Data:
                                          </span>{" "}
                                          Uploaded ID documents for
                                          business/organization verification;
                                          email-based authentication for
                                          students and alumni.
                                        </li>
                                        <li>
                                          <span className="font-semibold">
                                            Transaction Data:
                                          </span>{" "}
                                          Listings, prices, chat messages,
                                          courier tracking, payment records.
                                        </li>
                                        <li>
                                          <span className="font-semibold">
                                            Behavioral Data:
                                          </span>{" "}
                                          Login history, reports, and platform
                                          interactions logged for safety and
                                          moderation.
                                        </li>
                                        <li>
                                          <span className="font-semibold">
                                            Alumni Honor Data:
                                          </span>{" "}
                                          Records of alumni accounts registered
                                          under the{" "}
                                          <span className="font-semibold">
                                            Honor System
                                          </span>
                                          , including flags, warnings, or
                                          reports handled under internal review.
                                        </li>
                                      </ul>
                                    </div>

                                    <div>
                                      <h2 className="font-bold text-base mb-1">
                                        3. How We Use Your Data
                                      </h2>
                                      <p className="text-justify mb-2">
                                        EduCart uses collected data to:
                                      </p>
                                      <ul className="list-disc list-inside space-y-1 pl-4">
                                        <li>
                                          Verify your identity and affiliation
                                          with a university.
                                        </li>
                                        <li>
                                          Facilitate listings, transactions, and
                                          payments (GCash and cash meetups).
                                        </li>
                                        <li>
                                          Ensure safe communication and fair
                                          trade between users.
                                        </li>
                                        <li>
                                          Moderate content, investigate reports,
                                          and prevent fraud.
                                        </li>
                                        <li>
                                          Enforce compliance with the{" "}
                                          <span className="font-semibold">
                                            Alumni Honor System
                                          </span>{" "}
                                          for accountability.
                                        </li>
                                        <li>
                                          Improve platform design, usability,
                                          and user experience.
                                        </li>
                                      </ul>
                                    </div>

                                    <div>
                                      <h2 className="font-bold text-base mb-1">
                                        4. Alumni Honor System and
                                        Accountability
                                      </h2>
                                      <p className="text-justify mb-2">
                                        EduCart implements a distinct{" "}
                                        <span className="font-semibold">
                                          Honor System
                                        </span>{" "}
                                        for alumni users.
                                      </p>
                                      <ul className="list-disc list-inside space-y-1 pl-4">
                                        <li>
                                          Alumni accounts are verified through
                                          email authentication and self-declared
                                          commitment to ethical use.
                                        </li>
                                        <li>
                                          Misconduct or misrepresentation is
                                          logged under the{" "}
                                          <span className="font-semibold">
                                            Honor Registry
                                          </span>
                                          , reviewed only by EduCart
                                          administrators.
                                        </li>
                                        <li>
                                          Data from this registry is kept
                                          private and used solely for
                                          investigation or future verification
                                          integrity checks.
                                        </li>
                                        <li>
                                          Alumni users acknowledge that data
                                          collected under the Honor System may
                                          be retained for audit purposes, even
                                          after account deletion, if related to
                                          active or unresolved cases.
                                        </li>
                                      </ul>
                                    </div>

                                    <div>
                                      <h2 className="font-bold text-base mb-1">
                                        5. Data Sharing and Disclosure
                                      </h2>
                                      <p className="text-justify mb-2">
                                        EduCart does not{" "}
                                        <span className="font-semibold">
                                          sell
                                        </span>{" "}
                                        or{" "}
                                        <span className="font-semibold">
                                          rent
                                        </span>{" "}
                                        personal data. However, we may share
                                        limited data with:
                                      </p>
                                      <ul className="list-disc list-inside space-y-1 pl-4">
                                        <li>
                                          <span className="font-semibold">
                                            Student Affairs Offices
                                          </span>
                                          , for cases involving verified student
                                          or faculty users.
                                        </li>
                                        <li>
                                          <span className="font-semibold">
                                            GCash or payment processors
                                          </span>
                                          , to facilitate escrow transactions.
                                        </li>
                                        <li>
                                          <span className="font-semibold">
                                            Courier partners
                                          </span>
                                          , to deliver items safely.
                                        </li>
                                        <li>
                                          <span className="font-semibold">
                                            EduCart administrators
                                          </span>
                                          , for moderation, dispute handling, or
                                          audit reviews.
                                        </li>
                                      </ul>
                                    </div>

                                    <div>
                                      <h2 className="font-bold text-base mb-1">
                                        6. Data Retention
                                      </h2>
                                      <ul className="list-disc list-inside space-y-1 pl-4">
                                        <li>
                                          User data is retained only as long as
                                          necessary for operational, legal, or
                                          safety purposes.
                                        </li>
                                        <li>
                                          Alumni Honor Registry data may be
                                          retained for accountability and to
                                          maintain trust in the verification
                                          system.
                                        </li>
                                        <li>
                                          Users may request account deletion at
                                          any time by contacting support;
                                          personal identifiers will then be
                                          anonymized except where data must
                                          remain for active disputes.
                                        </li>
                                      </ul>
                                    </div>

                                    <div>
                                      <h2 className="font-bold text-base mb-1">
                                        7. User Rights
                                      </h2>
                                      <p className="text-justify mb-2">
                                        All users (students, faculty, alumni,
                                        organizations, and businesses) have the
                                        right to:
                                      </p>
                                      <ul className="list-disc list-inside space-y-1 pl-4">
                                        <li>Access and correct their data.</li>
                                        <li>
                                          Withdraw consent to data processing.
                                        </li>
                                        <li>
                                          Request account deletion or
                                          anonymization.
                                        </li>
                                      </ul>
                                    </div>

                                    <div>
                                      <h2 className="font-bold text-base mb-1">
                                        8. Cookies and Analytics
                                      </h2>
                                      <p className="text-justify">
                                        EduCart may use cookies to improve
                                        performance, remember login preferences,
                                        and analyze engagement trends. Cookies
                                        can be disabled through browser settings
                                        without affecting basic access.
                                      </p>
                                    </div>

                                    <div>
                                      <h2 className="font-bold text-base mb-1">
                                        9. External Links
                                      </h2>
                                      <p className="text-justify">
                                        Links to external couriers, payment
                                        providers, or university sites are
                                        beyond EduCart’s control. Users are
                                        encouraged to review the privacy
                                        policies of those third-party platforms.
                                      </p>
                                    </div>

                                    <div>
                                      <h2 className="font-bold text-base mb-1">
                                        10. Policy Updates
                                      </h2>
                                      <p className="text-justify">
                                        EduCart may modify this Privacy Policy
                                        periodically. Updated versions will be
                                        posted with a new{" "}
                                        <span className="font-semibold">
                                          “Last Updated”
                                        </span>{" "}
                                        date. Continued use of the platform
                                        indicates acceptance of changes.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </a>
                        </span>
                      </label>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="space-y-4 text-sm">
                      <div className="rounded-lg border p-4">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-slate-500">Role</span>
                          <span className="font-medium">
                            {selectedRole || "—"}
                          </span>

                          <span className="text-slate-500">Full Name</span>
                          <span className="font-medium">{fullName || "—"}</span>

                          <span className="text-slate-500">Email</span>
                          <span className="font-medium break-all">
                            {email || "—"}
                          </span>

                          <span className="text-slate-500">University</span>
                          <span className="font-medium">
                            {selectedUniversity?.abbreviation || "—"}
                          </span>

                          <span className="text-slate-500">ID Status</span>
                          <span className="font-medium">
                            {verificationStatus ||
                              (idImage ? "Not verified" : "No file")}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500">
                        Make sure your details are correct before registering.
                      </p>
                    </div>
                  )}

                  {error && <p className="text-sm text-red-600">{error}</p>}

                  <input type="hidden" name="role" value={selectedRole} />
                  <input type="hidden" name="name" value={fullName} />
                  <input type="hidden" name="email" value={email} />
                  {selectedUniversity && (
                    <input
                      type="hidden"
                      name="university"
                      value={String(selectedUniversity.id)}
                    />
                  )}
                  <input type="hidden" name="password" value={password} />
                  <input
                    type="hidden"
                    name="confirmPassword"
                    value={confirmPassword}
                  />
                  {verificationStatus === "Verified" && (
                    <input
                      type="hidden"
                      name="verificationStatus"
                      value="Verified"
                    />
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {activeStep > 0 ? (
                    <button
                      type="button"
                      className="rounded-md px-4 py-2 border bg-white text-slate-600"
                      onClick={prev}
                    >
                      Previous
                    </button>
                  ) : (
                    <div />
                  )}

                  {activeStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={next}
                      disabled={!stepIsValid}
                      className="rounded-md px-6 py-2 text-slate-900 disabled:text-slate-600"
                      style={{
                        backgroundColor: stepIsValid
                          ? COLOR_NEXT_OK
                          : COLOR_UPCOMING,
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
            <Link
              href="/organization-signup"
              className="font-medium"
              style={{ color: COLOR_DONE }}
            >
              Create
            </Link>
          </p>
        </div>
      </div>

      {showLoadingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4">
            <h2 className="text-lg font-medium text-gray-700 animate-pulse">
              Creating your account...
            </h2>
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4">
            <h2 className="text-xl font-bold text-green-700">
              Registered Successfully!
            </h2>
            <p className="text-sm text-gray-600">
              Please check your email to confirm your account.
            </p>
            <Link href="/login">
              <Button className="w-full">Close</Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

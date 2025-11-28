"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { OrgRegister } from "../actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Eye, EyeOff } from "lucide-react";

const COLOR_DONE = "#577C8E";
const COLOR_CURRENT = "#102E4A";
const COLOR_UPCOMING = "#DEDEDE";
const COLOR_NEXT_OK = "#C7D9E5";

const steps = ["Organization", "Description", "Security", "Review"] as const;

type Uni = { id: number; abbreviation: string; domain: string };

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

  // block incomplete email
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

export default function OrgSignUpForm() {
  // data
  const [universities, setUniversities] = useState<Uni[]>([]);

  // form state
  const [orgName, setOrgName] = useState("");
  const [orgEmail, setOrgEmail] = useState("");
  const [selectedUniversityId, setSelectedUniversityId] = useState<
    string | null
  >(null);
  const [orgDescription, setOrgDescription] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emailError, setEmailError] = useState("");
  const [emailDomainError, setEmailDomainError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    () =>
      universities.find((u) => String(u.id) === selectedUniversityId) || null,
    [universities, selectedUniversityId]
  );

  // email inline check
  function validateEmailInline(value: string) {
    if (!value.trim()) return "Email is required.";
    if (!emailLooksValid(value)) return "Not a valid email address.";
    return "";
  }

  useEffect(() => {
    const uniDomain = normalizeDomain(selectedUniversity?.domain);
    const uniExample = cleanDomainForExample(selectedUniversity?.domain);

    if (!selectedUniversity || !uniDomain) {
      setEmailDomainError("");
      return;
    }
    if (!orgEmail || !emailLooksValid(orgEmail)) {
      setEmailDomainError("");
      return;
    }
    if (!orgEmail.toLowerCase().endsWith(uniDomain)) {
      setEmailDomainError(`Use your university email (e.g., *@${uniExample}).`);
    } else {
      setEmailDomainError("");
    }
  }, [orgEmail, selectedUniversity]);

  // steps validity
  const stepIsValid = useMemo(() => {
    if (activeStep === 0) {
      const uniDomain = normalizeDomain(selectedUniversity?.domain);
      const domainOK =
        !selectedUniversity ||
        (!!orgEmail &&
          emailLooksValid(orgEmail) &&
          !!uniDomain &&
          orgEmail.toLowerCase().endsWith(uniDomain));

      return (
        !!orgName &&
        !!selectedUniversityId &&
        !!orgEmail &&
        emailLooksValid(orgEmail) &&
        emailError === "" &&
        domainOK &&
        (emailDomainError === "" || domainOK)
      );
    }
    if (activeStep === 1) {
      return orgDescription.trim().length > 0;
    }
    if (activeStep === 2) {
      const strong = password.length >= 8;
      return strong && confirmPassword === password && agree;
    }
    if (activeStep === 3) return true;
    return false;
  }, [
    activeStep,
    orgName,
    orgEmail,
    emailError,
    emailDomainError,
    selectedUniversity,
    selectedUniversityId,
    orgDescription,
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

  // submit
  async function onSubmitFinal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stepIsValid) return;

    if (!selectedUniversity)
      return setError("Please select a university.");
    const uniDomain = normalizeDomain(selectedUniversity.domain);
    if (uniDomain && !orgEmail.toLowerCase().endsWith(uniDomain)) {
      return setError(`Email must end with ${uniDomain}`);
    }
    if (password !== confirmPassword) return setError("Passwords do not match.");

    const fd = new FormData();
    fd.append("OrgName", orgName);
    fd.append("OrgEmail", orgEmail);
    fd.append("university", String(selectedUniversity.id));
    fd.append("OrgDescription", orgDescription);
    fd.append("OrgPassword", password);
    fd.append("OrgConfirmPassword", confirmPassword);

    setLoading(true);
    const res = await OrgRegister(fd);
    setLoading(false);

    if (res?.error) return setError(res.error);
    alert("Organization registered (status: Pending). You can log in now.");
  }

  const Stepper = () => (
    <div className="flex gap-3">
      {steps.map((_, i) => {
        const state =
          i < activeStep ? "done" : i === activeStep ? "current" : "upcoming";

        const bg =
          state === "current"
            ? COLOR_CURRENT
            : state === "done"
            ? COLOR_DONE
            : COLOR_UPCOMING;
        const width =
          state === "current"
            ? "2rem"
            : state === "done"
            ? "1.5rem"
            : "1rem";

        return (
          <div
            key={i}
            className="h-2 rounded-full transition-all duration-700"
            style={{ backgroundColor: bg, width }}
          />
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
    <div className="w-full min-h-screen flex items-start justify-center px-3 md:px-6 py-6 md:py-14 bg-white">
      {/* MOBILE VERSION */}
      <div className="md:hidden w-full flex flex-col items-center">
        <div className="w-[92%] max-w-xs scale-[1.1] origin-top">
          <Card className="rounded-2xl border border-slate-200 shadow-xl bg-white animate-[fadeIn_0.5s_ease]">
            <CardContent className="p-3 flex flex-col min-h-[500px]">
              <div className="mt-1 mb-4 scale-[0.85]">
                <Stepper />
              </div>

              <h1 className="text-xl font-semibold text-[#102E4A]">
                <span className="font-bold text-[#E59E2C]">Create</span> Organization
              </h1>
              <p className="mt-1 text-slate-600 text-xs">
                Get started in less than 5 minutes
              </p>

              <form
                onSubmit={onSubmitFinal}
                className="mt-4 flex-1 flex flex-col"
              >
                <div
                  key={activeStep}
                  className="space-y-4 flex-1 animate-[fadeUp_0.45s_ease]"
                >
                  {/* STEP 0 — ORG / UNIVERSITY / EMAIL */}
                  {activeStep === 0 && (
                    <div className="space-y-4">
                      <div className="grid gap-1.5">
                        <Label className="text-xs" htmlFor="OrgName">
                          Organization name
                        </Label>
                        <Input
                          id="OrgName"
                          name="OrgName"
                          placeholder="Enter organization name"
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          required
                          className="rounded-xl border-slate-300 text-xs h-8"
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label className="text-xs">University</Label>
                        <Select
                          onValueChange={setSelectedUniversityId}
                          value={selectedUniversityId ?? undefined}
                          name="university"
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
                        <input
                          type="hidden"
                          name="university"
                          value={selectedUniversityId ?? ""}
                          readOnly
                        />
                      </div>

                      <div className="grid gap-1.5">
                        <Label className="text-xs" htmlFor="OrgEmail">
                          Email Address
                        </Label>
                        <Input
                          id="OrgEmail"
                          name="OrgEmail"
                          type="email"
                          placeholder="@your-university.edu.ph"
                          value={orgEmail}
                          onChange={(e) => {
                            const v = e.target.value;
                            setOrgEmail(v);
                            setEmailError(validateEmailInline(v));
                          }}
                          required
                          aria-invalid={!!(emailError || emailDomainError)}
                          aria-describedby={emailDescribedBy}
                          className="rounded-xl border-slate-300 text-xs h-8"
                        />
                        {emailError && (
                          <p
                            id="email-error"
                            className="text-[10px] text-red-600"
                          >
                            {emailError}
                          </p>
                        )}
                        {!emailError && emailDomainError && (
                          <p
                            id="email-domain-error"
                            className="text-[10px] text-red-600"
                          >
                            {emailDomainError}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-500">
                          Use your organization’s official university email.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 1 — DESCRIPTION */}
                  {activeStep === 1 && (
                    <div className="space-y-2">
                      <Label
                        className="text-xs"
                        htmlFor="OrgDescription"
                      >
                        Organization Description
                      </Label>
                      <Textarea
                        id="OrgDescription"
                        name="OrgDescription"
                        placeholder="Brief description of your organization's purpose and activities..."
                        value={orgDescription}
                        onChange={(e) => setOrgDescription(e.target.value)}
                        required
                        className="min-h-[110px] rounded-xl border-slate-300 text-xs"
                      />
                      <p className="text-[10px] text-slate-500">
                        As a school organization, no additional documents are
                        required. Your account will be verified through your
                        university email.
                      </p>
                    </div>
                  )}

                  {/* STEP 2 — SECURITY */}
                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label className="text-xs" htmlFor="OrgPassword">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="OrgPassword"
                            type={showPassword ? "text" : "password"}
                            name="OrgPassword"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Password"
                            required
                            className="rounded-xl border-slate-300 text-xs h-8 pr-8"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          At least 8 characters
                        </p>
                      </div>

                      <div className="grid gap-2">
                        <Label
                          className="text-xs"
                          htmlFor="OrgConfirmPassword"
                        >
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="OrgConfirmPassword"
                            type={showConfirm ? "text" : "password"}
                            name="OrgConfirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                            className="rounded-xl border-slate-300 text-xs h-8 pr-8"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600"
                            aria-label={showConfirm ? "Hide password" : "Show password"}
                          >
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <label className="flex items-start gap-2 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          className="mt-0.5 scale-[0.85]"
                          checked={agree}
                          onChange={(e) => setAgree(e.target.checked)}
                        />
                        <span>
                          I agree with the{" "}
                          <span className="underline">Terms of Service</span> and{" "}
                          <span className="underline">Privacy Policy</span>
                        </span>
                      </label>
                    </div>
                  )}

                  {/* STEP 3 — REVIEW */}
                  {activeStep === 3 && (
                    <div className="space-y-2 text-xs">
                      <div className="rounded-xl border p-3 shadow-sm bg-white">
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          <span className="text-slate-500">Organization</span>
                          <span className="font-medium break-all">
                            {orgName || "—"}
                          </span>

                          <span className="text-slate-500">Email</span>
                          <span className="font-medium break-all">
                            {orgEmail || "—"}
                          </span>

                          <span className="text-slate-500">University</span>
                          <span className="font-medium">
                            {selectedUniversity?.abbreviation || "—"}
                          </span>

                          <span className="text-slate-500">Description</span>
                          <span className="font-medium whitespace-pre-wrap">
                            {orgDescription || "—"}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Make sure your details are correct before registering.
                      </p>
                    </div>
                  )}

                  {error && (
                    <p className="text-xs text-red-600">{error}</p>
                  )}

                  {/* Hidden fields (kept for compatibility) */}
                  <input type="hidden" name="OrgName" value={orgName} />
                  <input type="hidden" name="OrgEmail" value={orgEmail} />
                  {selectedUniversity && (
                    <input
                      type="hidden"
                      name="university"
                      value={String(selectedUniversity.id)}
                    />
                  )}
                  <input
                    type="hidden"
                    name="OrgDescription"
                    value={orgDescription}
                  />
                  <input
                    type="hidden"
                    name="OrgPassword"
                    value={password}
                  />
                  <input
                    type="hidden"
                    name="OrgConfirmPassword"
                    value={confirmPassword}
                  />
                </div>

                {/* BUTTONS — MOBILE */}
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

                  {activeStep < steps.length - 1 ? (
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
                  <p className="mt-4 text-center text-slate-600 text-xs">
          Register an individual account?{" "}
          <Link
            href="/signup"
            className="font-medium"
            style={{ color: COLOR_DONE }}
          >
            Create
          </Link>
        </p>
        </div>
      </div>

      {/* DESKTOP VERSION */}
      <div className="hidden md:block w-full max-w-4xl">
        <Card className="rounded-3xl border border-slate-200 shadow-xl bg-white animate-[fadeIn_0.5s_ease]">
          <CardContent className="p-8 flex flex-col min-h-[500px]">
            <div className="mt-2 mb-6">
              <Stepper />
            </div>

            <h1 className="text-3xl md:text-[32px] font-semibold tracking-tight text-[#102E4A]">
              <span className="font-bold text-[#E59E2C]">Create</span> an
              Organization
            </h1>
            <p className="mt-1 text-slate-600">
              Get started in less than 5 minutes
            </p>

            <form
              onSubmit={onSubmitFinal}
              className="mt-6 flex-1 flex flex-col"
            >
              <div
                key={activeStep}
                className="space-y-6 flex-1 animate-[fadeUp_0.45s_ease]"
              >
                {/* STEP 0 — DESKTOP */}
                {activeStep === 0 && (
                  <div className="space-y-6">
                    <div className="grid gap-2">
                      <Label htmlFor="OrgNameDesk">Organization name</Label>
                      <Input
                        id="OrgNameDesk"
                        name="OrgName"
                        placeholder="Enter organization name"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        required
                        className="rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300"
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>University</Label>
                      <Select
                        onValueChange={setSelectedUniversityId}
                        value={selectedUniversityId ?? undefined}
                        name="university"
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
                      <input
                        type="hidden"
                        name="university"
                        value={selectedUniversityId ?? ""}
                        readOnly
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="OrgEmailDesk">Email Address</Label>
                      <Input
                        id="OrgEmailDesk"
                        name="OrgEmail"
                        type="email"
                        placeholder="@your-university.edu.ph"
                        value={orgEmail}
                        onChange={(e) => {
                          const v = e.target.value;
                          setOrgEmail(v);
                          setEmailError(validateEmailInline(v));
                        }}
                        required
                        aria-invalid={!!(emailError || emailDomainError)}
                        aria-describedby={emailDescribedBy}
                        className="rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300"
                      />
                      {emailError && (
                        <p
                          id="email-error-desktop"
                          className="text-xs text-red-600"
                        >
                          {emailError}
                        </p>
                      )}
                      {!emailError && emailDomainError && (
                        <p
                          id="email-domain-error-desktop"
                          className="text-xs text-red-600"
                        >
                          {emailDomainError}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        Use your organization’s official university email.
                      </p>
                    </div>
                  </div>
                )}

                {/* STEP 1 — DESCRIPTION DESKTOP */}
                {activeStep === 1 && (
                  <div className="space-y-4">
                    <Label htmlFor="OrgDescriptionDesk">
                      Organization Description
                    </Label>
                    <Textarea
                      id="OrgDescriptionDesk"
                      name="OrgDescription"
                      placeholder="Brief description of your organization's purpose and activities..."
                      value={orgDescription}
                      onChange={(e) => setOrgDescription(e.target.value)}
                      required
                      className="min-h-[140px] rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300"
                    />
                    <p className="text-xs text-slate-500">
                      Note: As a school organization, no additional documents
                      are required. Your account will be verified through your
                      university email.
                    </p>
                  </div>
                )}

                {/* STEP 2 — SECURITY DESKTOP */}
                {activeStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="OrgPasswordDesk">Password</Label>
                        <div className="relative">
                          <Input
                            id="OrgPasswordDesk"
                            type={showPassword ? "text" : "password"}
                            name="OrgPassword"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter Password"
                            required
                            className="rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#102E4A] transition"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <p className="text-xs text-slate-500 mt-1">
                            At least 8 characters
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="OrgConfirmPasswordDesk">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="OrgConfirmPasswordDesk"
                            type={showConfirm ? "text" : "password"}
                            name="OrgConfirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                            className="rounded-xl border-slate-300 shadow-sm hover:shadow-md transition-all duration-300 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-600 hover:text-[#102E4A] transition"
                            aria-label={showConfirm ? "Hide password" : "Show password"}
                          >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                      />
                      <span>
                        I agree with the{" "}
                        <span className="underline">Terms of Service</span> and{" "}
                        <span className="underline">Privacy Policy</span>
                      </span>
                    </label>
                  </div>
                )}

                {/* STEP 3 — REVIEW DESKTOP */}
                {activeStep === 3 && (
                  <div className="space-y-4 text-sm">
                    <div className="rounded-xl border p-4 shadow-sm bg-white">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-slate-500">Organization</span>
                        <span className="font-medium break-all">
                          {orgName || "—"}
                        </span>

                        <span className="text-slate-500">Email</span>
                        <span className="font-medium break-all">
                          {orgEmail || "—"}
                        </span>

                        <span className="text-slate-500">University</span>
                        <span className="font-medium">
                          {selectedUniversity?.abbreviation || "—"}
                        </span>

                        <span className="text-slate-500">Description</span>
                        <span className="font-medium whitespace-pre-wrap">
                          {orgDescription || "—"}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500">
                      Make sure your details are correct before registering.
                    </p>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}

                {/* Hidden fields (kept for compatibility) */}
                <input type="hidden" name="OrgName" value={orgName} />
                <input type="hidden" name="OrgEmail" value={orgEmail} />
                {selectedUniversity && (
                  <input
                    type="hidden"
                    name="university"
                    value={String(selectedUniversity.id)}
                  />
                )}
                <input
                  type="hidden"
                  name="OrgDescription"
                  value={orgDescription}
                />
                <input
                  type="hidden"
                  name="OrgPassword"
                  value={password}
                />
                <input
                  type="hidden"
                  name="OrgConfirmPassword"
                  value={confirmPassword}
                />
              </div>

              {/* BUTTONS — DESKTOP */}
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

                {activeStep < steps.length - 1 ? (
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
          Register an individual account?{" "}
          <Link
            href="/signup"
            className="font-medium"
            style={{ color: COLOR_DONE }}
          >
            Create
          </Link>
        </p>
      </div>
    </div>
  );
}

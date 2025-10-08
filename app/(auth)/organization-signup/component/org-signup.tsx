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
      (l) => l.length > 0 && /^[A-Z0-9-]+$/i.test(l) && !l.startsWith("-") && !l.endsWith("-")
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
  const [selectedUniversityId, setSelectedUniversityId] = useState<string | null>(null);
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
    () => universities.find((u) => String(u.id) === selectedUniversityId) || null,
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

  // steps
  const stepIsValid = useMemo(() => {
    if (activeStep === 0) {
      const uniDomain = normalizeDomain(selectedUniversity?.domain);
      const domainOK =
        !selectedUniversity ||
        (!!orgEmail && emailLooksValid(orgEmail) && !!uniDomain && orgEmail.toLowerCase().endsWith(uniDomain));

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

    if (!selectedUniversity) return setError("Please select a university.");
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
    <div className="flex items-center gap-3">
      {steps.map((_, i) => {
        const state = i < activeStep ? "done" : i === activeStep ? "current" : "upcoming";
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

  const emailDescribedBy =
    [emailError ? "email-error" : "", !emailError && emailDomainError ? "email-domain-error" : ""]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className="w-full min-h-screen flex items-start justify-center px-6 py-8 md:py-14">
      <div className="w-full max-w-2xl">
        <Card className="rounded-2xl border shadow-sm">
          <CardContent className="p-6 md:p-8 flex flex-col min-h-[640px]">
            {/* Stepper */}
            <div className="mt-2 mb-6">
              <Stepper />
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-[32px] font-semibold tracking-tight">
              <span className="font-bold" style={{ color: COLOR_DONE }}>
                Create
              </span>{" "}
              an Account
            </h1>
            <p className="mt-1 text-slate-500">Get started in less than 5 minutes</p>

            {/* Form */}
            <form onSubmit={onSubmitFinal} className="mt-6 flex-1 flex flex-col">
              <div className="space-y-6 flex-1 min-h-[360px]">
                {/* STEP 0: Organization → University → Email */}
                {activeStep === 0 && (
                  <div className="space-y-5">
                    {/* Org name */}
                    <div className="grid gap-2">
                      <Label htmlFor="OrgName">Organization name</Label>
                      <Input
                        id="OrgName"
                        name="OrgName"
                        placeholder="Enter organization name"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        required
                      />
                    </div>

                    {/* University */}
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
                      <input
                        type="hidden"
                        name="university"
                        value={selectedUniversityId ?? ""}
                        readOnly
                      />
                    </div>

                    {/* Email */}
                    <div className="grid gap-2">
                      <Label htmlFor="OrgEmail">Email Address</Label>
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
                      />
                      {emailError && (
                        <p id="email-error" className="text-xs text-red-600">
                          {emailError}
                        </p>
                      )}
                      {!emailError && emailDomainError && (
                        <p id="email-domain-error" className="text-xs text-red-600">
                          {emailDomainError}
                        </p>
                      )}
                      <p className="text-xs text-slate-500">
                        Use your organization’s official university email address.
                      </p>
                    </div>
                  </div>
                )}

                {/* Description */}
                {activeStep === 1 && (
                  <div className="space-y-3">
                    <Label htmlFor="OrgDescription">Organization Description</Label>
                    <Textarea
                      id="OrgDescription"
                      name="OrgDescription"
                      placeholder="Brief description of your organization's purpose and activities..."
                      value={orgDescription}
                      onChange={(e) => setOrgDescription(e.target.value)}
                      required
                      className="min-h-[120px]"
                    />
                    <p className="text-xs text-slate-500">
                      Note: As a school organization, no additional documents are required. Your
                      account will be verified through your university email.
                    </p>
                  </div>
                )}

                {/* Security */}
                {activeStep === 2 && (
                  <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="OrgPassword">Password</Label>
                        <div className="relative">
                          <Input
                            id="OrgPassword"
                            type={showPassword ? "text" : "password"}
                            name="OrgPassword"
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
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            title={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">At least 8 characters</p>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="OrgConfirmPassword">Confirm Password</Label>
                        <div className="relative">
                          <Input
                            id="OrgConfirmPassword"
                            type={showConfirm ? "text" : "password"}
                            name="OrgConfirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                            className="pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirm((s) => !s)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-600 hover:text-slate-800"
                            aria-label={showConfirm ? "Hide password" : "Show password"}
                            title={showConfirm ? "Hide password" : "Show password"}
                          >
                            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <p className="text-xs invisible select-one">spacer</p>
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

                {/* STEP 3: Review */}
                {activeStep === 3 && (
                  <div className="space-y-4 text-sm">
                    <div className="rounded-lg border p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <span className="text-slate-500">Organization</span>
                        <span className="font-medium break-all">{orgName || "—"}</span>

                        <span className="text-slate-500">Email</span>
                        <span className="font-medium break-all">{orgEmail || "—"}</span>

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

                {error && <p className="text-sm text-red-600">{error}</p>}

                <input type="hidden" name="OrgName" value={orgName} />
                <input type="hidden" name="OrgEmail" value={orgEmail} />
                {selectedUniversity && (
                  <input type="hidden" name="university" value={String(selectedUniversity.id)} />
                )}
                <input type="hidden" name="OrgDescription" value={orgDescription} />
                <input type="hidden" name="OrgPassword" value={password} />
                <input type="hidden" name="OrgConfirmPassword" value={confirmPassword} />
              </div>

              {/* Footer */}
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
          Register an individual account?{" "}
          <Link href="/signup" className="font-medium" style={{ color: COLOR_DONE }}>
            Create
          </Link>
        </p>
      </div>
    </div>
  );
}

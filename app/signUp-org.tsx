"use client";

import React, { useMemo, useState } from "react";

const steps = [
  "Organization",
  "University",
  "Description",
  "Security",
  "Review",
] as const;

type FormDataShape = {
  orgName: string;
  email: string;
  university: string;
  description: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
};

type FieldEl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const UNIVERSITY_LABELS: Record<string, string> = {
  ADNU: "Ateneo de Naga University (ADNU)",
  USI: "Universidad de Sta. Isabel (USI)",
  UNC: "University of Nueva Caceres (UNC)",
  NCF: "Naga College Foundation (NCF)",
  BISCAST: "BISCAST",
};

export default function OrganizationAccountSignUpForm() {
  const [activeStep, setActiveStep] = useState(0);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormDataShape>({
    orgName: "",
    email: "",
    university: "",
    description: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [touched, setTouched] = useState<
    Record<keyof FormDataShape | string, boolean>
  >({});

  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  // ---------------- Handlers ----------------
  const handleChange = (e: React.ChangeEvent<FieldEl>) => {
    const target = e.target;
    const { name } = target;

    let newValue: string | boolean;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      newValue = target.checked;
    } else {
      newValue = target.value;
    }
    setFormData((prev) => ({ ...prev, [name]: newValue as never }));
  };

  const markTouched = (name: keyof FormDataShape | string) =>
    setTouched((t) => ({ ...t, [name]: true }));

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ---------------- Validation ----------------
  const getError = (name: keyof FormDataShape): string => {
    const f = formData;
    switch (name) {
      case "orgName":
        if (!f.orgName.trim()) return "Organization name is required.";
        if (f.orgName.trim().length < 3) return "Enter at least 3 characters.";
        return "";
      case "email":
        if (!f.email.trim()) return "Email is required.";
        if (!emailRegex.test(f.email)) return "Enter a valid email address.";
        return "";
      case "university":
        if (!f.university) return "Please select a university.";
        return "";
      case "description":
        if (!f.description.trim()) return "Description is required.";
        if (f.description.trim().length < 20)
          return "Please add at least 20 characters.";
        return "";
      case "password":
        if (!f.password) return "Password is required.";
        if (f.password.length < 8) return "Use at least 8 characters.";
        return "";
      case "confirmPassword":
        if (!f.confirmPassword) return "Confirm your password.";
        if (f.confirmPassword !== f.password) return "Passwords do not match.";
        return "";
      case "agree":
        if (!f.agree) return "You must accept the Terms and Privacy Policy.";
        return "";
      default:
        return "";
    }
  };

  // Keys to validate per step (Review has no fields)
  const currentStepFields = useMemo<(keyof FormDataShape)[]>(() => {
    switch (activeStep) {
      case 0:
        return ["orgName", "email"];
      case 1:
        return ["university"];
      case 2:
        return ["description"];
      case 3:
        return ["password", "confirmPassword", "agree"];
      case 4: // Review
        return [];
      default:
        return [];
    }
  }, [activeStep]);

  const isCurrentStepValid = useMemo(
    () => currentStepFields.every((f) => getError(f) === ""),
    [currentStepFields, formData, getError]
  );

  const handleNext = () => {
    if (isCurrentStepValid) {
      setActiveStep((s) => Math.min(s + 1, steps.length - 1));
      setError(null);
    } else {
      currentStepFields.forEach((f) => markTouched(f));
    }
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((s) => Math.max(s - 1, 0));
  };

  // ---------------- Register on Review ----------------
  const handleRegister = async () => {
    setError(null);
    setSuccess(null);
    setRegistering(true);
    try {
      const fd = new FormData();
      fd.append("orgName", formData.orgName);
      fd.append("email", formData.email);
      fd.append("university", formData.university);
      fd.append("description", formData.description);
      fd.append("password", formData.password);
      fd.append("confirmPassword", formData.confirmPassword);
      fd.append("agree", String(formData.agree));

      // const res = await register(fd); // your server action
      // if (res?.error) { setError(res.error); return; }

      setSuccess("Organization registered! Please check your email to verify.");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setRegistering(false);
    }
  };

  const maskedPassword = "•".repeat(Math.max(8, formData.password.length || 8));

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      {/* No onSubmit; buttons control flow explicitly */}
      <form className="w-full">
        <div className="mt-6">
          <div className="p-10">
            <div className="rounded-lg border bg-white p-5 text-sm text-gray-800 shadow-sm">
              {/* ---------- STEPPER (inside content, above titles) ---------- */}
              <div className="mb-6">
                <div className="relative w-full">
                  {/* Track line (gray background) */}
                  <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-gray-200" />

                  {/* Progress line (colored up to active step) */}
                  <div
                    className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-[#102E4A] transition-all duration-300"
                    style={{
                      width:
                        steps.length > 1
                          ? `${
                              (Math.min(activeStep, steps.length - 1) /
                                (steps.length - 1)) *
                              100
                            }%`
                          : "100%",
                    }}
                  />

                  {/* Circles */}
                  <ol className="relative flex items-center justify-between">
                    {steps.map((_, idx) => {
                      const state =
                        idx < activeStep
                          ? "complete"
                          : idx === activeStep
                          ? "current"
                          : "upcoming";

                      return (
                        <li key={idx} className="flex flex-col items-center">
                          <div
                            aria-current={
                              state === "current" ? "step" : undefined
                            }
                            className={[
                              "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors z-10",
                              state === "complete" &&
                                "border-[#102E4A] bg-[#102E4A] text-white",
                              state === "current" &&
                                "border-[#102E4A] bg-[#102E4A] text-white",
                              state === "upcoming" &&
                                "border-gray-300 bg-white text-gray-400",
                            ].join(" ")}
                          />
                        </li>
                      );
                    })}
                  </ol>
                </div>
              </div>

              {/* ---------- STEPS CONTENT ---------- */}
              {/* STEP 1 — Organization */}
              {activeStep === 0 && (
                <div>
                  <div className="mb-4 text-center">
                    <h1 className="text-lg font-semibold">Organization Info</h1>
                    <p className="text-sm text-gray-500">
                      Tell us who you are and how we can reach you.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Organization name
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4 0-8 2-8 6v1h16v-1c0-4-4-6-8-6Z"
                              stroke="currentColor"
                            />
                          </svg>
                        </span>
                        <input
                          name="orgName"
                          value={formData.orgName}
                          onChange={handleChange}
                          onBlur={() => markTouched("orgName")}
                          className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                          placeholder="e.g., Tech Tigers Org"
                        />
                      </div>
                      {touched.orgName && getError("orgName") && (
                        <p className="mt-1 text-xs text-red-600">
                          {getError("orgName")}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Email Address
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path d="M3 7l9 6 9-6" stroke="currentColor" />
                            <rect
                              x="3"
                              y="5"
                              width="18"
                              height="14"
                              rx="2"
                              ry="2"
                              stroke="currentColor"
                            />
                          </svg>
                        </span>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          onBlur={() => markTouched("email")}
                          className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                          placeholder="org@university.edu"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Use your organization’s official email.
                      </p>
                      {touched.email && getError("email") && (
                        <p className="mt-1 text-xs text-red-600">
                          {getError("email")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 — University */}
              {activeStep === 1 && (
                <div>
                  <div className="mb-4 text-center">
                    <h1 className="text-lg font-semibold">
                      University Selection
                    </h1>
                    <p className="text-sm text-gray-500">
                      Connect your organization to the right university.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        University
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M3 10l9-6 9 6-9 6-9-6Z"
                              stroke="currentColor"
                            />
                            <path
                              d="M7 12v5a5 5 0 0 0 10 0v-5"
                              stroke="currentColor"
                            />
                          </svg>
                        </span>
                        <select
                          name="university"
                          value={formData.university}
                          onChange={handleChange}
                          onBlur={() => markTouched("university")}
                          className="w-full appearance-none rounded-md border border-gray-300 pl-9 pr-10 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                        >
                          <option value="">Select University</option>
                          <option value="ADNU">{UNIVERSITY_LABELS.ADNU}</option>
                          <option value="USI">{UNIVERSITY_LABELS.USI}</option>
                          <option value="UNC">{UNIVERSITY_LABELS.UNC}</option>
                          <option value="NCF">{UNIVERSITY_LABELS.NCF}</option>
                          <option value="BISCAST">
                            {UNIVERSITY_LABELS.BISCAST}
                          </option>
                        </select>
                      </div>
                      {touched.university && getError("university") && (
                        <p className="mt-1 text-xs text-red-600">
                          {getError("university")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 — Description */}
              {activeStep === 2 && (
                <div>
                  <div className="mb-4 text-center">
                    <h1 className="text-lg font-semibold">
                      Organization Description
                    </h1>
                    <p className="text-sm text-gray-500">
                      Share your group&apos;s purpose and activities.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="mb-1 block text-sm font-medium">
                      Organization Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      onBlur={() => markTouched("description")}
                      rows={5}
                      placeholder="Brief description of your organization’s purpose and activities…"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                    />
                    <p className="text-xs text-gray-500">
                      Note: As a school organization, no additional documents
                      are required. Your account will be verified through your
                      university email.
                    </p>
                    {touched.description && getError("description") && (
                      <p className="mt-1 text-xs text-red-600">
                        {getError("description")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4 — Security */}
              {activeStep === 3 && (
                <div>
                  <div className="mb-4 text-center">
                    <h1 className="text-lg font-semibold">Security</h1>
                    <p className="text-sm text-gray-500">
                      Secure your account with a strong password.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Password
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <rect
                                x="4"
                                y="11"
                                width="16"
                                height="9"
                                rx="2"
                                stroke="currentColor"
                              />
                              <path
                                d="M8 11V7a4 4 0 1 1 8 0v4"
                                stroke="currentColor"
                              />
                            </svg>
                          </span>
                          <input
                            type={showPwd ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={() => markTouched("password")}
                            className="w-full rounded-md border border-gray-300 pl-9 pr-10 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwd((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-600 hover:bg-gray-100"
                            aria-label="Toggle password visibility"
                          >
                            {showPwd ? "🙈" : "👁️"}
                          </button>
                        </div>
                        {touched.password && getError("password") && (
                          <p className="mt-1 text-xs text-red-600">
                            {getError("password")}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <rect
                                x="4"
                                y="11"
                                width="16"
                                height="9"
                                rx="2"
                                stroke="currentColor"
                              />
                              <path
                                d="M8 11V7a4 4 0 1 1 8 0v4"
                                stroke="currentColor"
                              />
                            </svg>
                          </span>
                          <input
                            type={showPwd2 ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={() => markTouched("confirmPassword")}
                            className="w-full rounded-md border border-gray-300 pl-9 pr-10 py-2 text-sm outline-none focus:border-blue-500 focus:ring focus:ring-blue-200"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPwd2((v) => !v)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-600 hover:bg-gray-100"
                            aria-label="Toggle confirm password visibility"
                          >
                            {showPwd2 ? "🙈" : "👁️"}
                          </button>
                        </div>
                        {touched.confirmPassword &&
                          getError("confirmPassword") && (
                            <p className="mt-1 text-xs text-red-600">
                              {getError("confirmPassword")}
                            </p>
                          )}
                      </div>
                    </div>

                    <label className="flex items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="agree"
                        checked={formData.agree}
                        onChange={handleChange}
                        onBlur={() => markTouched("agree")}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>
                        I agree with the{" "}
                        <a href="#" className="text-blue-600 underline">
                          Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-blue-600 underline">
                          Privacy Policy
                        </a>
                        .
                      </span>
                    </label>
                    {touched.agree && getError("agree") && (
                      <p className="mt-1 text-xs text-red-600">
                        {getError("agree")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 5 — Review */}
              {activeStep === 4 && (
                <div>
                  <div className="mb-4 text-center">
                    <h1 className="text-lg font-semibold">
                      Review your details
                    </h1>
                    <p className="text-sm text-gray-500">
                      Make sure everything looks correct before registering.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Organization */}
                    <section className="rounded-md border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-semibold">Organization</h2>
                        <button
                          type="button"
                          className="text-xs text-blue-600 underline"
                          onClick={() => setActiveStep(0)}
                        >
                          Edit
                        </button>
                      </div>
                      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-gray-500">
                            Organization Name
                          </dt>
                          <dd className="text-sm">{formData.orgName || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500">Email</dt>
                          <dd className="text-sm break-all">
                            {formData.email || "—"}
                          </dd>
                        </div>
                      </dl>
                    </section>

                    {/* University */}
                    <section className="rounded-md border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-semibold">University</h2>
                        <button
                          type="button"
                          className="text-xs text-blue-600 underline"
                          onClick={() => setActiveStep(1)}
                        >
                          Edit
                        </button>
                      </div>
                      <dl>
                        <div>
                          <dt className="text-xs text-gray-500">
                            Selected University
                          </dt>
                          <dd className="text-sm">
                            {UNIVERSITY_LABELS[formData.university] || "—"}
                          </dd>
                        </div>
                      </dl>
                    </section>

                    {/* Description */}
                    <section className="rounded-md border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-semibold">Description</h2>
                        <button
                          type="button"
                          className="text-xs text-blue-600 underline"
                          onClick={() => setActiveStep(2)}
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">
                        {formData.description || "—"}
                      </p>
                    </section>

                    {/* Security */}
                    <section className="rounded-md border p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-sm font-semibold">Security</h2>
                        <button
                          type="button"
                          className="text-xs text-blue-600 underline"
                          onClick={() => setActiveStep(3)}
                        >
                          Edit
                        </button>
                      </div>
                      <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                        <div>
                          <dt className="text-xs text-gray-500">Password</dt>
                          <dd className="text-sm">{maskedPassword}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500">
                            Terms Accepted
                          </dt>
                          <dd className="text-sm">
                            {formData.agree ? "Yes" : "No"}
                          </dd>
                        </div>
                      </dl>
                    </section>
                  </div>

                  {error && (
                    <p className="mt-4 text-center text-sm text-red-600">
                      {error}
                    </p>
                  )}
                  {success && (
                    <p className="mt-4 text-center text-sm text-green-600">
                      {success}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ---------- Actions (bottom) ---------- */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={activeStep === 0}
                className="inline-flex items-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <div className="flex-1" />
              {activeStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!isCurrentStepValid}
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {activeStep === steps.length - 2 ? "Review" : "Next"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={registering}
                  className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {registering ? "Registering..." : "Register"}
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

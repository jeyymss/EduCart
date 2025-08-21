"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { register } from "../actions";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

type Role = "Student" | "Faculty" | "Alumni";

export default function SignUpForm() {
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState<
    { id: number; abbreviation: string; domain: string }[]
  >([]);
  const [selectedUniversityId, setSelectedUniversityId] = useState<
    string | null
  >(null);

  const [idImage, setIdImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    "Verified" | "Failed" | null
  >(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const roles: Role[] = ["Student", "Faculty", "Alumni"];

  useEffect(() => {
    const fetchUniversities = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("universities")
        .select("id, abbreviation, domain");

      setUniversities(data ?? []);
    };

    fetchUniversities();
  }, []);

  const handleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIdImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setVerificationStatus(null);
  };

  const verifyID = async () => {
    if (!idImage || !fullName) return;

    setIsVerifying(true);
    setVerificationStatus(null);

    const formData = new FormData();
    formData.append("image", idImage);

    try {
      const res = await fetch(
        "https://ocr-api-production-53ff.up.railway.app/api/ocr",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      const extracted = data?.Name?.toLowerCase().trim();
      const typed = fullName.toLowerCase().trim();

      if (extracted && typed && extracted === typed) {
        setVerificationStatus("Verified");
      } else {
        setVerificationStatus("Failed");
      }
    } catch (err) {
      setVerificationStatus("Failed");
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!selectedRole) {
      setError("Please select a role.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (verificationStatus !== "Verified") {
      setError("Please verify your ID before registering.");
      return;
    }

    const selectedUniversity = universities.find(
      (u) => String(u.id) === selectedUniversityId
    );

    if (!selectedUniversity) {
      setError("Please select a university.");
      return;
    }

    if (
      (selectedRole === "Student" || selectedRole === "Faculty") &&
      !email.endsWith(selectedUniversity.domain)
    ) {
      setError(`Email must end with ${selectedUniversity.domain}`);
      return;
    }

    setLoading(true);
    setShowLoadingModal(true);

    const formData = new FormData(e.currentTarget);

    const res = await register(formData);

    setShowLoadingModal(false);

    if (res?.error) {
      setError(res.error);
      return;
    }

    setShowSuccessModal(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="flex flex-col">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Register your account</CardTitle>
              <Link href="/login">
                <Button variant="link">Log In</Button>
              </Link>
            </div>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                {/* Role Selection */}
                <div>
                  <Label>I am:</Label>
                  <Input type="hidden" name="role" value={selectedRole} />
                  <div className="flex justify-center gap-2 mt-2">
                    {roles.map((role) => (
                      <Button
                        key={role}
                        type="button"
                        className={`rounded-full px-4 ${
                          selectedRole === role
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700"
                        }`}
                        onClick={() => handleSelect(role)}
                      >
                        {role}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* University */}
                <div className="grid gap-2">
                  <Label>University</Label>
                  <Select
                    onValueChange={(value) => setSelectedUniversityId(value)}
                    name="university"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a university" />
                    </SelectTrigger>
                    <SelectContent>
                      {universities.map((uni) => (
                        <SelectItem key={uni.id} value={String(uni.id)}>
                          {uni.abbreviation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Full Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                  <p className="text-xs text-center text-gray-500">
                    Do not include your middle initial.
                  </p>
                </div>

                {/* Enter Email */}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Enter Password */}
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Enter Confirm Password */}
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {/* ID Upload and Verification */}
                <div className="grid gap-2">
                  <Label htmlFor="idImage">University/Alumni ID</Label>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border border-dashed border-gray-300 h-40 w-full mt-2 rounded-md cursor-pointer flex justify-center items-center bg-white overflow-hidden"
                  >
                    {previewUrl ? (
                      <>
                        <Image
                          alt="Upload ID Preview"
                          fill
                          sizes="100vw"
                          src={previewUrl}
                          className="object-cover w-full h-full rounded-md"
                        />

                        {/* Status or Verify Button */}
                        <div className="absolute bottom-1 right-1">
                          {isVerifying ? (
                            <span className="text-xs text-green-700 animate-pulse">
                              Verifying...
                            </span>
                          ) : verificationStatus ? (
                            <div
                              className={`text-xs px-2 py-1 rounded-full ${
                                verificationStatus === "Verified"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {verificationStatus === "Verified"
                                ? "✔ Verified"
                                : "✖ Failed"}
                            </div>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              className="text-xs px-2 py-1"
                              onClick={(e) => {
                                e.stopPropagation(); // prevent file picker from triggering
                                verifyID();
                              }}
                            >
                              Verify ID
                            </Button>
                          )}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-400 text-sm text-center px-4">
                        <div className="flex flex-col items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 mb-1 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4-4m0 0l4-4m-4 4h12"
                            />
                          </svg>
                          Upload your University/Alumni ID
                        </div>
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    name="idImage"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <Button
                    type="button"
                    onClick={verifyID}
                    disabled={!idImage || !fullName || isVerifying}
                    className="mt-1"
                  >
                    {isVerifying ? "Verifying..." : "Verify ID"}
                  </Button>

                  <p className="text-xs text-center text-gray-500">
                    This ID will be used for verification purposes.
                  </p>
                  {verificationStatus === "Failed" && (
                    <p className="text-xs text-red-600 text-center">
                      ID verification failed.
                    </p>
                  )}
                </div>

                {/* Errors */}
                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}

                {/* Updates the status of user to Verified */}
                {verificationStatus === "Verified" && (
                  <input
                    type="hidden"
                    name="verificationStatus"
                    value="Verified"
                  />
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={verificationStatus !== "Verified" && loading}
                >
                  Register
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div>
          <h3>
            Register an Organiztion?{" "}
            <Link href={"/organization-account"}>
              <span>Create</span>
            </Link>
          </h3>
        </div>
      </div>

      {/* Loading Modal */}
      {showLoadingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4">
            <h2 className="text-lg font-medium text-gray-700 animate-pulse">
              Creating your account...
            </h2>
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4">
            <h2 className="text-xl font-bold text-green-700">
              Registered Successfully!
            </h2>
            <p className="text-sm text-gray-600">
              Please check your email to confirm your account.
            </p>
            <Link href={"/login"}>
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

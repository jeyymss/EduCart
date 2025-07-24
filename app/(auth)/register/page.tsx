"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "./actions";
import { useState } from "react";
import Link from "next/link";

type Role = "Student" | "Faculty" | "Alumni";

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const roles: Role[] = ["Student", "Faculty", "Alumni"];
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (role: Role) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const role = formData.get("role") as string;

    if (!role) {
      setError("Please select a role.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await register(formData);
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Link href={"/login"}>
              <Button variant="link">Log In</Button>
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              {/* ETNER ROLE */}
              <Label>I am:</Label>
              <Input type="hidden" name="role" value={selectedRole} />
              <div className="w-full flex items-center justify-center gap-4">
                {roles.map((role: Role) => (
                  <Button
                    key={role}
                    onClick={() => handleSelect(role)}
                    className={`px-4 py-2 border rounded-full 
                  ${
                    selectedRole === role
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-transparent text-gray-700 border-gray-400"
                  }
                  hover:bg-blue-100 transition`}
                    type="button"
                  >
                    {role}
                  </Button>
                ))}
              </div>
              {/* ENTER NAME */}
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="name"
                  placeholder="Enter Full Name"
                  required
                />
              </div>
              {/* ENTER EMAIL */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                {/* ENTER PASSWORD */}
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  placeholder="Enter Password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                {/* ENTER CONFIRM PASSWORD */}
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="Enter Confirm Password"
                />
              </div>
            </div>
            {error && (
              <div className="text-red-600 text-sm text-center mb-4">
                {error}
              </div>
            )}
            <div className="mt-3 flex flex-col gap-2">
              <Button type="submit" className="w-full">
                Register
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { OrgRegister } from "../actions";

export default function OrgSignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedUniversityId, setSelectedUniversityId] = useState<
    string | null
  >(null);
  const [universities, setUniversities] = useState<
    { id: number; abbreviation: string; domain: string }[]
  >([]);

  useEffect(() => {
    const fetchUniversities = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("universities")
        .select("id, abbreviation, domain")
        .order("abbreviation", { ascending: true });
      if (!error) setUniversities(data ?? []);
    };
    fetchUniversities();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const selected = universities.find(
      (u) => String(u.id) === selectedUniversityId
    );
    if (!selected) {
      setLoading(false);
      setError("Please select a university.");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Radix Select doesn’t serialize by itself – set it explicitly
    formData.set("university", String(selected.id));

    const res = await OrgRegister(formData);
    setLoading(false);

    if (res?.error) {
      setError(res.error);
      return;
    }

    alert("Organization registered (status: Pending). You can log in now.");
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-3">
        <div>
          <Label htmlFor="OrgName">Organization Name</Label>
          <Input id="OrgName" type="text" name="OrgName" required />
        </div>

        <div>
          <Label htmlFor="OrgEmail">Email Address</Label>
          <Input id="OrgEmail" type="email" name="OrgEmail" required />
        </div>

        <div className="grid gap-2">
          <Label>University</Label>
          <Select
            onValueChange={(v) => setSelectedUniversityId(v)}
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
          <input
            type="hidden"
            name="university"
            value={selectedUniversityId ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="OrgDescription">Organization Description</Label>
          <Textarea id="OrgDescription" name="OrgDescription" required />
        </div>

        <div>
          <Label htmlFor="OrgPassword">Password</Label>
          <Input id="OrgPassword" type="password" name="OrgPassword" required />
        </div>

        <div>
          <Label htmlFor="OrgConfirmPassword">Confirm Password</Label>
          <Input
            id="OrgConfirmPassword"
            type="password"
            name="OrgConfirmPassword"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </Button>
      </form>
    </div>
  );
}

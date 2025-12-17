"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, Send } from "lucide-react";
import Link from "next/link";
import { useUserProfile } from "@/hooks/useUserProfile";
import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export function SettingsPanel() {
  const supabase = createClient();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Contact Admin Modal States
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  const { data: user } = useUserProfile();

  // credits link based on role
  const role = user?.role;
  const creditsLink =
    role === "Organization"
      ? "/credits/organization"
      : "/credits/individual";

  /* ================= CHANGE PASSWORD HANDLER ================= */

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      if (!currentPassword || !newPassword) {
        throw new Error("Please fill in all fields");
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        throw new Error("User not authenticated");
      }

      // 🔐 Re-authenticate with current password
      const { error: signInError } =
        await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      // 🔁 Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setCurrentPassword("");
      setNewPassword("");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CONTACT ADMIN HANDLER ================= */

  const handleContactAdmin = async () => {
    setContactError(null);
    setContactSuccess(false);
    setContactLoading(true);

    try {
      if (!contactSubject.trim() || !contactMessage.trim()) {
        throw new Error("Please fill in both subject and message");
      }

      // get logged-in user (email will be used as sender)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.email) {
        throw new Error("User not authenticated");
      }

      const res = await fetch("/api/contact-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: user.user_metadata?.full_name || "EduCart User",
          email: user.email,
          subject: contactSubject,
          message: contactMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setContactSuccess(true);
      setContactSubject("");
      setContactMessage("");

      // auto-close modal
      setTimeout(() => {
        setShowContactModal(false);
        setContactSuccess(false);
      }, 2000);
    } catch (err: any) {
      setContactError(err.message || "Something went wrong");
    } finally {
      setContactLoading(false);
    }
  };


  /* ================= UI ================= */

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* ================= ACCOUNT ================= */}
      <section className="space-y-3">
        <h3 className="font-semibold text-lg">Account</h3>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>
            <Link
              href={creditsLink}
              className="font-medium hover:text-primary"
            >
              Buy Posting Credits →
            </Link>
            <p className="text-xs">
              Purchase credits to create posts and boost your content visibility.
            </p>
          </li>
        </ul>
      </section>

      {/* ================= SECURITY ================= */}
      <section className="space-y-3">
        <h3 className="font-semibold text-lg">Security</h3>
        <p className="text-sm text-muted-foreground">Change Password</p>

        <div className="space-y-2">
          {/* CURRENT PASSWORD */}
          <div className="relative">
            <Input
              type={showCurrent ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* NEW PASSWORD */}
          <div className="relative">
            <Input
              type={showNew ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* ACTION BUTTON */}
          <Button
            size="sm"
            onClick={handleChangePassword}
            disabled={loading}
            className="bg-[#E59E2C] text-white hover:bg-[#d4881f]"
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>

          {/* FEEDBACK */}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && (
            <p className="text-sm text-green-600">
              Password updated successfully
            </p>
          )}
        </div>
      </section>

      {/* ================= NOTIFICATIONS ================= */}
      <section className="space-y-3">
        <h3 className="font-semibold text-lg">Notifications</h3>
        <div className="flex flex-col space-y-2 text-sm">
          {[
            "Transaction Reminders",
            "Comments",
            "Reviews Received",
            "Reports",
          ].map((label) => (
            <div key={label} className="flex items-center justify-between">
              <span>{label}</span>
              <Switch defaultChecked />
            </div>
          ))}
        </div>
      </section>

      {/* ================= SUPPORT ================= */}
      <section className="space-y-3">
        <h3 className="font-semibold text-lg">Support</h3>
        <p className="text-sm text-muted-foreground">
          <button
            onClick={() => setShowContactModal(true)}
            className="font-medium hover:text-primary underline"
          >
            Contact Admin →
          </button>
          <br />
          Reach out to administrators for help, technical issues, or account
          support.
        </p>
      </section>

      {/* ================= CONTACT ADMIN MODAL ================= */}
      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Contact Admin</DialogTitle>
            <DialogDescription>
              Send a message to the administrators. We'll get back to you as soon as possible.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Subject Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                placeholder="Enter subject"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                disabled={contactLoading}
              />
            </div>

            {/* Message Textarea */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder="Enter your message"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                disabled={contactLoading}
                rows={6}
                className="resize-none"
              />
            </div>

            {/* Feedback Messages */}
            {contactError && (
              <p className="text-sm text-red-500">{contactError}</p>
            )}
            {contactSuccess && (
              <p className="text-sm text-green-600">
                Message sent successfully! We'll get back to you soon.
              </p>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleContactAdmin}
              disabled={contactLoading || contactSuccess}
              className="w-full bg-[#E59E2C] text-white hover:bg-[#d4881f]"
            >
              <Send className="mr-2 h-4 w-4" />
              {contactLoading ? "Sending..." : "Submit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// src/routes/auth.tsx
// Front‑end login page for the School Management System.
// This file has been refactored to:
//   • Use a placeholder Firebase client (see src/integrations/firebase/client.ts).
//   • Remove Supabase backend dependencies.
//   • Add a role selector (Lecturer, Student, Parent, Administrator).
//   • Keep the existing Tailwind UI styling.

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
// Placeholder Firebase client – replace the config with your own project credentials.
import { firebaseAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "@/integrations/firebase/client";
// Removed Lovable CSS import (frontend only)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) =>
    ({ reason: typeof s["reason"] === "string" ? s["reason"] : undefined }),
  head: () => ({
    meta: [
      { title: "Sign in — Slate" },
      { name: "description", content: "Sign in or create your Slate school account." },
      { property: "og:title", content: "Sign in — Slate" },
      { property: "og:description", content: "Sign in or create your Slate school account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
  fullName: z.string().trim().max(100).optional(),
});

enum UserRole {
  Lecturer = "Lecturer",
  Student = "Student",
  Parent = "Parent",
  Administrator = "Administrator",
}

function AuthPage() {
  const { reason } = Route.useSearch();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });
  const [role, setRole] = useState<UserRole>(UserRole.Student);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setBusy(true);
    const { email, password, fullName } = parsed.data;
    try {
      if (mode === "in") {
        // Sign‑in with Firebase (placeholder).
        await signInWithEmailAndPassword(firebaseAuth, email, password);
        toast.success(`Signed in as ${role}`);
      } else {
        // Sign‑up with Firebase (placeholder) – you can store the role in Firestore later.
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
        toast.success(`Account created for ${role}`);
      }
    } catch (err: any) {
      toast.error(err?.message ?? "Authentication error");
    } finally {
      setBusy(false);
    }
  }

  // Simple OAuth placeholder – keep the existing Lovable button for Google/Lovable if desired.
  async function oauth(provider: "google" | "lovable") {
    // In a full implementation you would call your OAuth flow here.
    toast.info(`OAuth with ${provider} not wired up in this front‑end only repo.`);
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-board p-12 text-primary-foreground md:flex md:flex-col md:justify-between">
        <Link to="/" className="font-display text-2xl">
          Slate<span className="text-accent">.</span>
        </Link>
        <p className="font-display text-4xl leading-snug">“The register is in. The grades are safe.”</p>
        <p className="text-sm opacity-60">Role‑based access · Audit trail · Auto sign‑out</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl">{mode === "in" ? "Welcome back" : "Create your account"}</h1>
          {reason === "timeout" && (
            <p className="mt-2 text-sm text-warning">You were signed out after 30 minutes of inactivity.</p>
          )}
          <form onSubmit={submit} className="mt-8 space-y-4">
            {/* Role selector – appears in both sign‑in and sign‑up modes */}
            <div className="space-y-1.5">
              <Label>Role</Label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded border border-input bg-background px-3 py-2 text-sm"
                disabled={busy}
              >
                {Object.values(UserRole).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {mode === "up" && (
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <Button className="w-full" disabled={busy}>
              {mode === "in" ? "Sign in" : "Sign up"}
            </Button>
          </form>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            or
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => oauth("google")}>Continue with Google</Button>
            <Button variant="outline" className="w-full" onClick={() => oauth("provider")}>Continue with Provider</Button>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "in" ? "New here?" : "Have an account?"}{" "}
            <button
              className="font-medium text-primary underline-offset-4 hover:underline"
              onClick={() => setMode(mode === "in" ? "up" : "in")}
            >
              {mode === "in" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

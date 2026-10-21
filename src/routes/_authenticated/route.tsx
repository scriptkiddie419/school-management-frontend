import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CalendarCheck, GraduationCap, LayoutDashboard, LogOut, Megaphone, Menu, NotebookPen, ScrollText, Users, Receipt, Mail, CalendarDays, ClipboardList, Moon, Sun } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionInfo, useInactivityLogout, isAdmin, isStaff, ROLE_LABEL, type AppRole } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth", search: { reason: undefined } });
  },
  component: Shell,
});

type NavItem = { to: string; label: string; icon: typeof Users; show: (r: AppRole[]) => boolean };
const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: () => true },
  { to: "/students", label: "Students", icon: GraduationCap, show: isStaff },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck, show: () => true },
  { to: "/grades", label: "Grades", icon: NotebookPen, show: () => true },
  { to: "/announcements", label: "Announcements", icon: Megaphone, show: () => true },
  { to: "/fees", label: "Fees", icon: Receipt, show: (r) => isAdmin(r) || r.includes("student") || r.includes("parent") },
  { to: "/messages", label: "Messages", icon: Mail, show: () => true },
  { to: "/timetable", label: "Timetable", icon: CalendarDays, show: () => true },
  { to: "/assignments", label: "Assignments", icon: ClipboardList, show: () => true },
  { to: "/members", label: "People", icon: Users, show: isAdmin },
  { to: "/audit", label: "Audit log", icon: ScrollText, show: isAdmin },
];

function Shell() {
  useInactivityLogout(30);
  const { data: me, isLoading } = useSessionInfo();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  if (isLoading || !me) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  if (!me.schoolId) return <Onboarding />;

  const nav = NAV.filter((n) => n.show(me.roles));
  return (
    <div className="flex min-h-screen">
      <aside className={`${open ? "flex" : "hidden"} fixed inset-y-0 z-40 w-64 flex-col overflow-y-auto bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:flex md:h-screen`}>
        <div className="px-6 py-6">
          <div className="font-display text-2xl">Slate<span className="text-sidebar-primary">.</span></div>
          <div className="mt-1 truncate text-xs opacity-70">{me.schoolName}</div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => {
            const active = path.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "opacity-80 hover:bg-sidebar-accent/60"}`}>
                <n.icon className={`h-4 w-4 ${active ? "text-sidebar-primary" : ""}`} />{n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <div className="truncate text-sm font-medium">{me.fullName}</div>
          <div className="text-xs opacity-60">{me.roles.map((r) => ROLE_LABEL[r]).join(", ") || "No role yet"}</div>
          <div className="mt-3 flex items-center justify-between"><Button variant="ghost" size="sm" onClick={() => supabase.auth.signOut()} className="text-sidebar-foreground">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button><ThemeToggle /></div>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-foreground/40 md:hidden" onClick={() => setOpen(false)} />}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 border-b px-4 py-3 md:hidden">
          <Button size="icon" variant="ghost" aria-label="Open navigation" onClick={() => setOpen(!open)}><Menu /></Button>
          <span className="font-display text-lg">Slate</span>
        </div>
        <main className="mx-auto max-w-6xl p-4 md:p-10"><Outlet /></main>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  return <Button variant="ghost" size="icon" aria-label={dark ? "Use light theme" : "Use dark theme"} title={dark ? "Use light theme" : "Use dark theme"} onClick={() => { const next = !dark; document.documentElement.classList.toggle("dark", next); setDark(next); }}>{dark ? <Sun /> : <Moon />}</Button>;
}

function Onboarding() {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  async function create(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (n.length < 2 || n.length > 120) { toast.error("School name must be 2–120 characters"); return; }
    setBusy(true);
    const { error } = await supabase.rpc("create_school", { _name: n });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("School created — you're the admin.");
    qc.invalidateQueries({ queryKey: ["session-info"] });
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-board p-6">
      <div className="w-full max-w-md rounded-xl bg-card p-8 shadow-2xl">
        <h1 className="text-3xl">You're not in a school yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If you're a teacher, student or parent, ask your school admin to add your email. Or set up a new school and become its admin.
        </p>
        <form onSubmit={create} className="mt-6 flex gap-2">
          <Input placeholder="School name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button disabled={busy}>Create</Button>
        </form>
        <button onClick={() => supabase.auth.signOut()} className="mt-6 text-xs text-muted-foreground underline">Sign out</button>
      </div>
    </div>
  );
}

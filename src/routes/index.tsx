import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CalendarCheck, GraduationCap, Megaphone, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Slate — School Management System" },
      { name: "description", content: "Run your school in one place: students, attendance, grades and announcements with role-based access." },
      { property: "og:title", content: "Slate — School Management System" },
      { property: "og:description", content: "Students, attendance, grades and announcements with role-based access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: GraduationCap, title: "Students & classes", text: "Profiles, enrollment and class assignment." },
  { icon: CalendarCheck, title: "Daily attendance", text: "One-tap marking with trends for every class." },
  { icon: ShieldCheck, title: "Grades & GPA", text: "Gradebook and report cards, visible only to the right people." },
  { icon: Megaphone, title: "Announcements", text: "Live updates for staff, students and parents." },
];

function Index() {
  return (
    <div className="min-h-screen bg-board text-primary-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl">Slate<span className="text-accent">.</span></span>
        <Button asChild variant="secondary"><Link to="/auth">Sign in</Link></Button>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16">
        <p className="text-sm uppercase tracking-[0.25em] text-accent">School management</p>
        <h1 className="mt-4 max-w-3xl text-5xl leading-tight md:text-7xl">Every class, grade and register — on one slate.</h1>
        <p className="mt-6 max-w-xl text-lg opacity-80">
          Built for admins, teachers, students and parents. Each person sees exactly what they should, and nothing more.
        </p>
        <div className="mt-10 flex gap-3">
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90"><Link to="/auth">Get started</Link></Button>
        </div>
        <div className="mt-24 grid gap-px overflow-hidden rounded-xl border border-sidebar-border bg-sidebar-border md:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="bg-sidebar p-6">
              <f.icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 text-lg">{f.title}</h3>
              <p className="mt-2 text-sm opacity-70">{f.text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

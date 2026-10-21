import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useSessionInfo, isStaff, ROLE_LABEL } from "@/lib/session";
import { PageHeader, StatCard, useStudents } from "@/components/school";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Slate" }, { name: "description", content: "Your school at a glance." }, { property: "og:title", content: "Dashboard — Slate" }, { property: "og:description", content: "Your school at a glance." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: me } = useSessionInfo();
  const { data: students = [] } = useStudents();
  const since = new Date(Date.now() - 13 * 86400000).toISOString().slice(0, 10);
  const { data: att = [] } = useQuery({
    queryKey: ["attendance-14d"],
    queryFn: async () => (await supabase.from("attendance").select("date,status").gte("date", since)).data ?? [],
  });
  const { data: ann = [] } = useQuery({
    queryKey: ["announcements", "latest"],
    queryFn: async () => (await supabase.from("announcements").select("id,title,created_at").order("created_at", { ascending: false }).limit(4)).data ?? [],
  });
  if (!me) return null;

  const byDay = new Map<string, { present: number; total: number }>();
  att.forEach((a) => {
    const d = byDay.get(a.date) ?? { present: 0, total: 0 };
    d.total++; if (a.status === "present" || a.status === "late") d.present++;
    byDay.set(a.date, d);
  });
  const chart = [...byDay.entries()].sort().map(([date, v]) => ({ date: date.slice(5), rate: Math.round((v.present / v.total) * 100) }));
  const overall = att.length ? Math.round((att.filter((a) => a.status !== "absent").length / att.length) * 100) : null;
  const today = new Date().toISOString().slice(0, 10);
  const absentToday = att.filter((a) => a.date === today && a.status === "absent").length;

  return (
    <>
      <PageHeader title={`Hello, ${me.fullName.split(" ")[0] || "there"}`} subtitle={me.roles.map((r) => ROLE_LABEL[r]).join(" · ") || "Waiting for a role from your admin"} />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={isStaff(me.roles) ? "Students" : "Linked students"} value={students.length} />
        <StatCard label="Attendance (14 days)" value={overall === null ? "—" : `${overall}%`} />
        <StatCard label="Absent today" value={absentToday} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 lg:col-span-2">
          <h2 className="text-lg">Attendance rate</h2>
          <div className="mt-4 h-64">
            {chart.length ? (
              <ResponsiveContainer>
                <BarChart data={chart}>
                  <XAxis dataKey="date" fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis domain={[0, 100]} fontSize={12} stroke="var(--muted-foreground)" />
                  <Tooltip />
                  <Bar dataKey="rate" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="pt-20 text-center text-sm text-muted-foreground">No attendance recorded yet.</p>}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between"><h2 className="text-lg">Announcements</h2><Link to="/announcements" className="text-xs text-primary">All</Link></div>
          <ul className="mt-4 space-y-3">
            {ann.length === 0 && <li className="text-sm text-muted-foreground">Nothing yet.</li>}
            {ann.map((a) => (
              <li key={a.id} className="border-l-2 border-accent pl-3">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

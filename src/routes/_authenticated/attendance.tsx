import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useSessionInfo, isStaff } from "@/lib/session";
import { PageHeader, fullName, useClasses, useStudents } from "@/components/school";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Status = Database["public"]["Enums"]["attendance_status"];
const STATUSES: { v: Status; label: string; cls: string }[] = [
  { v: "present", label: "P", cls: "bg-success text-primary-foreground" },
  { v: "late", label: "L", cls: "bg-warning text-accent-foreground" },
  { v: "absent", label: "A", cls: "bg-destructive text-destructive-foreground" },
  { v: "excused", label: "E", cls: "bg-muted-foreground text-primary-foreground" },
];

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({ meta: [{ title: "Attendance — Slate" }, { name: "description", content: "Daily attendance register." }, { property: "og:title", content: "Attendance — Slate" }, { property: "og:description", content: "Daily attendance register." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: AttendancePage,
});

function AttendancePage() {
  const { data: me } = useSessionInfo();
  if (!me) return null;
  return isStaff(me.roles) ? <Register schoolId={me.schoolId!} /> : <MyAttendance />;
}

function Register({ schoolId }: { schoolId: string }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [cls, setCls] = useState("all");
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const qc = useQueryClient();
  const { data: marks = [] } = useQuery({
    queryKey: ["attendance", date],
    queryFn: async () => (await supabase.from("attendance").select("student_id,status").eq("date", date)).data ?? [],
  });
  const map = new Map(marks.map((m) => [m.student_id, m.status]));
  const list = students.filter((s) => cls === "all" || s.class_id === cls);

  async function mark(student_id: string, status: Status) {
    const { error } = await supabase.from("attendance").upsert({ student_id, status, date, school_id: schoolId }, { onConflict: "student_id,date" });
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["attendance", date] });
    qc.invalidateQueries({ queryKey: ["attendance-14d"] });
  }
  async function markAll() {
    const rows = list.filter((s) => !map.has(s.id)).map((s) => ({ student_id: s.id, status: "present" as Status, date, school_id: schoolId }));
    if (!rows.length) return;
    const { error } = await supabase.from("attendance").upsert(rows, { onConflict: "student_id,date" });
    if (error) toast.error(error.message); else qc.invalidateQueries({ queryKey: ["attendance", date] });
  }
  const counts = STATUSES.map((s) => ({ ...s, n: list.filter((x) => map.get(x.id) === s.v).length }));

  return (
    <>
      <PageHeader title="Attendance" subtitle={counts.map((c) => `${c.n} ${c.v}`).join(" · ")} />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
        <Select value={cls} onValueChange={setCls}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All classes</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
        <button onClick={markAll} className="ml-auto text-sm text-primary underline-offset-4 hover:underline">Mark unmarked as present</button>
      </div>
      <div className="divide-y rounded-xl border bg-card">
        {list.length === 0 && <p className="p-10 text-center text-muted-foreground">No students in this class.</p>}
        {list.map((s) => (
          <div key={s.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div><div className="font-medium">{fullName(s)}</div><div className="text-xs text-muted-foreground">{s.classes?.name ?? "Unassigned"}</div></div>
            <div className="flex gap-1">
              {STATUSES.map((st) => (
                <button key={st.v} title={st.v} onClick={() => mark(s.id, st.v)}
                  className={`h-9 w-9 rounded-md text-sm font-semibold transition ${map.get(s.id) === st.v ? st.cls : "bg-muted text-muted-foreground hover:bg-secondary"}`}>
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function MyAttendance() {
  const { data: students = [] } = useStudents();
  const { data: rows = [] } = useQuery({
    queryKey: ["attendance", "mine"],
    queryFn: async () => (await supabase.from("attendance").select("id,date,status,student_id").order("date", { ascending: false }).limit(200)).data ?? [],
  });
  const name = (id: string) => { const s = students.find((x) => x.id === id); return s ? fullName(s) : ""; };
  return (
    <>
      <PageHeader title="Attendance" subtitle="Recent attendance records" />
      <div className="divide-y rounded-xl border bg-card">
        {rows.length === 0 && <p className="p-10 text-center text-muted-foreground">No records yet.</p>}
        {rows.map((r) => (
          <div key={r.id} className="flex justify-between px-4 py-3 text-sm">
            <span>{r.date} {students.length > 1 && <span className="text-muted-foreground">· {name(r.student_id)}</span>}</span>
            <span className={`capitalize ${r.status === "absent" ? "text-destructive" : ""}`}>{r.status}</span>
          </div>
        ))}
      </div>
    </>
  );
}

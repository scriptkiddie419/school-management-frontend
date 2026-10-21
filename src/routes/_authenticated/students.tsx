import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSessionInfo, isAdmin, isStaff } from "@/lib/session";
import { PageHeader, RoleGate, fullName, useClasses, useStudents } from "@/components/school";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authenticated/students")({
  head: () => ({ meta: [{ title: "Students — Slate" }, { name: "description", content: "Student roster and classes." }, { property: "og:title", content: "Students — Slate" }, { property: "og:description", content: "Student roster and classes." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => <RoleGate allow={isStaff}><Students /></RoleGate>,
});

const studentSchema = z.object({
  first_name: z.string().trim().min(1).max(60),
  last_name: z.string().trim().min(1).max(60),
  student_number: z.string().trim().max(30).optional().transform((v) => v || null),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")).transform((v) => v || null),
});

function Students() {
  const { data: me } = useSessionInfo();
  const { data: students = [] } = useStudents();
  const { data: classes = [] } = useClasses();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const qc = useQueryClient();
  const admin = me ? isAdmin(me.roles) : false;
  const refresh = () => { qc.invalidateQueries({ queryKey: ["students"] }); qc.invalidateQueries({ queryKey: ["classes"] }); };

  const rows = students.filter((s) => (filter === "all" || s.class_id === filter) && fullName(s).toLowerCase().includes(q.toLowerCase()));

  async function setClass(id: string, class_id: string) {
    const { error } = await supabase.from("students").update({ class_id: class_id === "none" ? null : class_id }).eq("id", id);
    if (error) toast.error(error.message); else refresh();
  }
  async function remove(id: string) {
    if (!confirm("Remove this student and all their records?")) return;
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) toast.error(error.message); else refresh();
  }

  return (
    <>
      <PageHeader title="Students" subtitle={`${students.length} enrolled · ${classes.length} classes`}
        action={admin && me?.schoolId && <div className="flex flex-wrap gap-2"><NewClass schoolId={me.schoolId} onDone={refresh} /><CsvImport schoolId={me.schoolId} onDone={refresh} /><NewStudent schoolId={me.schoolId} classes={classes} onDone={refresh} /></div>} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input placeholder="Search name…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All classes</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>No.</TableHead><TableHead>Date of birth</TableHead><TableHead>Class</TableHead>{admin && <TableHead />}</TableRow></TableHeader>
          <TableBody>
            {rows.length === 0 && <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No students.</TableCell></TableRow>}
            {rows.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{fullName(s)}</TableCell>
                <TableCell>{s.student_number ?? "—"}</TableCell>
                <TableCell>{s.date_of_birth ?? "—"}</TableCell>
                <TableCell>
                  {admin ? (
                    <Select value={s.class_id ?? "none"} onValueChange={(v) => setClass(s.id, v)}>
                      <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="none">Unassigned</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  ) : s.classes?.name ?? "—"}
                </TableCell>
                {admin && <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function NewStudent({ schoolId, classes, onDone }: { schoolId: string; classes: { id: string; name: string }[]; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ first_name: "", last_name: "", student_number: "", date_of_birth: "", class_id: "none" });
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const p = studentSchema.safeParse(f);
    if (!p.success) { toast.error("Please check the name and date fields"); return; }
    const { error } = await supabase.from("students").insert({ ...p.data, school_id: schoolId, class_id: f.class_id === "none" ? null : f.class_id });
    if (error) { toast.error(error.message); return; }
    toast.success("Student added"); setOpen(false); setF({ first_name: "", last_name: "", student_number: "", date_of_birth: "", class_id: "none" }); onDone();
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="h-4 w-4" /> Student</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Enroll student</DialogTitle></DialogHeader>
        <form onSubmit={save} className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label>First name</Label><Input value={f.first_name} onChange={(e) => setF({ ...f, first_name: e.target.value })} /></div>
            <div><Label>Last name</Label><Input value={f.last_name} onChange={(e) => setF({ ...f, last_name: e.target.value })} /></div>
            <div><Label>Student no.</Label><Input value={f.student_number} onChange={(e) => setF({ ...f, student_number: e.target.value })} /></div>
            <div><Label>Date of birth</Label><Input type="date" value={f.date_of_birth} onChange={(e) => setF({ ...f, date_of_birth: e.target.value })} /></div>
          </div>
          <div><Label>Class</Label>
            <Select value={f.class_id} onValueChange={(v) => setF({ ...f, class_id: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="none">Unassigned</SelectItem>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select></div>
          <Button>Save</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NewClass({ schoolId, onDone }: { schoolId: string; onDone: () => void }) {
  async function add() {
    const name = prompt("Class name (e.g. Grade 5A)")?.trim();
    if (!name) return;
    if (name.length > 60) { toast.error("Name too long"); return; }
    const { error } = await supabase.from("classes").insert({ name, school_id: schoolId });
    if (error) toast.error(error.message); else { toast.success("Class created"); onDone(); }
  }
  return <Button variant="outline" onClick={add}><Plus className="h-4 w-4" /> Class</Button>;
}

/** CSV columns: first_name,last_name,student_number,date_of_birth */
function CsvImport({ schoolId, onDone }: { schoolId: string; onDone: () => void }) {
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 1_000_000) { toast.error("File too large (max 1MB)"); return; }
    const lines = (await file.text()).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const header = lines.shift()?.toLowerCase().split(",").map((h) => h.trim()) ?? [];
    const rows = [], bad: number[] = [];
    for (const [i, line] of lines.entries()) {
      const cells = line.split(",");
      const obj = Object.fromEntries(header.map((h, j) => [h, (cells[j] ?? "").trim()]));
      const p = studentSchema.safeParse(obj);
      if (p.success) rows.push({ ...p.data, school_id: schoolId }); else bad.push(i + 2);
    }
    if (!rows.length) { toast.error("No valid rows. Expected columns: first_name,last_name,student_number,date_of_birth"); return; }
    const { error } = await supabase.from("students").insert(rows);
    if (error) { toast.error(error.message); return; }
    toast.success(`Imported ${rows.length} students${bad.length ? `, skipped lines ${bad.slice(0, 5).join(", ")}` : ""}`);
    onDone();
  }
  return (
    <Button variant="outline" asChild>
      <label className="cursor-pointer"><Upload className="h-4 w-4" /> CSV<input type="file" accept=".csv,text/csv" hidden onChange={onFile} /></label>
    </Button>
  );
}

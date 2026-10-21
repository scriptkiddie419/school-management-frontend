import { useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Database } from '@/integrations/supabase/types';

type Tables = Database['public']['Tables'];
export function useSchoolRows<T extends keyof Tables>(table: T, schoolId?: string | null) {
  return useQuery({ queryKey: [table, schoolId], enabled: Boolean(schoolId), queryFn: async () => {
    if (!schoolId) return [];
    const { data, error } = await supabase.from(table).select('*').filter('school_id', 'eq', schoolId);
    if (error) throw error;
    return data as unknown as Tables[T]['Row'][];
  } });
}
export function useDirectory() { return useQuery({ queryKey: ['school-directory'], queryFn: async () => { const { data, error } = await supabase.rpc('school_directory'); if (error) throw error; return data ?? []; } }); }
export function useRefresh() { const qc = useQueryClient(); return () => { void qc.invalidateQueries(); }; }
export function QueryState({ loading, error, empty, children }: { loading?: boolean; error?: Error | null; empty?: boolean; children: ReactNode }) {
  if (loading) return <p className="py-12 text-center text-muted-foreground">Loading records…</p>;
  if (error) return <Alert variant="destructive"><AlertDescription>{error.message}</AlertDescription></Alert>;
  if (empty) return <div className="border-y py-16 text-center text-muted-foreground">No records yet.</div>;
  return <>{children}</>;
}
export function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="grid gap-1.5 text-sm"><span className="font-medium">{label}</span>{children}</label>; }
export function Picker({ label, value, onChange, options, all }: { label: string; value: string; onChange: (v: string) => void; options: { id: string; name: string }[]; all?: string }) {
  return <Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className="min-w-0"><SelectValue placeholder={label} /></SelectTrigger><SelectContent>{all && <SelectItem value="all">{all}</SelectItem>}{options.map(o => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent></Select>;
}
export type FormField = { key: string; label: string; type?: string; options?: { id: string; name: string }[]; default?: string; optional?: boolean; maxLength?: number };
export function RecordForm({ title, fields, onSave, initial, icon }: { title: string; fields: FormField[]; onSave: (v: Record<string, string>) => Promise<void>; initial?: Record<string, string>; icon?: boolean }) {
  const defaults = () => Object.fromEntries(fields.map(f => [f.key, initial?.[f.key] ?? f.default ?? '']));
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false), [values, setValues] = useState(defaults);
  async function save(e: React.FormEvent) { e.preventDefault(); setBusy(true); try { await onSave(values); setOpen(false); setValues(defaults()); } catch (e) { toast.error(e instanceof Error ? e.message : 'Unable to save'); } finally { setBusy(false); } }
  return <Dialog open={open} onOpenChange={v => { setOpen(v); if (v) setValues(defaults()); }}><DialogTrigger asChild><Button variant={icon ? 'ghost' : 'default'} size={icon ? 'icon' : 'default'} aria-label={title} title={title}>{icon ? <Pencil className="size-4" /> : <><Plus className="size-4" />{title}</>}</Button></DialogTrigger><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription className="sr-only">{title}</DialogDescription></DialogHeader><form onSubmit={save} className="grid gap-4">{fields.map(f => <Field key={f.key} label={f.label}>{f.options ? <Picker label={f.label} value={values[f.key] ?? ''} onChange={v => setValues({ ...values, [f.key]: v })} options={f.options} /> : f.type === 'textarea' ? <Textarea aria-label={f.label} required={!f.optional} maxLength={f.maxLength ?? 4000} rows={5} value={values[f.key]} onChange={e => setValues({ ...values, [f.key]: e.target.value })} /> : <Input aria-label={f.label} required={!f.optional} type={f.type ?? 'text'} step={f.type === 'number' ? '0.01' : undefined} maxLength={f.maxLength ?? 140} value={values[f.key]} onChange={e => setValues({ ...values, [f.key]: e.target.value })} />}</Field>)}<Button disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button></form></DialogContent></Dialog>;
}
export function DataTable({ headers, rows }: { headers: string[]; rows: { id: string; cells: ReactNode[] }[] }) { return <div className="overflow-x-auto border-y"><Table><TableHeader><TableRow>{headers.map((h,i) => <TableHead key={i} className="whitespace-nowrap">{h}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map(row => <TableRow key={row.id}>{row.cells.map((c,i) => <TableCell key={i} className="align-top">{c}</TableCell>)}</TableRow>)}</TableBody></Table></div>; }
export function DeleteRecord({ onDelete, label }: { onDelete: () => Promise<void>; label: string }) {
  const [open, setOpen] = useState(false), [busy, setBusy] = useState(false);
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="ghost" size="icon" title={`Delete ${label}`} aria-label={`Delete ${label}`}><Trash2 className="size-4" /></Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Delete {label}?</DialogTitle><DialogDescription>This record will be permanently removed.</DialogDescription></DialogHeader><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button variant="destructive" disabled={busy} onClick={async () => { setBusy(true); try { await onDelete(); setOpen(false); } catch(e) { toast.error(e instanceof Error ? e.message : 'Unable to delete'); } finally { setBusy(false); } }}>Delete</Button></div></DialogContent></Dialog>;
}
export function checkError(error: { message: string } | null) { if(error) throw new Error(error.message); }

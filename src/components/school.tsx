import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/session";
import { useSessionInfo } from "@/lib/session";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

/** Renders children only when the user holds an allowed role. Nothing is
 * rendered (not even briefly) while roles load. RLS enforces this server-side too. */
export function RoleGate({ allow, children }: { allow: (r: AppRole[]) => boolean; children: ReactNode }) {
  const { data: me } = useSessionInfo();
  if (!me) return null;
  if (!allow(me.roles)) return <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">You don't have access to this page.</div>;
  return <>{children}</>;
}

export type StudentRow = { id: string; first_name: string; last_name: string; student_number: string | null; class_id: string | null; date_of_birth: string | null; classes: { name: string } | null };

export function useStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students")
        .select("id,first_name,last_name,student_number,class_id,date_of_birth,classes(name)")
        .order("last_name");
      if (error) throw error;
      return data as StudentRow[];
    },
  });
}

export function useClasses() {
  return useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("id,name,teacher_id").order("name");
      if (error) throw error;
      return data;
    },
  });
}

export const fullName = (s: { first_name: string; last_name: string }) => `${s.first_name} ${s.last_name}`;

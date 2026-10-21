import { useState } from 'react';
import { Download } from 'lucide-react';
import { useSessionInfo } from '@/lib/session';
import { exportCsv } from '@/lib/school-tools';
import { PageHeader } from '@/components/school';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, QueryState,useSchoolRows } from './common';
export function AuditPage(){const {data:me}=useSessionInfo();const query=useSchoolRows('audit_log',me?.schoolId);const [q,setQ]=useState('');const rows=(query.data??[]).filter(r=>`${r.action} ${r.entity}`.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>b.created_at.localeCompare(a.created_at));return <><PageHeader title="Audit log" subtitle="School activity history" action={<Button variant="outline" disabled={!rows.length} onClick={()=>exportCsv('audit-log.csv',['Time','Action','Record','Actor','Record ID'],rows.map(r=>[r.created_at,r.action,r.entity,r.actor_id,r.entity_id]))}><Download className="size-4"/>Export</Button>}/><Input aria-label="Search audit log" placeholder="Filter action or record…" className="mb-5 max-w-sm" value={q} onChange={e=>setQ(e.target.value)}/><QueryState loading={query.isLoading} error={query.error} empty={!rows.length}><DataTable headers={['Time','Action','Record','Details']} rows={rows.slice(0,500).map(r=>({id:String(r.id),cells:[new Date(r.created_at).toLocaleString(),<span className="rounded bg-secondary px-2 py-1 text-xs">{r.action}</span>,r.entity.replaceAll('_',' '),<details><summary className="cursor-pointer text-primary">View change</summary><pre className="mt-2 max-w-sm overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(r.details,null,2)}</pre></details>]}))}/></QueryState></>;}

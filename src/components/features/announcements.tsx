import { toast } from 'sonner';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionInfo,isStaff } from '@/lib/session';
import { PageHeader } from '@/components/school';
import { Input } from '@/components/ui/input';
import { RecordForm, QueryState, DeleteRecord, useSchoolRows, useRefresh, checkError, type FormField } from './common';
export function AnnouncementsPage() {
 const {data:me}=useSessionInfo(); const query=useSchoolRows('announcements',me?.schoolId); const refresh=useRefresh(); const [search,setSearch]=useState(''); const staff=me ? isStaff(me.roles) : false;
 const fields:FormField[]=[{key:'title',label:'Title',maxLength:140},{key:'body',label:'Announcement',type:'textarea',maxLength:4000}];
 const rows=(query.data??[]).filter(a=>`${a.title} ${a.body}`.toLowerCase().includes(search.toLowerCase())).sort((a,b)=>b.created_at.localeCompare(a.created_at));
 async function save(v:Record<string,string>,id?:string) {if(!me?.schoolId)return;const data={title:(v['title']??'').trim(),body:(v['body']??'').trim()};const result=id?await supabase.from('announcements').update(data).eq('id',id):await supabase.from('announcements').insert({...data,school_id:me.schoolId});checkError(result.error);toast.success('Announcement published');refresh();}
 return <><PageHeader title="Announcements" subtitle="School noticeboard" action={staff&&<RecordForm title="Publish announcement" fields={fields} onSave={v=>save(v)}/>}/><Input aria-label="Search announcements" className="mb-6 max-w-sm" placeholder="Search announcements…" value={search} onChange={e=>setSearch(e.target.value)}/><QueryState loading={query.isLoading} error={query.error} empty={!rows.length}><div className="space-y-5">{rows.map(a=><article key={a.id} className="rounded-lg border bg-card p-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><time className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</time><h2 className="mt-2 break-words text-xl">{a.title}</h2></div>{staff&&<div className="flex shrink-0"><RecordForm title="Edit announcement" icon fields={fields} initial={{title:a.title,body:a.body}} onSave={v=>save(v,a.id)}/><DeleteRecord label="announcement" onDelete={async()=>{checkError((await supabase.from('announcements').delete().eq('id',a.id)).error);refresh();}}/></div>}</div><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7">{a.body}</p></article>)}</div></QueryState></>;
}

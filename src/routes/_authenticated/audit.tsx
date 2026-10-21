import { createFileRoute } from '@tanstack/react-router';
import { AuditPage } from '@/components/features/audit';
import { schoolHead } from '@/lib/school-tools';
import { RoleGate } from '@/components/school';
import { isAdmin } from '@/lib/session';
export const Route = createFileRoute('/_authenticated/audit')({
 head: () => schoolHead('Audit log', 'School record and payment activity history.'),
 component: () => <RoleGate allow={isAdmin}><AuditPage/></RoleGate>,
});

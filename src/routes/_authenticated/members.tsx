import { createFileRoute } from '@tanstack/react-router';
import { PeoplePage } from '@/components/features/people';
import { schoolHead } from '@/lib/school-tools';
import { RoleGate } from '@/components/school';
import { isAdmin } from '@/lib/session';
export const Route = createFileRoute('/_authenticated/members')({
 head: () => schoolHead('People', 'School membership, roles and linked students.'),
 component: () => <RoleGate allow={isAdmin}><PeoplePage/></RoleGate>,
});

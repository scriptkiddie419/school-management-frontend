import { createFileRoute } from '@tanstack/react-router';
import { AssignmentsPage } from '@/components/features/assignments';
import { schoolHead } from '@/lib/school-tools';
export const Route = createFileRoute('/_authenticated/assignments')({
 head: () => schoolHead('Assignments', 'Class assignments, student submissions and feedback.'),
 component: AssignmentsPage,
});

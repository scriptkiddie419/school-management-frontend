import { createFileRoute } from '@tanstack/react-router';
import { GradesPage } from '@/components/features/grades';
import { schoolHead } from '@/lib/school-tools';
export const Route = createFileRoute('/_authenticated/grades')({
 head: () => schoolHead('Grades', 'Assessments and printable student report cards.'),
 component: GradesPage,
});

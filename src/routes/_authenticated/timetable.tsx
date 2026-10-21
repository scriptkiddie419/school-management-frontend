import { createFileRoute } from '@tanstack/react-router';
import { TimetablePage } from '@/components/features/timetable';
import { schoolHead } from '@/lib/school-tools';
export const Route = createFileRoute('/_authenticated/timetable')({
 head: () => schoolHead('Timetable', 'Weekly lessons, classes and teaching schedules.'),
 component: TimetablePage,
});

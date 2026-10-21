import { createFileRoute } from '@tanstack/react-router';
import { AnnouncementsPage } from '@/components/features/announcements';
import { schoolHead } from '@/lib/school-tools';
export const Route = createFileRoute('/_authenticated/announcements')({
 head: () => schoolHead('Announcements', 'School notices and updates.'),
 component: AnnouncementsPage,
});

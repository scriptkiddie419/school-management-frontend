import { createFileRoute } from '@tanstack/react-router';
import { MessagesPage } from '@/components/features/messages';
import { schoolHead } from '@/lib/school-tools';
export const Route = createFileRoute('/_authenticated/messages')({
 head: () => schoolHead('Messages', 'Private school messages and conversations.'),
 component: MessagesPage,
});

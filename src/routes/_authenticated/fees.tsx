import { createFileRoute } from '@tanstack/react-router';
import { FeesPage } from '@/components/features/fees';
import { schoolHead } from '@/lib/school-tools';
export const Route = createFileRoute('/_authenticated/fees')({
 head: () => schoolHead('Fees', 'School fee invoices, balances and payment receipts.'),
 component: FeesPage,
});

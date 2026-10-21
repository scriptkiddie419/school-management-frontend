import { describe, expect, it } from 'vitest';
import { gradeInput, feeBalance, invoiceStatus, paymentInput } from '@/lib/school-tools';
import { isAdmin, isStaff } from '@/lib/session';
const grade = { student_id: '11111111-1111-4111-8111-111111111111', subject: 'Math', assessment: 'Test', term: 'Term 1', score: 80, max_score: 100 };
describe('School record validation', () => {
  it('rejects scores above the assessment maximum', () => { expect(gradeInput.safeParse({ ...grade, score: 101 }).success).toBe(false); expect(gradeInput.safeParse(grade).success).toBe(true); });
  it('rejects zero and negative payments', () => { expect(paymentInput.safeParse(0).success).toBe(false); expect(paymentInput.safeParse(-10).success).toBe(false); expect(paymentInput.safeParse(10.25).success).toBe(true); });
  it('accepts decimal currency amounts without floating-point rejection', () => { expect(paymentInput.safeParse(19.99).success).toBe(true); expect(paymentInput.safeParse(19.999).success).toBe(false); });
  it('calculates outstanding balance from recorded payments', () => { expect(feeBalance(100, [{ amount: 25 }, { amount: 30 }])).toBe(45); });
  it('marks only unpaid past-due invoices overdue', () => { expect(invoiceStatus(45, '2026-10-16', '2026-10-17')).toBe('Overdue'); expect(invoiceStatus(0, '2026-10-16', '2026-10-17')).toBe('Paid'); expect(invoiceStatus(45, '2026-10-17', '2026-10-17')).toBe('Outstanding'); });
  it('keeps school administration unavailable to teachers and families', () => { expect(isAdmin(['teacher'])).toBe(false); expect(isAdmin(['parent'])).toBe(false); expect(isAdmin(['school_admin'])).toBe(true); });
  it('limits staff record editing to staff', () => { expect(isStaff(['student'])).toBe(false); expect(isStaff(['parent'])).toBe(false); expect(isStaff(['teacher'])).toBe(true); });
});

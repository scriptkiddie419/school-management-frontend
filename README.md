# School Management System

Slate is a school management system built with React, TypeScript, and Tailwind CSS. It provides tools for grades, attendance, announcements, fees, messaging, timetables, and assignments.

## School setup

1. Sign in, enter your school name and create the school. Its creator becomes a school administrator.
2. Create classes and enroll students under Students. CSV import accepts `first_name,last_name,student_number,date_of_birth`.
3. Other staff and families create their own accounts first. Under People, add their account email and select a school role.
4. Link student and parent accounts to enrolled students under People so their grades, attendance, fees, class schedules and assignments are visible.

## School tools

- Grades: record assessments, export CSV and print or save student report cards as PDFs using the browser print dialog.
- Announcements: staff publish notices for the school.
- Fees: administrators create invoices and record manual payments, with balances and downloadable receipt records. Online payment collection is not connected.
- Messages: private inbox and sent messages between school members. Absent attendance records create an in-app message for a linked parent; email and SMS alerts are not connected.
- Timetable: class and teacher schedules with conflicting time checks.
- Assignments: class instructions, text-based student submissions and staff feedback. File attachments are not available.
- Audit log: administrator-only record activity and exports.
- Theme: light and dark appearance from the navigation control.

## Verification

Administrator workflows verified: enrollment, grade readback, report cards, notices, invoices, partial payments, lessons and assignments. Student workflows verified: homework submission, linked grades and invoices, and denied administrator access. A second authorized school account is needed to verify messaging and parent alert delivery end-to-end. Temporary verification data was removed.

## Tests

Run `bunx vitest run` for authentication, routing and school-rule regression tests.



Open the project in your IDE and continue development.

- **Rapid development**: quickly prototype features with modern tools.
- **Version control**: integrate with GitHub for seamless commits.
- **Full ownership**: the codebase is yours to maintain and scale.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

# Slate School Management

Slate uses Lovable Cloud for school records and sign-in. Each school has isolated records, protected roles, and a read-only audit history.

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

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

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

# Quiz Platform — Phases 1 to 5

Node.js + Express + Prisma (MySQL) API and React (Vite) web app.
Roles: **Admin**, **Teacher**, **Student**. Single institution. No self-registration (admin creates accounts).
Login by **email, phone or user ID** + password. Optional **OTP** login via `OTP_ENABLED`.

## Run with Docker (recommended)
```bash
cp .env.example .env     # edit passwords, JWT_SECRET, seed admin
docker compose up -d --build
```
Open http://localhost:8080 and log in with the seed admin from `.env`
(default `admin@example.com` / `ChangeMe@123`; you must change it on first login).

### Install as an app (PWA)
Open the site in a supported browser and choose **Install app** when the install button appears, or use the browser's install option. On phones, use the browser's **Add to Home Screen** option if no install button appears. Installation requires HTTPS, except for `localhost`.

The app shell and static assets are available offline after the first visit. Sign-in, quizzes, and other data require a network connection; private API responses are never cached by the service worker.

Toggle OTP: set `OTP_ENABLED=true|false` in `.env`, then `docker compose up -d api`. No frontend rebuild.
With `OTP_PROVIDER=console`, codes are printed in `docker compose logs api`.

## Run directly (no Docker)
Requires Node 20+ and MySQL 8.
```bash
cd backend
cp ../.env.example .env   # set DATABASE_URL=mysql://user:pass@localhost:3306/quizdb
npm install
npx prisma db push
npm run seed
npm run dev               # API on :4000

cd ../frontend
npm install
npm run dev               # web on :5173 (proxies /api to :4000)
```
Note: when running directly, add `DATABASE_URL=...` to `backend/.env` (Docker builds it automatically).

## Phase 1 includes
- Roles and permissions: admin manages users; teacher sees students; student sees own profile
- Unique email, phone and user ID per user; phone mandatory
- Forced password change on first login; admin password reset (temp password shown once)
- Password login + env-switchable OTP login (console provider; SMS/email providers plug in at `backend/src/services/otp.js`)
- Rate-limited login, hashed passwords and OTPs, generic errors (no account enumeration), audit log for user changes

## Phase 2 includes
- **Question bank** (Admin and Teacher; teachers see only their own, admins see all): create, edit, delete, copy, search and filter by type, category and difficulty
- **4 question types:** multiple choice, multiple select (optional partial marks), true/false, text input (several accepted answers, case sensitivity, exact or contains)
- **Images** on questions and on each option: upload (JPG/PNG/GIF/WebP, max 5 MB, checked by file header) or paste a URL; alt text for question images
- **CSV import:** template download (per type and mixed), preview of the first 5 rows, line-by-line errors, optional images ZIP, `create` or `upsert` by `question_id`, all-or-nothing commit (rollback on any error), import history
- **CSV export** of your question bank (re-importable with `upsert` for bulk edits)
- Tests for validation and CSV logic: `cd backend && npm install && npm test`

Not yet in Phase 2: rich text/LaTeX, automatic image resizing and thumbnails, malware scanning, cloud storage (images are stored in `UPLOAD_DIR`).
In CSV: text-input accepted answers are separated by `|` (or commas if there is no `|`); correct options are written `option_1,option_3`.

## Phase 3 includes
- **Classes / batches:** teachers and admins group students; teachers see only their own classes
- **Quiz builder:** settings (pass %, time limit, attempts, open/close window, question order, one-at-a-time, progress bar, allow going back), pick and order questions from your bank, assign to classes and/or individual students, publish / unpublish, clone, delete (blocked once attempts exist)
- **Taking a quiz (students):** start, resume after refresh or re-login, question palette, flag for review, autosave, countdown timer
- **Integrity:** the deadline is kept on the server; attempts are auto-submitted when time runs out (also if the browser is closed; a sweep runs every 30 s). During an attempt the API never sends correct answers or explanations. Each attempt keeps its own frozen copy of the questions, so later edits to the question bank never change a grade
- **Auto-grading:** multiple choice, multiple select (all-or-nothing or partial marks), true/false, text input
- **Result release (default: manual):** per quiz = manual / immediately / scheduled / never. Staff can release or hide all attempts or single attempts. Students see "Submitted, awaiting release" until released, then score, pass/fail and a review (correct answers and explanations follow the quiz settings)
- Safety rules: a question used in a quiz cannot be deleted; a quiz's questions are locked once someone has attempted it
- Tests: `cd backend && npm install && npm test` (16 tests: grading, no answer leaks, release rules, deadline, CSV)

Not in the app: per-question time limits during a quiz, immediate right/wrong feedback while answering, staff preview of the student view.

## Phase 4 includes
- **Reports (Admin and Teacher):** overview; **by quiz** (average, median, highest, lowest, pass rate, completion, average time, score distribution, category and difficulty performance, student table, per-question analysis with hardest questions first, option counts and most common wrong answers); **by student** (trend, strengths and weaknesses, category and difficulty, attempts); **by class** (students x quizzes grid with best attempt, quiz statistics); **by teacher** (admin only)
- **Which attempt counts:** best, latest, first or all attempts per student (quiz report)
- **Export:** CSV, Excel (.xlsx, one sheet per section) and PDF for the quiz, student and class reports
- **Student "My results":** score trend, category and difficulty strengths and weaknesses, attempt list. Only attempts the teacher/admin has released are used; hidden attempts never appear
- Teachers only see data for their own quizzes; admins see everything. Reports include all submitted attempts, whether or not results were released to students
- Spreadsheet safety: text starting with = + - @ is neutralised in CSV/Excel exports
- Limit: the PDF uses a built-in Latin font, so Hindi and other scripts show as "?" in PDF. Use Excel or CSV for those
- Tests: 37 in total (`cd backend && npm install && npm test`)

## Phase 5 includes
- **Essay questions with manual grading:** students type a long answer; a teacher or admin marks it in the **Grading** tab (score up to the question's points, optional feedback, can be changed later). The attempt total, pass/fail and reports wait until every essay is marked, and students see "awaiting grading" until then. Blank essays score 0 automatically
- **Real OTP delivery:** email through SMTP; SMS through Twilio, MSG91 or any HTTP gateway (settings in `.env.example`). Console mode still prints codes for development. India SMS needs DLT registration
- **Account lockout:** 5 wrong passwords lock an account for 15 minutes (both settable); admins can unlock it from the Users tab
- **Audit log (admin):** searchable log of logins and failed logins, lockouts, password changes, user changes, quiz publish/unpublish/delete, result release, CSV imports and essay marking
- **Production safety:** the API refuses to start in production with a weak `JWT_SECRET`; strict CORS by default; general API rate limit; health check with a database ping; graceful shutdown; old OTP codes are cleaned up
- **Database migrations:** see below
- **Automatic backups:** a `backup` container writes a database dump and an uploads archive to `./backups` every 24 hours and deletes ones older than 14 days (`BACKUP_INTERVAL_HOURS`, `BACKUP_KEEP_DAYS`)

### Migrations (do this once after your first start)
The first start creates the tables with `prisma db push`. Before going live, switch to migrations:
```bash
docker compose exec api npm run migrate:baseline     # writes backend/prisma/migrations/00000000000000_init
git add backend/prisma/migrations && git commit -m "Baseline migration"
```
From then on the API applies migrations automatically when it starts (`prisma migrate deploy`). After you change `backend/prisma/schema.prisma`:
```bash
docker compose exec api npm run migrate:new -- add_something   # writes the SQL for the change
# review the SQL, commit it, then restart:
docker compose up -d --build api
```

### Backups and restore
Backups appear in `./backups` (`db_YYYY-MM-DD_HHMMSS.sql.gz` and `uploads_...tar.gz`). Copy that folder off the server regularly.
Restore (replaces the current data):
```bash
./scripts/restore.sh backups/db_2026-01-01_020000.sql.gz backups/uploads_2026-01-01_020000.tar.gz
```
Test a restore on a spare machine before you need it.

### Going live checklist
1. Set strong values in `.env`: `JWT_SECRET` (24+ random characters), the database passwords, and the seed admin password
2. Put HTTPS in front of the app (a reverse proxy such as Caddy or nginx with a certificate)
3. Turn on a real OTP provider (or leave `OTP_ENABLED=false`)
4. Run the migration baseline, and copy `./backups` somewhere safe
5. Log in as the admin, change the password, create teachers and students

## Notes
- Schema is applied with `prisma db push` for now. Switch to `prisma migrate` before production.
- Ideas for later: multi-institution support, mobile app, plagiarism checks, question tags, LMS integration.

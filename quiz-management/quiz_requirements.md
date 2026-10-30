uiz Platform – Requirements v2
Extends Quiz/Test Application Requirements v1.0. Adds role-based access, login rules, report release control, stack, Docker deployment, and gaps found in v1.0.
1. Tech Stack (use latest stable at install time)
Layer
Choice
Backend
Node.js (current LTS) + Express (or Fastify), TypeScript
Frontend
React (latest) + Vite + TypeScript, React Router, TanStack Query
UI
Tailwind CSS + shadcn/ui (or MUI)
Database
MySQL (latest stable LTS, InnoDB, utf8mb4)
ORM / migrations
Prisma (or Knex)
Cache / sessions / queue
Redis (optional at start; needed for timers, rate limits, background jobs)
Validation
Zod (shared between API and UI)
File storage
Local volume first; S3-compatible (MinIO/AWS S3) later
Jobs
BullMQ (CSV import, report export, emails)
Charts
Recharts or ApexCharts
Testing
Vitest/Jest, Supertest, Playwright (E2E)
Docs
OpenAPI/Swagger for the API
Run npm outdated / check release pages before starting, and pin exact versions in package.json and lockfiles.
2. Roles and Permissions (RBAC)
2.1 Roles
• Admin – full control of the system, users, settings, all data.
• Teacher – manages own questions, quizzes, classes and students assigned to them; sees reports for own classes only.
• Student – takes assigned quizzes and sees only own results, and only when released.
2.2 Permission Matrix
Capability
Admin
Teacher
Student
Create / edit / deactivate users
✅
❌ (can add students to own class, if enabled)
❌
Assign roles
✅
❌
❌
Create / manage classes (batches)
✅
✅ own
❌
Create / edit questions, question bank
✅ all
✅ own
❌
CSV question import / template download
✅
✅
❌
Create / publish quizzes
✅
✅ own
❌
Assign quiz to class / students
✅
✅ own classes
❌
Take quiz
❌
❌ (preview only)
✅
View all reports
✅
✅ own classes/quizzes
❌
View own result
–
–
✅ if released
Release / hide results
✅
✅ own quizzes
❌
Regrade / manual score override
✅
✅ own
❌
Export reports (CSV/Excel/PDF)
✅
✅ own
❌ (own result PDF if allowed)
System settings, audit logs
✅
❌
❌
2.3 Implementation Notes
• Store roles in a roles table and permissions in permissions + role_permissions so admin can adjust later (fine-grained: quiz.create, report.view.own_class, result.release, etc.).
• Enforce on the server with middleware (requireAuth, requireRole, requirePermission), plus ownership checks (a teacher must own the quiz/class). UI hiding is only cosmetic.
• Optional later: custom roles (e.g. Reviewer, Invigilator, Parent).
2.4 Single Institution Now, Multi-Tenancy Later
Decided: build for a single institution now. Multi-tenancy (multiple institutions) is a later phase, so this version has no Super Admin role and no organization_id columns.
To keep that later change cheap:
• Put all database access in one data-access layer (repositories or services), not in route handlers, so a tenant filter can be added in one place later.
• Use UUID/ULID public ids for all records.
• Keep institution-level settings (name, logo, timezone, default release mode) in one settings table, which can later grow into an organizations table.
• Keep the upload base path configurable.
Plan for later: one database, organization_id on every table, a Super Admin role, email and phone unique across the platform, user code unique per institution, and one institution per user.
3. Users and Login
3.1 Unique Identity
Every user must have:
• Unique email (required, case-insensitive unique index)
• Unique phone number (required for every user; E.164 format, unique index)
• Unique user code (e.g. STU-2026-0001, TCH-0012, auto-generated or admin-entered; also used as roll number / employee ID)
3.2 Login
• User logs in with email OR phone OR user code + password.
• Passwords hashed with argon2id (or bcrypt cost ≥ 12). Never store plain text.
• JWT access token (short, ~15 min) + refresh token (rotating, httpOnly, Secure, SameSite cookie). Refresh tokens stored hashed in DB so they can be revoked.
• Logout everywhere, active-session list, force logout by admin.
• Forgot / reset password via email link (and optional SMS/WhatsApp OTP).
• First-login forced password change for admin-created accounts.
• Account lockout / throttling after repeated failures; rate limit login endpoint.
• Optional: 2FA (TOTP) for admin and teacher, Google/Microsoft SSO.
• Email and phone verification (OTP) – configurable.
OTP login (switched on or off in .env)
• OTP_ENABLED=true|false. When true, the login page also offers "Login with OTP": the user enters email or phone, receives a one-time code by SMS or email, and enters it to sign in. When false, the OTP endpoints return 404 and the option is hidden, so only password login works.
• The web app reads the flag at runtime from GET /api/v1/config/public, so changing .env and restarting the API is enough, with no frontend rebuild.
• Endpoints: POST /auth/otp/request, POST /auth/otp/verify.
• Settings: OTP_CHANNEL (sms, email or both), OTP_LENGTH (6), OTP_TTL_SECONDS (300), OTP_MAX_ATTEMPTS (5), OTP_RESEND_COOLDOWN_SECONDS (60), OTP_PROVIDER (console for development, which prints the code in the log, or your SMS/email provider).
• Rules: store the code hashed, single use, expires; rate limit per phone, email and IP; lock after max attempts; give the same response whether or not the account exists; write every request and verify to the audit log.
• OTP is an alternative to the password. The same service also handles forgot password and phone verification when enabled.
• India SMS note: commercial SMS providers require DLT registration of the sender ID and message template, so start that early.
3.3 User Onboarding
• Admin creates users one by one or by CSV bulk user import (name, email, phone, user_code, role, class), with the same validation + error report style as question import.
• No self-registration: there is no public sign-up page or register endpoint. Only Admin creates accounts.
• User status: active, inactive, suspended. Soft delete only (keep attempts and reports intact).
3.4 Profile
Name, email, phone, user code, photo (optional), class/batch, language, password change.
4. Classes, Groups and Quiz Assignment (missing in v1.0)
Reports by student need a link between teachers and students.
• Class / Batch / Group: name, academic year, teacher(s), students.
• A student can belong to multiple classes; a class can have multiple teachers.
• Quiz assignment: assign to a class, group, or individual students.
• Schedule: start date/time, end date/time, timezone, late submission rule.
• Access options: access code / password for a quiz, IP restriction (optional), allow only on a scheduled window.
• Student dashboard: Upcoming, In progress, Completed, Missed.
5. Result / Report Release Control (after submit)
The admin or teacher decides what the student sees after submitting.
5.1 Release Modes (per quiz, per-assignment override allowed)
1. Immediate – student sees result right after submit.
2. Manual release (default) – student sees only "Submitted successfully"; teacher/admin releases later (all at once, per class, or per student).
3. Scheduled release – auto-release at a set date/time (e.g. after the quiz window closes).
4. Never – only teacher/admin see results.
5.2 What Is Shown When Released (checkboxes)
• Score and percentage
• Pass / fail
• Rank / class average (optional)
• Correct / incorrect marks per question
• Student's own answers
• Correct answers
• Explanations
• Category-wise and time-wise analytics
5.3 Controls and Rules
• Bulk actions: Release all / Hide all / Release selected from the results screen.
• Per-student override (e.g. hold one student's result for review).
• Release status stored with who released it and when (audit trail).
• Manually graded questions: result auto-stays "pending" until grading is complete.
• Notification (email / in-app) to students when results are released.
• Student can download own result PDF only if released and allowed.
6. Reports (Admin / Teacher)
6.1 Report Types
1. Student report – all attempts, scores, trends, category-wise strengths/weaknesses, time per question.
2. Quiz report – attempts, average/highest/lowest, pass %, score distribution chart, completion rate.
3. Class report – ranking, comparison across students and quizzes.
4. Question analysis – % correct, most common wrong option, average time, discrimination index; flags bad questions.
5. Category / difficulty report – performance by topic and difficulty.
6. Attempt log – start/end time, IP, device, tab-switch count, status (submitted / auto-submitted / abandoned).
7. Teacher report (admin only) – quizzes created, classes, activity.
8. Pending / not attempted list – who has not taken an assigned quiz.
9. Audit and activity report (admin only).
6.2 Features
• Filters: date range, class, quiz, student, category, difficulty, pass/fail, released/unreleased.
• Search, sort, server-side pagination.
• Export: CSV, Excel (XLSX), PDF; scheduled email reports (optional).
• Data scope enforced on server: teacher only sees own classes/quizzes; admin sees all.
• Large exports run as background jobs with a download link.
6.3 Student Report (My Results)
• After login, the student dashboard has a My Results page listing all of their own attempts: quiz, date, status and score.
• A student sees only their own data; the server filters by the logged-in user, never by an id sent from the browser.
• Release rules from section 5 apply to each attempt: until the teacher or admin releases it, the row shows "Submitted, awaiting release" with no score or answers. Once released, the student opens the full report with the items the teacher or admin ticked in 5.2.
• Released results also feed a personal history: score trend, category-wise strengths and weaknesses, and an optional own-result PDF download.
7. Items Missing in v1.0 (Recommended Additions)
7.1 Quiz-Taking Integrity
• Server-side timer (never trust the browser clock); auto-submit on expiry.
• Resume after refresh / disconnect with remaining time preserved; autosave answers every few seconds.
• Prevent multiple simultaneous sessions for one attempt.
• Optional anti-cheat: tab-switch / fullscreen-exit detection with counter, disable copy-paste, randomize questions and options per student, question pools.
• Never send correct answers to the browser during the attempt; grade on the server only.
7.2 Grading
• Auto-grading for the four existing types.
• Manual grading for long-answer / subjective questions (teacher grading screen).
• Regrade after fixing a wrong answer key (recalculate all attempts, log the change).
• Negative marking and partial scoring (already listed as optional; make it a quiz-level setting).
• Retake policy: best / latest / average attempt counts.
7.3 Content
• Question versioning (editing a question must not change past attempts – snapshot at attempt time).
• Question status: draft / review / approved / archived.
• Tags in addition to categories.
• Import/export of whole quiz as JSON (backup, cloning across installations).
7.4 Platform
• Audit log: who changed what and when (users, roles, questions, releases, regrades).
• Notifications: email (SMTP / SES / SendGrid) and in-app; assignment, reminder, result released.
• Soft delete and restore (trash) for questions, quizzes, users.
• Rate limiting, CORS config, Helmet security headers, CSRF protection for cookie auth.
• Centralized error handling, structured logging (pino), request IDs.
• Health check endpoint (/health, /ready) for Docker.
• Backups: scheduled MySQL dump (mysqldump --single-transaction) + uploads volume backup, tested restore.
• Data retention and privacy: policy for deleting old attempts, export a user's data, minimal personal data (student data may be sensitive, especially minors).
• Timezone handling (store UTC, display local) and date/locale formatting.
• Multi-language UI (i18n) – optional; support Unicode / Hindi question text from day one.
• Pagination, indexing and query performance for 10k+ students and 1000+ questions.
• Accessibility (WCAG AA) already in v1.0 – include in definition of done.
• Dark mode (optional), PWA / mobile-friendly.
7.5 Corrections to v1.0 CSV Spec
• correct_answer for true/false should accept True/False/true/false/1/0 consistently.
• Option numbering: allow option_1 or the option text itself as the answer reference.
• Add tags, negative_marks, required columns.
• Image ZIP: define a rule that CSV question_image_url may be a filename resolved from the ZIP.
• The sample in section 14 has an empty explanation column in the middle of option columns – keep column order fixed in the downloadable templates.
• Import must run in a transaction (all-or-nothing) with a dry-run preview, and duplicate question_id handling chosen by the uploader: skip / update / error.
• Add a owner rule: imported questions belong to the uploading teacher.
8. Database Additions
Existing tables from v1.0 stay. Add / change:
Table
Key columns
users
id, user_code (unique), email (unique), phone (unique), password_hash, name, role_id, status, email_verified_at, phone_verified_at, last_login_at, deleted_at
roles / permissions / role_permissions
RBAC definitions
refresh_tokens
id, user_id, token_hash, device, ip, expires_at, revoked_at
password_resets / otps
user_id, token/code hash, purpose, expires_at, used_at
classes
id, name, academic_year, created_by
class_teachers / class_students
class_id, user_id
quiz_assignments
id, quiz_id, class_id or user_id, starts_at, ends_at, access_code, release_mode, release_at, show_options (JSON: score, answers, correct, explanation, analytics)
attempts (user_attempts)
+ assignment_id, started_at, expires_at, submitted_at, status, score, graded_status, released_at, released_by, tab_switch_count, ip, user_agent
attempt_answers
+ question_snapshot (JSON), time_spent, flagged, manual_score, graded_by
question_versions
question_id, version, content snapshot
import_jobs
id, type (questions/users), file, status, total, success, failed, error_report, created_by
audit_logs
id, actor_id, action, entity, entity_id, before/after (JSON), ip, created_at
notifications
id, user_id, type, payload, read_at
Add indexes on users.email, users.phone, users.user_code, attempts(user_id, quiz_id), attempts(assignment_id), audit_logs(created_at).
MySQL notes
• Use InnoDB with utf8mb4 so Hindi and other Unicode text in questions works.
• Emails: default utf8mb4 collations are case-insensitive, so the unique index on email is too; still lower-case on save. Store phone numbers normalized in E.164.
• Public IDs: use UUID/ULID (CHAR(36) or BINARY(16)), not sequential numbers, for users, quizzes and attempts.
• JSON fields (show_options, question_snapshot, audit before/after) use the native JSON type; add generated columns if you need to index a value inside.
• Run CSV imports and regrades inside transactions (all-or-nothing).
• Store timestamps in UTC with DATETIME(3).
• Long question text: TEXT / MEDIUMTEXT.
9. API Outline (REST, /api/v1)
Auth      POST /auth/login | /auth/refresh | /auth/logout | /auth/forgot-password | /auth/reset-password | /auth/change-password
Users     GET/POST /users | GET/PATCH/DELETE /users/:id | POST /users/import | GET /users/import/template   (admin)
Classes   CRUD /classes | POST /classes/:id/students | DELETE /classes/:id/students/:userId
Questions CRUD /questions | POST /questions/import/preview | POST /questions/import/commit | GET /questions/template/:type | GET /questions/export
Quizzes   CRUD /quizzes | POST /quizzes/:id/publish | POST /quizzes/:id/clone | POST /quizzes/:id/assign
Student   GET /me/assignments | POST /assignments/:id/start | PUT /attempts/:id/answers | POST /attempts/:id/submit | GET /attempts/:id/result   (only if released)
Results   POST /assignments/:id/release | POST /assignments/:id/hide | POST /attempts/:id/release | POST /attempts/:id/regrade | PATCH /attempts/:id/answers/:qid/score
Reports   GET /reports/student/:id | /reports/quiz/:id | /reports/class/:id | /reports/questions/:quizId | POST /reports/export
Admin     GET /audit-logs | GET/PATCH /settings | GET/PUT /roles
All responses: consistent error format, pagination (page, limit), and Zod-validated input.
10. Project Structure (monorepo)
quiz-platform/
├─ apps/
│  ├─ api/            # Node.js + Express (src/modules/{auth,users,classes,questions,quizzes,attempts,reports})
│  └─ web/            # React + Vite (pages: admin, teacher, student)
├─ packages/
│  └─ shared/         # Zod schemas, types, constants (roles, permissions)
├─ docker/
│  ├─ api.Dockerfile
│  ├─ web.Dockerfile
│  └─ nginx.conf
├─ docker-compose.yml
├─ docker-compose.dev.yml
├─ .env.example
└─ README.md
11. Deployment – Two Ways to Run
11.1 Option A: Docker Compose (recommended)
Services: db (MySQL), redis, api, web (Nginx serving the React build and proxying /api), optional minio.
services:
  db:
    image: mysql:latest   # pin a major version in production
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
      MYSQL_USER: ${DB_USER}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysqldata:/var/lib/mysql
    healthcheck:
      test: ["CMD-SHELL", "mysqladmin ping -h 127.0.0.1 -uroot -p$$MYSQL_ROOT_PASSWORD --silent"]
      interval: 5s
      retries: 20
      start_period: 20s

  redis:
    image: redis:latest
    volumes:
      - redisdata:/data

  api:
    build:
      context: .
      dockerfile: docker/api.Dockerfile
    env_file: .env   # DATABASE_URL=mysql://${DB_USER}:${DB_PASSWORD}@db:3306/${DB_NAME}
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - uploads:/app/uploads
    command: sh -c "npx prisma migrate deploy && node dist/server.js"

  web:
    build:
      context: .
      dockerfile: docker/web.Dockerfile
    ports:
      - "80:80"
    depends_on:
      - api

volumes:
  mysqldata:
  redisdata:
  uploads:
Commands: cp .env.example .env → edit secrets → docker compose up -d --build → seed first admin with docker compose exec api npm run seed:admin.
11.2 Option B: Direct Run (without Docker)
1. Install Node.js LTS, MySQL, (Redis optional).
2. cp .env.example .env and set DATABASE_URL, JWT_SECRET, etc.
3. Backend: cd apps/api && npm install && npx prisma migrate deploy && npm run seed:admin && npm run build && npm start (use pm2 for production).
4. Frontend: cd apps/web && npm install && npm run build and serve dist/ with Nginx, or npm run dev for development.
11.3 Environment Variables (.env.example)
NODE_ENV, PORT, DATABASE_URL (mysql://user:pass@db:3306/dbname), DB_ROOT_PASSWORD, DB_USER, DB_PASSWORD, DB_NAME, REDIS_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, ACCESS_TTL, REFRESH_TTL, CORS_ORIGIN, UPLOAD_DIR, MAX_UPLOAD_MB, SMTP_HOST/PORT/USER/PASS, SMTP_FROM, OTP_ENABLED, OTP_CHANNEL, OTP_LENGTH, OTP_TTL_SECONDS, OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_SECONDS, OTP_PROVIDER, SMS_PROVIDER_KEY (optional), S3_ENDPOINT/BUCKET/KEY/SECRET (optional), ADMIN_EMAIL, ADMIN_PASSWORD (first seed only)
11.4 Production Checklist
HTTPS (Nginx/Caddy/Traefik + Let's Encrypt), non-root containers, secrets not committed, DB backups, log rotation, resource limits, CI pipeline (lint → test → build → push image).
12. Screens by Role
Admin: dashboard (users, quizzes, attempts, activity), user management + import, roles/permissions, classes, all quizzes, all reports, settings, audit logs.
Teacher: dashboard, my classes/students, question bank + CSV import, quiz builder, assign/schedule, grading queue, results with Release / Hide controls, reports + export.
Student: dashboard (upcoming / in progress / completed), quiz instructions page, quiz player (palette, flag, timer), submission confirmation, My Results page (own attempts; details only when released), profile.
13. Non-Functional Requirements
• Performance: quiz page load < 2 s; submit < 1 s for normal quizzes; support 100 concurrent quiz takers per quiz, with headroom to grow (load test with k6).
• Availability: graceful handling of network drops; answers saved locally and retried.
• Security: OWASP Top 10 review, dependency scanning (npm audit), input sanitization (DOMPurify on rich text), upload validation by magic bytes, file-type allowlist.
• Testing: unit tests for grading and permission logic (highest priority), integration tests for API, E2E for login → take quiz → release → view report.
• Code quality: ESLint, Prettier, Husky pre-commit, conventional commits.
14. Suggested Delivery Phases (incremental)
1. Foundation – monorepo, Docker Compose, DB, auth (email/phone/user code login), RBAC, user management.
2. Content – question CRUD (4 types + images), categories, CSV import/validation/templates.
3. Quizzes – quiz builder, classes, assignment and scheduling.
4. Attempts – quiz player, server timer, autosave, auto-grading, submission.
5. Results and reports – release control (immediate/manual/scheduled), student/quiz/class reports, exports.
6. Hardening – audit logs, notifications, manual grading/regrade, anti-cheat, backups, tests.
7. Advanced – analytics, certificates, SSO, LMS, extra question types, multi-tenancy (multiple institutions).
15. Open Questions to Decide
1. Decided: phone number is mandatory for everyone. Decided: OTP login is supported, switched on or off with OTP_ENABLED in .env.
2. Decided: no self-registration, only Admin creates users.
3. Decided: no, teachers see only their own questions and quizzes.
4. Decided: default release mode is manual (teacher/admin releases).
5. Decided: long-answer questions with manual grading come in a later phase.
6. Decided: under 100 students take a quiz at the same time.
7. Are students minors? (affects privacy and consent requirements)
8. Email/SMS provider available? Hosting target (own server, VPS, cloud)?
9. Decided: single institution for now, multi-tenancy later (see section 2.4).
10. Languages needed (English, Hindi, others)?
Version 2.0 – Draft for review
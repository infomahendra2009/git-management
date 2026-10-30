# QA Management System — Development & Features Guide

This doc is for anyone working on the codebase: what's built, how it's wired together, and
how to run it day to day. For a quick start (Docker, default logins), see `README.md`.

---

## 1. Tech stack

| Layer     | Choice                                   |
|-----------|-------------------------------------------|
| Frontend  | React 18 + Vite, React Router, Axios       |
| Backend   | Node.js + Express                          |
| Database  | MySQL 8 via `mysql2/promise` (connection pool) |
| Auth      | JWT (7d expiry), bcrypt password hashing  |
| Packaging | Docker Compose (three services: `mysql`, `backend`, `frontend`) |

No ORM — raw SQL via `mysql2`'s promise API, wrapped in a few small helpers in
`config/db.js` (`query`, `get`, `run`, `transaction`). Foreign keys are real `FOREIGN KEY`
constraints (InnoDB), so the cascades in the schema (below) are enforced by MySQL itself,
not just documented.

### Why every controller is `async`

`mysql2/promise` is promise-based — there's no synchronous query API the way
`better-sqlite3` had. Every controller function is `async (req, res) => { ... }` and awaits
`db.query/get/run`. Because Express 4 does **not** automatically catch a rejected promise
from a route handler (it would otherwise just hang the request with no response), every
route in `routes/*.js` wraps its controller in `middleware/asyncHandler.js`:

```js
router.post('/', asyncHandler(ctrl.create));
```

If you add a new route, wrap it the same way — forgetting to will make failures hang
instead of returning a clean 500.

---

## 2. Project layout

```
qa-management/
├── frontend/
│   ├── src/
│   │   ├── pages/          One file per screen (see §4)
│   │   ├── components/     Layout (sidebar/topbar), ProtectedRoute
│   │   ├── context/        AuthContext — holds the JWT + current user in memory/localStorage
│   │   ├── api.js          Axios instance, attaches Bearer token, handles 401 → redirect to /login
│   │   └── styles/index.css  Design tokens (CSS vars) + all component styles
│   └── vite.config.js
├── backend/
│   ├── controllers/        One file per resource — all async, all the actual logic
│   ├── routes/              Thin Express routers; wires paths → asyncHandler(controller fn) + middleware
│   ├── middleware/
│   │   ├── auth.js          requireAuth (verifies JWT), requireRole('admin') (role gate)
│   │   └── asyncHandler.js   Forwards rejected promises to Express's error handler
│   ├── config/db.js         mysql2 pool + query/get/run/transaction helpers + initSchema (with retry)
│   └── seed.js              Idempotent seed: creates tables, 2 users + a sample project/release/task/29 test cases
└── docker-compose.yml     mysql (with healthcheck) + backend + frontend
```

Controllers talk to the database directly — there's no service/repository layer. For an
MVP this keeps things easy to trace: open a controller file, read top to bottom, see the
whole request lifecycle for that endpoint.

---

## 3. Running it locally (no Docker)

You'll need a MySQL or MariaDB server reachable from your machine — a local install, a
Docker one-off (`docker run -p 3306:3306 -e MYSQL_ROOT_PASSWORD=x -e MYSQL_DATABASE=qa_management mysql:8.0`),
or a cloud instance all work.

**Backend**
```bash
cd backend
npm install
cp .env.example .env      # PORT, JWT_SECRET, MYSQL_HOST/PORT/USER/PASSWORD/DATABASE
npm run seed                # first run only — creates tables + seed data
npm run dev                  # http://localhost:4000
```

**Frontend** (separate terminal)
```bash
cd frontend
npm install
cp .env.example .env       # VITE_API_URL=http://localhost:4000/api
npm run dev                  # http://localhost:5173
```

Both support hot reload. The frontend proxies nothing — it just calls `VITE_API_URL`
directly via Axios, so CORS is enabled on the backend for all origins in dev.

### Useful backend scripts
| Command          | What it does                                      |
|-------------------|----------------------------------------------------|
| `npm run dev`      | `node server.js` — creates tables if missing, then listens |
| `npm start`         | Same as `dev`, used in Docker       |
| `npm run seed`      | Runs `seed.js` — creates tables, safe to re-run (`--if-empty` skips if users already exist) |

### Resetting the database
```bash
mysql -u root -p -e "DROP DATABASE qa_management; CREATE DATABASE qa_management;"
node backend/seed.js
```
With Docker Compose, `docker compose down -v` drops the `qa-mysql-data` volume entirely —
the next `up` starts from a clean database and re-seeds automatically.

---

## 4. Frontend pages → what they do

| Page | Route | Notes |
|------|-------|-------|
| `Login.jsx` | `/login` | Email/password → JWT stored via `AuthContext` |
| `Dashboard.jsx` | `/` | Totals, pass/fail summary, release status counts, recent test executions |
| `Projects.jsx` | `/projects` | List + search + create; admin sees a delete column |
| `ProjectDetail.jsx` | `/projects/:id` | Releases + tasks for one project; create/delete both (delete is admin-only); archive project |
| `ReleaseDetail.jsx` | `/releases/:id` | Tasks in this release, **grouped by status with filter chips**; create a task pre-assigned to this release; publish → close lifecycle; admin delete |
| `TaskDetail.jsx` | `/tasks/:id` | Test cases for a task: create, mark pass/fail/blocked/not_executed, per-case notes; admin delete |
| `Reports.jsx` | `/reports?release_id=` | Per-release breakdown (severity × status), CSV export, list of published reports |
| `Settings.jsx` | `/settings` | Admin only: user management (create/remove/toggle role), app-wide company name, self password change |
| `PublicDashboard.jsx` | `/public` | **No auth.** Latest published report + release history, meant to be shared outside the team |

All authenticated routes are wrapped in `ProtectedRoute`, which redirects to `/login` if
there's no valid session, and to `/` if a non-admin hits an `adminOnly` route.

### Form-submission guard pattern
Every create form (`Projects`, `ProjectDetail`, `ReleaseDetail`, `TaskDetail`) uses a
`creating`/`busy` boolean state: the submit handler bails out immediately if a request is
already in flight, and the form's inputs + buttons are `disabled` while it waits. This is
what fixed the "double-click creates two of the same task" bug — before, nothing stopped a
second submit event from firing a second `POST` while the first was still pending.

```js
const [creating, setCreating] = useState(false);

async function handleCreate(e) {
  e.preventDefault();
  if (creating) return;      // <- the guard
  setCreating(true);
  try {
    await api.post('/tasks', payload);
    ...
  } finally {
    setCreating(false);
  }
}
```

Apply the same pattern to any new create/update form you add.

---

## 5. Backend: routes and roles

All routes below (except `/api/public/*` and `/api/auth/login`) require a valid JWT in
`Authorization: Bearer <token>`. Routes marked **admin** additionally require `role: 'admin'`
via `requireRole('admin')` — a non-admin gets `403 { error: 'Insufficient permissions' }`.

| Resource | Method & path | Role | Notes |
|---|---|---|---|
| Auth | `POST /api/auth/login` | — | Returns `{ token, user }` |
| | `GET /api/auth/me` | any | Current user from the JWT |
| | `POST /api/auth/change-password` | any | Requires current password |
| | `POST /api/auth/logout` | any | Stateless — just for symmetry, JWT isn't revoked server-side |
| Dashboard | `GET /api/dashboard/summary` | any | Totals + recent activity |
| Projects | `GET/POST /api/projects` | any | `GET` supports `?search=` |
| | `GET/PUT /api/projects/:id` | any | `GET` includes nested `releases[]` and `tasks[]` |
| | `PUT /api/projects/:id/archive` | any | Soft-hide, not a delete |
| | `DELETE /api/projects/:id` | **admin** | Cascades to releases → tasks → test cases → executions |
| Releases | `GET/POST /api/releases` | any | `GET` supports `?project_id=` |
| | `GET/PUT /api/releases/:id` | any | `GET` includes nested `tasks[]` |
| | `POST /api/releases/:id/publish` \| `/close` | any | Lifecycle: `draft → published → closed` |
| | `DELETE /api/releases/:id` | **admin** | Tasks survive, `release_id` set to `NULL` |
| Tasks | `GET/POST /api/tasks` | any | `GET` supports `?project_id=` / `?release_id=` |
| | `GET/PUT /api/tasks/:id` | any | `GET` includes nested `testCases[]` with joined execution status |
| | `DELETE /api/tasks/:id` | **admin** | Cascades to test cases → executions |
| Test cases | `GET/POST /api/test-cases` | any | `GET` supports `?task_id=` |
| | `PUT/DELETE /api/test-cases/:id` | any | Not currently role-gated — see §7 |
| Execution | `GET/PUT /api/execution/:testCaseId` | any | One execution row per test case, upserted on `PUT` |
| Reports | `GET /api/reports/release/:id` | any | Live-computed summary (total/pass/fail/pending, by severity) |
| | `GET /api/reports/release/:id/csv` | any | Same data as CSV download |
| | `POST /api/reports/release/:id/publish` | any | Snapshots the summary into `reports` table, `published = 1` |
| | `GET /api/reports` | any | List of all published reports |
| Public | `GET /api/public/latest` | — | Most recent published report, no auth |
| | `GET /api/public/history` | — | Pass-rate history across published releases |
| | `GET /api/public/reports/:id` | — | One specific published report |
| Settings | `GET/POST /api/settings/users` | **admin** | List / create users |
| | `PUT /api/settings/users/:id/role` | **admin** | Toggle admin ↔ qa |
| | `DELETE /api/settings/users/:id` | **admin** | Remove a user |
| | `GET /api/settings/app` | any | e.g. company name shown on the public dashboard |
| | `PUT /api/settings/app` | **admin** | Update app-wide settings |

---

## 6. Database schema (MySQL / InnoDB)

```
users            id, name, email (unique), password_hash, role ENUM(admin|qa), created_at
projects         id, name, description, archived, created_by → users (SET NULL), created_at
releases         id, project_id → projects (CASCADE), version, status ENUM(draft|published|closed),
                 published_at, closed_at, created_at
tasks            id, project_id → projects (CASCADE), release_id → releases (SET NULL),
                 title, description, assigned_to → users (SET NULL), priority ENUM(low|medium|high|critical),
                 status ENUM(todo|in_progress|done), due_date, created_at
test_cases       id, task_id → tasks (CASCADE), code, feature, scenario, expected_result,
                 severity ENUM(critical|high|medium|low), priority, created_at
test_execution   id, test_case_id → test_cases (CASCADE), status ENUM(pass|fail|blocked|not_executed),
                 comments, executed_by → users (SET NULL), executed_at
reports          id, release_id → releases (CASCADE), type ENUM(release|daily), summary_json,
                 published, created_at
settings         id, setting_key (unique), value     -- simple key/value store, e.g. company_name
```

`ON DELETE CASCADE` vs `SET NULL` is deliberate: deleting a **project** wipes everything
under it (that's the whole point of "delete project"), but deleting a **release** only
detaches its tasks — the QA work itself isn't considered disposable just because a release
got deleted. These are real MySQL foreign key constraints (all tables are InnoDB), not
application-level checks.

**Two MySQL-specific naming notes**, in case you're diffing against the old SQLite version:
- `settings.key` was renamed to `settings.setting_key` — `key` is a reserved word in MySQL
  (used for index definitions) and is awkward to work with even when backtick-quoted.
- Enum-like columns (`role`, `status`, `priority`, `severity`, `type`) moved from
  `TEXT + CHECK(...)` to native MySQL `ENUM(...)` — same validation intent, more idiomatic
  for MySQL, and doesn't depend on MySQL 8.0.16+'s CHECK-constraint enforcement.

---

## 7. Feature list (current state)

**Done**
- JWT auth, two roles (`admin`, `qa`), protected routes on both frontend and backend
- Projects: create, edit, archive, admin-delete, search
- Releases: create, publish, close, admin-delete, **tasks grouped by status with filter chips**, closed releases are read-only for new tasks
- Tasks: create (from a project or directly from a release), priority, status, admin-delete
- Test cases: create per task, severity, linked one-to-one with an execution record
- Test execution: pass/fail/blocked/not_executed + free-text notes per test case
- Reports: live per-release summary (total/pass/fail/pending, broken down by severity),
  CSV export, publish a snapshot
- Public dashboard: no-auth read-only view of the latest published report + release history
- Settings: user management (create/remove/role toggle), app-wide company name, self password change
- Duplicate-submit guard on all create forms

**Not built yet (called out in the SRS but out of scope for this pass)**
- Excel export (only CSV exists)
- Daily/scheduled reports (`reports.type` supports `'daily'` in the schema, nothing generates them yet)
- Email notifications / password reset flow
- Test-case delete/edit is not currently role-gated the way project/release/task deletes are —
  any authenticated user can edit or delete a test case. Worth deciding if that should be
  admin-only or task-owner-only before this goes to real users.
- No audit log of who deleted what — deletes are immediate and permanent, confirmed only by
  a browser `confirm()` dialog.

---

## 8. Conventions for adding new features

- **New backend resource** → add an *async* controller (`controllers/xController.js`,
  using `db.query`/`db.get`/`db.run`), a router (`routes/x.js`, each handler wrapped in
  `asyncHandler`), wire it into `server.js`, and add the table to the `SCHEMA` string in
  `config/db.js` if needed.
- **New frontend page** → add to `src/pages/`, register the route in `App.jsx`, wrap in
  `ProtectedRoute` (with `adminOnly` if needed), add a nav link in `components/Layout.jsx`
  if it should be reachable from the sidebar.
- **Anything that creates/updates data from a form** → use the `creating`/`busy` guard
  pattern from §4 so it can't be double-submitted.
- **Anything destructive** (delete) → gate behind `requireRole('admin')` on the backend
  *and* check `user.role === 'admin'` on the frontend before rendering the control — the
  backend check is what actually matters for security, the frontend check just avoids
  showing a button that will 403.
- **Styling** → reuse the CSS variables in `src/styles/index.css` (`--brand`, `--critical`,
  `--paper`, etc.) rather than hardcoding colors, so the public dashboard and the internal
  console stay visually consistent.

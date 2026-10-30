# QA Management System (MVP)

A full-stack QA release-sign-off tool: manage projects, releases, tasks, test cases and
execution, then publish a read-only report the rest of the company can see without logging in.

Built from the MVP SRS: **React + Node.js + Express + MySQL + Docker Compose.**

## What's included

- **Backend** — Express API, JWT auth (admin/QA roles), MySQL via `mysql2` (connection pool, async/await).
- **Frontend** — React (Vite), client-side routed, talks to the API over `VITE_API_URL`.
- **Public Dashboard** — `/public` route, no login required, shows the latest published
  report and release history.
- Seed data — one admin, one QA user, and the **Host Management** project pre-loaded with
  the 29 test cases from the original sign-off checklist.

## Folder structure

```
qa-management/
├── frontend/            React app (Vite)
│   └── src/
│       ├── pages/        Login, Dashboard, Projects, Release, Task, Reports, Settings, PublicDashboard
│       ├── components/   Layout, ProtectedRoute
│       ├── context/       AuthContext (JWT session)
│       └── api.js         Axios client
├── backend/
│   ├── controllers/      Route handlers (all async — see DEVELOPMENT.md)
│   ├── routes/            Express routers, each handler wrapped in asyncHandler
│   ├── middleware/        JWT auth + role guard + asyncHandler
│   ├── config/db.js       MySQL pool, query/get/run/transaction helpers, schema (auto-created)
│   ├── seed.js            Seeds admin/QA users + sample project (creates tables first)
│   └── server.js
├── docker-compose.yml     mysql + backend + frontend, with a MySQL healthcheck
└── README.md
```

## Run it with Docker (recommended)

```bash
cd qa-management
docker compose up --build
```

This starts three containers: `mysql` (with a healthcheck the backend waits on),
`backend`, and `frontend`.

- Backend: http://localhost:4000
- Frontend: http://localhost:5173
- Public dashboard: http://localhost:5173/public
- MySQL: exposed on localhost:3306 too, if you want to connect a client directly

The backend creates its tables automatically on boot and seeds itself on first run
(`--if-empty`), so the `qa-mysql-data` volume only gets seeded once — later restarts
keep whatever data you've entered. To fully reset, `docker compose down -v` (the `-v`
drops the MySQL volume).

## Run it locally without Docker

**Backend** — you'll need a MySQL (or MariaDB) server running locally first.
```bash
cd backend
npm install
cp .env.example .env      # set MYSQL_HOST/USER/PASSWORD/DATABASE to match your local server
npm run seed                 # first time only — creates tables, admin/qa users, sample data
npm run dev                   # http://localhost:4000
```
`seed.js` and `server.js` both create the tables if they don't exist yet (`CREATE TABLE IF
NOT EXISTS`), and both retry the MySQL connection for up to ~30s if the server isn't ready
yet, so start order between MySQL and the backend doesn't matter much.

**Frontend** (separate terminal)
```bash
cd frontend
npm install
cp .env.example .env   # points VITE_API_URL at the backend
npm run dev             # http://localhost:5173
```

## Login

| Role  | Email            | Password   |
|-------|------------------|------------|
| Admin | admin@qa.local   | Admin123!  |
| QA    | qa@qa.local      | Qa123!     |

Change these before deploying anywhere real — go to **Settings → Your profile** once logged in,
or create new users and remove the seeded ones.

## How the modules map to the SRS

| SRS module              | Where it lives                                   |
|--------------------------|---------------------------------------------------|
| Login & Authentication  | `/login`, JWT middleware, Settings → change password |
| Dashboard               | `/` — totals, pass/fail summary, recent activity |
| Project Management      | `/projects`, `/projects/:id`                      |
| Release Management      | `/releases/:id` — publish / close a release, tasks grouped by status |
| Task Management         | Inside a project's task list, or created directly from a release   |
| Test Case Management    | `/tasks/:id` — add/edit test cases per task         |
| Test Execution          | `/tasks/:id` — mark pass/fail/blocked + notes       |
| Reports                 | `/reports` — per-release breakdown + CSV export     |
| Public Dashboard        | `/public` — no login, latest report + history       |
| Settings                | `/settings` — users, roles, company name            |

Excel export and daily reports (also listed in the SRS) aren't built yet — CSV export and
release-level reports are in place as the first cut. Happy to add those next if useful.

## Release pages, task status, and deleting things

- **Release detail page** now groups its tasks by status (To do / In progress / Done) with
  filter chips and live counts, and lets you add a task directly to that release. Once a
  release is **closed**, its "+ New task" control disappears and a banner marks it read-only —
  the tasks stay visible for reference, but the release stops accepting new work.
- **Deleting** — Admins only can permanently delete a project, a release, or a task, from the
  Projects list, a project's page, a release's page, or a task's page. Deleting a project
  cascades to its releases, tasks, and test cases. Deleting a release keeps its tasks but
  unassigns them from that release. Deleting a task removes its test cases too. Every delete
  asks for confirmation first — there's no undo.
- **Duplicate task bug** — creating a release or a task (or a project, or a test case) now
  disables the form and ignores repeat submissions while the request is in flight, so a
  double-click or a slow connection can no longer create the same thing twice.


## Security notes before using this for real data

- Change `JWT_SECRET`, and `MYSQL_ROOT_PASSWORD` / `MYSQL_PASSWORD`, in `backend/.env`
  (or the Docker Compose env vars) to long random values — the defaults in this repo are
  placeholders, not real secrets.
- Change or remove the seeded accounts.
- This MVP does not send password-reset emails or verify email addresses — add that before
  opening it up beyond a trusted internal team.
- The `mysql` service's port (3306) is published to the host in `docker-compose.yml` for
  local convenience. Remove that `ports:` mapping in production so MySQL is only reachable
  from the `backend` container over the Docker network.

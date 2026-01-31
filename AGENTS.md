# AGENTS.md

Guidance for agentic coding in this repository.

## Stack & layout

- **Backend**: Flask + SQLAlchemy (Python)
- **Frontend**: React 18 + Vite + TailwindCSS (JavaScript)

Repo map:

- `app/` Flask app (factory, routes, services, models)
- `run.py` backend entrypoint
- `requirements.txt` backend deps
- `frontend/` Vite app
- `static/` built frontend output served by Flask
- `instance/` SQLite DB and runtime state (created automatically)

Cursor/Copilot rules:

- No `.cursorrules`
- No `.cursor/rules/`
- No `.github/copilot-instructions.md`

---

## Build / lint / test commands

### Backend (Flask)

Create a venv and install deps:

```bash
pip install -r requirements.txt
```

Run the server:

```bash
python run.py
```

Expected:

- Console prints: `访问地址: http://localhost:8002`
- `instance/` directory is created if missing
- DB tables are auto-created on startup (`app/__init__.py` calls `db.create_all()`)

Useful env vars:

- `FLASK_ENV` (defaults to `development` in `app/__init__.py`)
- `DATABASE_URL` (overrides SQLite path)
- `SECRET_KEY`

### Frontend (Vite + React)

From `frontend/`:

```bash
npm install
npm run dev
```

Other scripts (from `frontend/package.json`):

- Build: `npm run build`
- Preview: `npm run preview`

Build output:

- Vite is configured to output to `../static` (see `frontend/vite.config.js`).

### Tests

No automated tests are currently configured/found in this repo (no pytest config, no Vitest/Jest config, no `*.test.*`/`*.spec.*`).

If you add tests later, document the chosen framework here and support “run a single test”.

Suggested conventions:

- **Backend (pytest)**
  - Run all: `pytest`
  - Run file: `pytest path/to/test_file.py`
  - Run one test: `pytest -k test_name_substring`

- **Frontend (Vitest)**
  - Run all: `npx vitest`
  - Run file: `npx vitest path/to/file.test.jsx`
  - Run one test: `npx vitest -t "test name"`

### Manual verification (current reality)

Backend API smoke check (after starting `python run.py`):

```bash
curl -s http://localhost:8002/api/accounts | python -m json.tool
```

Frontend dev:

1) Start backend
2) Start frontend (`npm run dev`)
3) Verify login + account list + import flows in browser

---

## Known gotchas

### Vite proxy port mismatch

`frontend/vite.config.js` proxies `/api` to `http://localhost:5000`, but `run.py` starts Flask on `8002`.

When doing dev work, prefer one of:

- Change Vite proxy target to `http://localhost:8002` (dev convenience)
- Or run backend on port 5000 instead

### SQLite location

Default DB path: `instance/accounts.db` (see `app/config.py`).

---

## Code style & conventions

Follow existing patterns in this repo unless explicitly refactoring.

### General

- Make changes **minimal and localized**; avoid drive-by refactors.
- Prefer readability over cleverness.
- Add comments/docstrings when behavior is non-obvious.
- Do not introduce new dependencies without a clear need.
- Do not commit secrets/credentials.

### Backend (Python)

Observed style:

- 4-space indentation
- Module and function docstrings are common
- Service layer: `app/services/*`
- Route layer: `app/routes/api.py`

#### API responses

Keep response shape consistent across endpoints:

- Success:
  - `{ "success": true, "data": <payload>, "message": "..." }`
  - Helper: `app/routes/api.py::success_response()`
- Error:
  - `{ "success": false, "data": null, "message": "..." }`
  - Helper: `app/routes/api.py::error_response(message, code)`

#### Error handling

- Validate request body early; return 400 via `error_response()` for client errors.
- Catch `ValueError` for expected validation failures.
- For unexpected exceptions, return 500 with a safe message.
- Use status codes intentionally: 400/401/403/404/500.

#### Database

- SQLAlchemy is used via `Flask-SQLAlchemy` (`app/__init__.py` exports `db`).
- Be mindful that tables are created automatically on startup; schema changes may need explicit migration scripts.

### Frontend (React)

Observed style:

- Imports grouped: external first (`react`, `lucide-react`), then local.
- Indentation often 4 spaces.
- Semicolons appear in some files; keep consistency within the file you touch.

#### API client

- Central API wrapper: `frontend/src/services/api.js`
- Uses `API_BASE = '/api'` and expects JSON responses.

#### UI

- TailwindCSS for styling.
- `darkMode` is a boolean state passed into components; keep new components compatible if touched.

### Naming

- Python: `snake_case` functions/vars; `CamelCase` classes.
- React: `PascalCase` components; `camelCase` functions/vars.

---

## What to check before opening a PR

- Frontend builds: `cd frontend && npm run build`
- App starts: `python run.py`
- Quick API smoke check: `curl -s http://localhost:8002/api/accounts | python -m json.tool`

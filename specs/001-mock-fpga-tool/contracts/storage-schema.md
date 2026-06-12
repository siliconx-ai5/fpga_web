# Contract: SQLite Storage Schema

SQLite runs in browser through a WASM runtime. The database is persisted per browser profile.

## Tables

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT
);

CREATE UNIQUE INDEX projects_active_name_idx
ON projects(name)
WHERE archived_at IS NULL;

CREATE TABLE artifacts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN (
    'rtl',
    'testbench',
    'documentation',
    'ai_explanation',
    'debug_suggestions'
  )),
  filename TEXT NOT NULL,
  language TEXT NOT NULL,
  content TEXT NOT NULL,
  source_prompt TEXT,
  metadata_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE simulation_runs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  rtl_artifact_id TEXT NOT NULL REFERENCES artifacts(id),
  testbench_artifact_id TEXT REFERENCES artifacts(id),
  status TEXT NOT NULL CHECK (status IN (
    'queued',
    'running',
    'passed',
    'failed',
    'error',
    'cancelled'
  )),
  started_at TEXT,
  finished_at TEXT,
  summary TEXT,
  log TEXT,
  waveform_json TEXT,
  assertions_json TEXT
);

CREATE TABLE user_settings (
  id TEXT PRIMARY KEY,
  theme TEXT NOT NULL DEFAULT 'system',
  notification_permission_seen INTEGER NOT NULL DEFAULT 0,
  default_model TEXT,
  complexity_cap TEXT NOT NULL DEFAULT 'medium' CHECK (complexity_cap IN ('low', 'medium', 'high')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE ai_generation_requests (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN (
    'rtl',
    'testbench',
    'explanation',
    'debug',
    'documentation'
  )),
  input_text TEXT NOT NULL,
  model TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed')),
  error_message TEXT,
  created_artifact_id TEXT REFERENCES artifacts(id),
  created_at TEXT NOT NULL,
  finished_at TEXT
);
```

## Required Queries

- List active projects ordered by `updated_at DESC`.
- Load project workspace with artifacts ordered by `created_at ASC`.
- Load latest RTL and testbench artifacts for a project.
- Load latest simulation run for a project.
- Export all project artifacts and simulation logs by project id.

## Migration Rules

- Every schema version is recorded in `PRAGMA user_version`.
- Migrations run at app startup before repositories are used.
- Migration failure surfaces a blocking UI error with export/download guidance when possible.

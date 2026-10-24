CREATE TABLE solar_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  latitude REAL,
  longitude REAL,
  revision INTEGER NOT NULL DEFAULT 1,
  schema_version INTEGER NOT NULL DEFAULT 1,
  settings_json TEXT NOT NULL,
  solar_json TEXT,
  solar_expires_at TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX solar_projects_updated ON solar_projects(updated_at DESC);
CREATE TABLE solar_exports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES solar_projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  design_revision INTEGER NOT NULL,
  panel_count INTEGER NOT NULL,
  capacity_kwp REAL NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);
CREATE INDEX solar_exports_project ON solar_exports(project_id, created_at DESC);
-- An atomic lease stops concurrent chargeable generations for one project.
CREATE TABLE solar_jobs (
  project_id TEXT PRIMARY KEY REFERENCES solar_projects(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TEXT NOT NULL
);
-- Global, fail-closed daily request budgets, separate from per-IP limits.
CREATE TABLE solar_api_usage (
  day TEXT NOT NULL,
  service TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(day, service)
);

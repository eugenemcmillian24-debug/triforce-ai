-- schema.sql — TriForce AI Platform
-- Run via: wrangler d1 execute triforce-db --file=schema.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  github_username TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  plan TEXT NOT NULL DEFAULT 'free'
);

CREATE TABLE IF NOT EXISTS builds (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  builder_type TEXT NOT NULL CHECK(builder_type IN ('app', 'workflow', 'repair')),
  status TEXT NOT NULL DEFAULT 'pending',
  spec TEXT NOT NULL,
  output_json TEXT,
  deploy_url TEXT,
  agi_mode INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  completed_at INTEGER
);

CREATE TABLE IF NOT EXISTS provider_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  tokens_used INTEGER NOT NULL DEFAULT 0,
  requests INTEGER NOT NULL DEFAULT 1,
  task_type TEXT NOT NULL,
  timestamp INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  dag_json TEXT NOT NULL,
  agi_mode INTEGER NOT NULL DEFAULT 0,
  singularity_mode INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  last_run_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_builds_user ON builds(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_usage_provider ON provider_usage(provider_id, timestamp);

CREATE TABLE IF NOT EXISTS settings_audit (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  setting_key TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settings_audit_created_at ON settings_audit(created_at);

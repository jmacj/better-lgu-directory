PRAGMA foreign_keys = ON;

CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('correction', 'broken-link', 'document-request', 'website-feedback')),
  subject TEXT NOT NULL CHECK (length(subject) BETWEEN 5 AND 120),
  details TEXT NOT NULL CHECK (length(details) BETWEEN 20 AND 3000),
  source_url TEXT,
  contact_email TEXT,
  ip_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'published', 'needs_correction', 'archived', 'rejected')),
  moderator_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX submissions_status_created_idx ON submissions(status, created_at DESC);
CREATE INDEX submissions_ip_created_idx ON submissions(ip_hash, created_at DESC);

CREATE TABLE content_records (
  id TEXT PRIMARY KEY,
  record_type TEXT NOT NULL,
  title TEXT NOT NULL,
  payload_json TEXT NOT NULL CHECK (json_valid(payload_json)),
  source_url TEXT NOT NULL,
  source_label TEXT NOT NULL,
  source_published_at TEXT,
  last_verified_at TEXT NOT NULL,
  workflow_status TEXT NOT NULL CHECK (workflow_status IN ('draft', 'pending_verification', 'verified', 'published', 'needs_correction', 'archived')),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_by TEXT,
  approved_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX content_records_type_status_idx ON content_records(record_type, workflow_status);
CREATE INDEX content_records_verified_idx ON content_records(last_verified_at DESC);

CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  previous_json TEXT CHECK (previous_json IS NULL OR json_valid(previous_json)),
  next_json TEXT CHECK (next_json IS NULL OR json_valid(next_json)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX audit_logs_entity_idx ON audit_logs(entity_type, entity_id, created_at DESC);

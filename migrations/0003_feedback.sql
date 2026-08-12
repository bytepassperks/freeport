CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  page TEXT NOT NULL,
  heading TEXT,
  contact TEXT,
  user_agent TEXT,
  country TEXT,
  ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback (created_at);

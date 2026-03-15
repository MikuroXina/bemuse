-- Migration number: 0001 	 2026-03-15T00:01:46.407Z
CREATE TABLE chart (
  id TEXT PRIMARY KEY,
  title TEXT,
  total INTEGER NOT NULL
);

CREATE TABLE score_record (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL CHECK (created_at IS datetime(created_at)),
  user_id TEXT NOT NULL,
  chart_id TEXT NOT NULL,
  play_mode TEXT NOT NULL CHECK (play_mode IN ("KB", "BM", "TS")),
  count_meticulous INTEGER NOT NULL CHECK (count_meticulous >= 0),
  count_precise INTEGER NOT NULL CHECK (count_precise >= 0),
  count_good INTEGER NOT NULL CHECK (count_good >= 0),
  count_offbeat INTEGER NOT NULL CHECK (count_offbeat >= 0),
  count_missed INTEGER NOT NULL CHECK (count_missed >= 0),
  log TEXT CHECK (
    log IS NULL
    OR log MATCH "^[ABCDM]+$"
  ),
  FOREIGN KEY (chart_id) REFERENCES chart(id)
);

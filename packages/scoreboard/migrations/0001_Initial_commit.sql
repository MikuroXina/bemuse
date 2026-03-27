-- Migration number: 0001 	 2026-03-27T16:05:56.647Z
CREATE TABLE score_record (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL CHECK (
    created_at == STRFTIME('%Y-%m-%dT%H:%M:%fZ', created_at)
  ),
  user_id TEXT NOT NULL,
  chart_id TEXT NOT NULL,
  play_mode TEXT NOT NULL CHECK (play_mode IN ("KB", "BM", "TS")),
  count_meticulous INTEGER NOT NULL CHECK (count_meticulous >= 0),
  count_precise INTEGER NOT NULL CHECK (count_precise >= 0),
  count_good INTEGER NOT NULL CHECK (count_good >= 0),
  count_offbeat INTEGER NOT NULL CHECK (count_offbeat >= 0),
  count_missed INTEGER NOT NULL CHECK (count_missed >= 0),
  log TEXT,
  score INTEGER NOT NULL CHECK (score >= 0),
  max_combo INTEGER NOT NULL CHECK (max_combo >= 0),
  total_combo INTEGER NOT NULL CHECK (total_combo >= 0)
);

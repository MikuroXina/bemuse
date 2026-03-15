-- Migration number: 0002 	 2026-03-15T04:19:02.114Z
ALTER TABLE
  score_record
ADD
  score INTEGER NOT NULL CHECK (score >= 0);

ALTER TABLE
  score_record
ADD
  max_combo INTEGER NOT NULL CHECK (max_combo >= 0);

ALTER TABLE
  score_record
ADD
  total_combo INTEGER NOT NULL CHECK (total_combo >= 0);

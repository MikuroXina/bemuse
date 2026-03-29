-- Migration number: 0002 	 2026-03-27T18:06:17.438Z
CREATE TABLE user_frozen (
  id TEXT PRIMARY KEY,
  frozen BOOLEAN NOT NULL
);

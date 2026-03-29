-- Migration number: 0003 	 2026-03-27T18:27:03.854Z
CREATE INDEX idx__score_record__chart_id_play_mode_user_id_score_created_at ON score_record (chart_id, play_mode, user_id, score, created_at);

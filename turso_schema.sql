CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  content TEXT,
  type TEXT,
  tag TEXT,
  file_url TEXT,
  media_type TEXT,
  likes_count INTEGER DEFAULT 0,
  thumbs_up_count INTEGER DEFAULT 0,
  timestamp INTEGER
);

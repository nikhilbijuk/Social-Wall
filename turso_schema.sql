CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  content TEXT,
  type TEXT,
  tag TEXT,
  imageUrl TEXT,
  videoUrl TEXT,
  likes_count INTEGER DEFAULT 0,
  timestamp INTEGER
);

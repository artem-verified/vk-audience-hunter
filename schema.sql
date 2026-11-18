CREATE TABLE IF NOT EXISTS projects (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  niche TEXT NOT NULL DEFAULT 'children',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_snapshots (
  id BIGSERIAL PRIMARY KEY,
  project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
  vk_community_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  screen_name TEXT,
  members_count BIGINT,
  community_url TEXT,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, vk_community_id, collected_at)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_project_community
  ON community_snapshots(project_id, vk_community_id);

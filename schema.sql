-- HealthYou Wellness Portal — Database Schema

-- ── Users ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  employee_id   TEXT,
  department    TEXT,
  active        BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Activity Entries ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_entries (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  category      TEXT NOT NULL CHECK (category IN ('Fitness', 'Nutrition', 'Well-being')),
  activity_name TEXT NOT NULL,
  amount        NUMERIC(10,2),
  unit          TEXT,
  points        INTEGER DEFAULT 0,
  notes         TEXT,
  source        TEXT DEFAULT 'manual',  -- manual | device | auto
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Biometric Entries ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS biometric_entries (
  id                  SERIAL PRIMARY KEY,
  user_id             INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_date          DATE NOT NULL,
  blood_pressure_sys  INTEGER,
  blood_pressure_dia  INTEGER,
  hdl_cholesterol     INTEGER,
  ldl_cholesterol     INTEGER,
  total_cholesterol   INTEGER,
  triglycerides       INTEGER,
  blood_glucose       INTEGER,
  hba1c               NUMERIC(4,1),
  bmi                 NUMERIC(5,2),
  weight_lbs          NUMERIC(6,1),
  waist_in            NUMERIC(5,1),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Goals ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT DEFAULT 'other',
  target_date DATE,
  status      TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'paused', 'cancelled')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Teams ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  captain_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  id         SERIAL PRIMARY KEY,
  team_id    INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (team_id, user_id)
);

-- ── Challenges ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenges (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  description    TEXT,
  start_date     DATE NOT NULL,
  end_date       DATE NOT NULL,
  goal_count     INTEGER DEFAULT 8,
  goal_unit      TEXT DEFAULT 'Times',
  challenge_type TEXT DEFAULT 'Individual' CHECK (challenge_type IN ('Individual', 'Team', 'Public')),
  activities     TEXT[],
  is_active      BOOLEAN DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_enrollments (
  id           SERIAL PRIMARY KEY,
  challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id      INTEGER REFERENCES teams(id) ON DELETE SET NULL,
  enrolled_at  TIMESTAMPTZ DEFAULT NOW(),
  entries_count INTEGER DEFAULT 0,
  completed    BOOLEAN DEFAULT false,
  UNIQUE (challenge_id, user_id)
);

-- ── Rewards / Points ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_rewards (
  id                    SERIAL PRIMARY KEY,
  user_id               INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_year          INTEGER DEFAULT 2026,
  total_points          INTEGER DEFAULT 0,
  biometric_completed   BOOLEAN DEFAULT false,
  biometric_completed_at TIMESTAMPTZ,
  incentive_earned      BOOLEAN DEFAULT false,
  incentive_earned_at   TIMESTAMPTZ,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── Poll Responses ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS poll_responses (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  question   TEXT NOT NULL,
  answer     TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── Events / Calendar ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  provider    TEXT,
  event_date  DATE NOT NULL,
  start_time  TIME,
  end_time    TIME,
  description TEXT,
  event_type  TEXT DEFAULT 'webinar',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_activity_user      ON activity_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_date      ON activity_entries(activity_date);
CREATE INDEX IF NOT EXISTS idx_biometric_user     ON biometric_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user         ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team  ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user  ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user   ON challenge_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date        ON events(event_date);

-- ── Seed: Challenges ──────────────────────────────────────────────────────────
INSERT INTO challenges (name, description, start_date, end_date, goal_count, goal_unit, activities)
VALUES
  ('RYP22 2: Eat, Think, Thrive Challenge', 'Mind challenge focused on nutrition and mindfulness', '2026-05-11', '2026-06-25', 8, 'Times', ARRAY['2026 Challenge 2-Mindful', '2026 Challenge 2-Mouthful']),
  ('RYP22 1: Olympic City Strength Challenge', 'Strength and fitness challenge', '2026-02-02', '2026-03-16', 8, 'Times', ARRAY['2026 Challenge 1-Champion Mindset', '2026 Challenge 1-Peak Performance'])
ON CONFLICT DO NOTHING;

-- ── Seed: Events ─────────────────────────────────────────────────────────────
INSERT INTO events (title, provider, event_date, start_time, end_time, event_type)
VALUES
  ('Personal Finance 101', 'Nationwide', '2026-05-27', '09:00', '10:00', 'webinar'),
  ('Dealing with Prolonged Grief', 'Profile EAP', '2026-05-27', '09:00', '10:00', 'webinar'),
  ('Spend with Intention', 'Ent Credit Union', '2026-05-28', '09:30', '10:00', 'webinar'),
  ('Investment Basics – Retire and Rewards', 'Nationwide', '2026-06-04', '09:00', '10:00', 'webinar'),
  ('Parenting Your Teens: Career and Life Goals', 'Profile EAP', '2026-06-10', '11:30', '12:30', 'webinar')
ON CONFLICT DO NOTHING;

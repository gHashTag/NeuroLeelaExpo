-- Создаем таблицу players, если она не существует
CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  plan INTEGER NOT NULL DEFAULT 1,
  previous_plan INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  message TEXT,
  avatar TEXT,
  "fullName" TEXT,
  intention TEXT,
  "isStart" BOOLEAN DEFAULT FALSE,
  "isFinished" BOOLEAN DEFAULT FALSE,
  "consecutiveSixes" INTEGER DEFAULT 0,
  "positionBeforeThreeSixes" INTEGER DEFAULT 0
); 
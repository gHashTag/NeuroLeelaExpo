-- Создание таблицы reports для хранения отчетов игроков
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_plan_number ON reports(plan_number);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- Добавление поля needsReport в таблицу players, если оно еще не существует
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'players' AND column_name = 'needs_report') THEN
        ALTER TABLE players ADD COLUMN needs_report BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Комментарии для документации
COMMENT ON TABLE reports IS 'Таблица для хранения отчетов игроков о их духовном пути';
COMMENT ON COLUMN reports.user_id IS 'ID пользователя из таблицы players';
COMMENT ON COLUMN reports.plan_number IS 'Номер плана (1-72) на котором находился игрок';
COMMENT ON COLUMN reports.content IS 'Содержание отчета игрока';
COMMENT ON COLUMN reports.likes IS 'Количество лайков отчета';
COMMENT ON COLUMN reports.comments IS 'Количество комментариев к отчету'; 
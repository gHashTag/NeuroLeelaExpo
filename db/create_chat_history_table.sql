-- Создание таблицы chat_history для хранения диалогов пользователя с ИИ
CREATE TABLE IF NOT EXISTS chat_history (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_number INTEGER NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  report_id INTEGER REFERENCES reports(id),
  message_type TEXT NOT NULL DEFAULT 'report',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_plan_number ON chat_history(plan_number);
CREATE INDEX IF NOT EXISTS idx_chat_history_report_id ON chat_history(report_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_history_message_type ON chat_history(message_type);

-- Комментарии для документации
COMMENT ON TABLE chat_history IS 'Таблица для хранения истории диалогов пользователя с ИИ';
COMMENT ON COLUMN chat_history.user_id IS 'ID пользователя из таблицы players';
COMMENT ON COLUMN chat_history.plan_number IS 'Номер плана (1-72) к которому относится диалог';
COMMENT ON COLUMN chat_history.user_message IS 'Сообщение пользователя (отчет или вопрос)';
COMMENT ON COLUMN chat_history.ai_response IS 'Ответ ИИ на сообщение пользователя';
COMMENT ON COLUMN chat_history.report_id IS 'Связь с отчетом из таблицы reports (если применимо)';
COMMENT ON COLUMN chat_history.message_type IS 'Тип сообщения: report, question, general';
COMMENT ON COLUMN chat_history.created_at IS 'Время создания записи'; 
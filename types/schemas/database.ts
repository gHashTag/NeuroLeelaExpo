import { z } from 'zod';

// ===============================
// 🗃️ DATABASE SCHEMAS (ZOD)
// ===============================

// 👤 Player Schemas
export const PlayerSchema = z.object({
  id: z.string().min(1, 'User ID обязателен'),
  plan: z.number().int().min(1).max(72).default(68),
  previous_plan: z.number().int().min(0).max(72).nullable().default(0),
  updated_at: z.union([z.date(), z.string()]).nullable().optional(),
  created_at: z.union([z.date(), z.string()]).nullable().optional(),
  message: z.string().nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  fullName: z.string().max(100).nullable().optional(),
  intention: z.string().max(500).nullable().optional(),
  isStart: z.boolean().nullable().default(false),
  isFinished: z.boolean().nullable().default(false),
  consecutiveSixes: z.number().int().min(0).max(3).nullable().default(0),
  positionBeforeThreeSixes: z.number().int().min(0).max(72).nullable().default(0),
  needsReport: z.boolean().nullable().default(false)
});

export const NewPlayerSchema = z.object({
  id: z.string().min(1, 'User ID обязателен'),
  plan: z.number().int().min(1).max(72).default(68),
  previous_plan: z.number().int().min(0).max(72).nullable().optional(),
  message: z.string().nullable().optional(),
  avatar: z.string().url().nullable().optional(),
  fullName: z.string().max(100).nullable().optional(),
  intention: z.string().max(500).nullable().optional(),
  isStart: z.boolean().nullable().default(false),
  isFinished: z.boolean().nullable().default(false),
  consecutiveSixes: z.number().int().min(0).max(3).nullable().default(0),
  positionBeforeThreeSixes: z.number().int().min(0).max(72).nullable().default(0),
  needsReport: z.boolean().nullable().default(false)
});

// Partial update schema for player
export const PlayerUpdateSchema = NewPlayerSchema.partial().omit({ id: true });

// 📋 Report Schemas
export const ReportSchema = z.object({
  id: z.number().int().positive(),
  user_id: z.string().min(1, 'User ID обязателен'),
  plan_number: z.number().int().min(1).max(72),
  content: z.string().min(10, 'Отчет должен содержать минимум 10 символов').max(2000, 'Отчет не может превышать 2000 символов'),
  likes: z.number().int().min(0).default(0),
  comments: z.number().int().min(0).default(0),
  created_at: z.union([z.date(), z.string()]).nullable().optional(),
  updated_at: z.union([z.date(), z.string()]).nullable().optional()
});

export const NewReportSchema = z.object({
  user_id: z.string().min(1, 'User ID обязателен'),
  plan_number: z.number().int().min(1).max(72),
  content: z.string().min(10, 'Отчет должен содержать минимум 10 символов').max(2000, 'Отчет не может превышать 2000 символов'),
  likes: z.number().int().min(0).default(0),
  comments: z.number().int().min(0).default(0)
});

// 💬 Chat History Schemas
export const ChatHistorySchema = z.object({
  id: z.number().int().positive(),
  user_id: z.string().min(1, 'User ID обязателен'),
  plan_number: z.number().int().min(1).max(72),
  user_message: z.string().min(1, 'Сообщение пользователя не может быть пустым').max(1000),
  ai_response: z.string().min(1, 'Ответ AI не может быть пустым').max(2000),
  report_id: z.number().int().positive().nullable().optional(),
  message_type: z.enum(['report', 'question', 'general']).default('report'),
  created_at: z.union([z.date(), z.string()]).nullable().optional()
});

export const NewChatHistorySchema = z.object({
  user_id: z.string().min(1, 'User ID обязателен'),
  plan_number: z.number().int().min(1).max(72),
  user_message: z.string().min(1, 'Сообщение пользователя не может быть пустым').max(1000),
  ai_response: z.string().min(1, 'Ответ AI не может быть пустым').max(2000),
  report_id: z.number().int().positive().nullable().optional(),
  message_type: z.enum(['report', 'question', 'general']).default('report')
});

// ===============================
// 🔄 TYPE INFERENCE
// ===============================

export type Player = z.infer<typeof PlayerSchema>;
export type NewPlayer = z.infer<typeof NewPlayerSchema>;
export type PlayerUpdate = z.infer<typeof PlayerUpdateSchema>;

export type Report = z.infer<typeof ReportSchema>;
export type NewReport = z.infer<typeof NewReportSchema>;

export type ChatHistory = z.infer<typeof ChatHistorySchema>;
export type NewChatHistory = z.infer<typeof NewChatHistorySchema>;

// ===============================
// 🛡️ VALIDATION HELPERS
// ===============================

export const validatePlayer = (data: unknown) => PlayerSchema.parse(data);
export const validateNewPlayer = (data: unknown) => NewPlayerSchema.parse(data);
export const validatePlayerUpdate = (data: unknown) => PlayerUpdateSchema.parse(data);

export const validateReport = (data: unknown) => ReportSchema.parse(data);
export const validateNewReport = (data: unknown) => NewReportSchema.parse(data);

export const validateChatHistory = (data: unknown) => ChatHistorySchema.parse(data);
export const validateNewChatHistory = (data: unknown) => NewChatHistorySchema.parse(data); 
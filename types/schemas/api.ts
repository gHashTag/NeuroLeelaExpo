import { z } from 'zod';
import { PlayerSchema, ReportSchema, ChatHistorySchema } from './database';
import { GameMoveResultSchema, PositionSchema, DiceRollSchema } from './game';

// ===============================
// 🌐 API REQUEST SCHEMAS (ZOD)
// ===============================

// 🎲 API Dice Roll Request Schema
export const ApiDiceRollRequestSchema = z.object({
  userId: z.string().min(1, 'User ID обязателен'),
  roll: DiceRollSchema.optional() // для тестирования можно передать конкретное значение
});

// 📋 API Report Submit Request Schema
export const ApiReportSubmitRequestSchema = z.object({
  userId: z.string().min(1, 'User ID обязателен'),
  planNumber: PositionSchema,
  content: z.string().min(3, 'Отчет должен содержать минимум 3 символа').max(2000, 'Отчет не может превышать 2000 символов')
});

// 👤 API Player Init Request Schema
export const ApiPlayerInitRequestSchema = z.object({
  userId: z.string().min(1, 'User ID обязателен'),
  email: z.string().email('Некорректный email').optional(),
  fullName: z.string().max(100).optional(),
  intention: z.string().max(500).optional()
});

// 🎮 API Player Update Request Schema
export const ApiPlayerUpdateRequestSchema = z.object({
  userId: z.string().min(1, 'User ID обязателен'),
  updates: z.object({
    fullName: z.string().max(100).optional(),
    intention: z.string().max(500).optional(),
    avatar: z.string().url().optional()
  })
});

// 💬 API Chat Message Request Schema
export const ApiChatMessageRequestSchema = z.object({
  userId: z.string().min(1, 'User ID обязателен'),
  planNumber: PositionSchema,
  message: z.string().min(1, 'Сообщение не может быть пустым').max(1000),
  messageType: z.enum(['report', 'question', 'general']).default('general'),
  reportId: z.number().int().positive().optional()
});

// ===============================
// 🌐 API RESPONSE SCHEMAS (ZOD)
// ===============================

// ✅ Success Response Schema (generic)
export const ApiSuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  timestamp: z.number(),
  data: z.any().optional()
});

// ❌ Error Response Schema
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional(),
  timestamp: z.number(),
  userId: z.string().optional()
});

// 🎲 Dice Roll API Response Schema
export const ApiDiceRollResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  timestamp: z.number(),
  data: z.object({
    userId: z.string(),
    roll: DiceRollSchema,
    gameResult: GameMoveResultSchema,
    playerState: PlayerSchema,
    eventId: z.string().optional()
  })
});

// 📋 Report Submit API Response Schema
export const ApiReportSubmitResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  timestamp: z.number(),
  data: z.object({
    userId: z.string(),
    reportId: z.number().int().positive(),
    planNumber: PositionSchema,
    diceUnlocked: z.boolean(),
    playerState: PlayerSchema,
    eventId: z.string().optional()
  })
});

// 👤 Player Init API Response Schema
export const ApiPlayerInitResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  timestamp: z.number(),
  data: z.object({
    userId: z.string(),
    player: PlayerSchema,
    isNewPlayer: z.boolean(),
    eventId: z.string().optional()
  })
});

// 🎮 Player State API Response Schema
export const ApiPlayerStateResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  timestamp: z.number(),
  data: z.object({
    userId: z.string(),
    player: PlayerSchema,
    reports: z.array(ReportSchema).optional(),
    chatHistory: z.array(ChatHistorySchema).optional()
  })
});

// 📊 Player Stats API Response Schema
export const ApiPlayerStatsResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  timestamp: z.number(),
  data: z.object({
    userId: z.string(),
    totalGamesPlayed: z.number().int().min(0),
    totalReports: z.number().int().min(0),
    currentStreak: z.number().int().min(0),
    averagePosition: z.number().min(0).max(72),
    completedGames: z.number().int().min(0),
    favoritePositions: z.array(PositionSchema),
    timeSpentPlaying: z.number().min(0), // в минутах
    lastActiveDate: z.date().optional()
  })
});

// 🏆 Leaderboard API Response Schema
export const ApiLeaderboardResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  timestamp: z.number(),
  data: z.object({
    players: z.array(z.object({
      userId: z.string(),
      fullName: z.string().nullable(),
      avatar: z.string().nullable(),
      score: z.number().int(),
      rank: z.number().int().positive(),
      gamesCompleted: z.number().int().min(0),
      averagePosition: z.number().min(0).max(72)
    })),
    totalPlayers: z.number().int().min(0),
    lastUpdated: z.date()
  })
});

// ===============================
// 🔍 QUERY SCHEMAS
// ===============================

// 📄 Pagination Schema
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// 🔍 Player Search Query Schema
export const PlayerSearchQuerySchema = z.object({
  userId: z.string().optional(),
  fullName: z.string().optional(),
  minPlan: PositionSchema.optional(),
  maxPlan: PositionSchema.optional(),
  isFinished: z.boolean().optional(),
  needsReport: z.boolean().optional(),
  ...PaginationSchema.shape
});

// 📋 Report Search Query Schema
export const ReportSearchQuerySchema = z.object({
  userId: z.string().optional(),
  planNumber: PositionSchema.optional(),
  minLikes: z.number().int().min(0).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  ...PaginationSchema.shape
});

// ===============================
// 🔒 AUTHENTICATION SCHEMAS
// ===============================

// 🔑 Auth Token Schema
export const AuthTokenSchema = z.object({
  token: z.string().min(1),
  expiresIn: z.number().int().positive(),
  tokenType: z.literal('Bearer'),
  userId: z.string()
});

// 👤 Auth User Schema
export const AuthUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  fullName: z.string().optional(),
  avatar: z.string().url().optional(),
  createdAt: z.date(),
  lastLoginAt: z.date().optional()
});

// 🔐 Login Request Schema
export const LoginRequestSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов')
});

// 📝 Register Request Schema
export const RegisterRequestSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  fullName: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(100),
  intention: z.string().max(500).optional()
});

// ===============================
// 🔄 TYPE INFERENCE
// ===============================

export type ApiDiceRollRequest = z.infer<typeof ApiDiceRollRequestSchema>;
export type ApiReportSubmitRequest = z.infer<typeof ApiReportSubmitRequestSchema>;
export type ApiPlayerInitRequest = z.infer<typeof ApiPlayerInitRequestSchema>;
export type ApiPlayerUpdateRequest = z.infer<typeof ApiPlayerUpdateRequestSchema>;
export type ApiChatMessageRequest = z.infer<typeof ApiChatMessageRequestSchema>;

export type ApiSuccessResponse = z.infer<typeof ApiSuccessResponseSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
export type ApiDiceRollResponse = z.infer<typeof ApiDiceRollResponseSchema>;
export type ApiReportSubmitResponse = z.infer<typeof ApiReportSubmitResponseSchema>;
export type ApiPlayerInitResponse = z.infer<typeof ApiPlayerInitResponseSchema>;
export type ApiPlayerStateResponse = z.infer<typeof ApiPlayerStateResponseSchema>;
export type ApiPlayerStatsResponse = z.infer<typeof ApiPlayerStatsResponseSchema>;
export type ApiLeaderboardResponse = z.infer<typeof ApiLeaderboardResponseSchema>;

export type Pagination = z.infer<typeof PaginationSchema>;
export type PlayerSearchQuery = z.infer<typeof PlayerSearchQuerySchema>;
export type ReportSearchQuery = z.infer<typeof ReportSearchQuerySchema>;

export type AuthToken = z.infer<typeof AuthTokenSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

// ===============================
// 🛡️ VALIDATION HELPERS
// ===============================

export const validateApiDiceRollRequest = (data: unknown) => ApiDiceRollRequestSchema.parse(data);
export const validateApiReportSubmitRequest = (data: unknown) => ApiReportSubmitRequestSchema.parse(data);
export const validateApiPlayerInitRequest = (data: unknown) => ApiPlayerInitRequestSchema.parse(data);
export const validateApiPlayerUpdateRequest = (data: unknown) => ApiPlayerUpdateRequestSchema.parse(data);
export const validateApiChatMessageRequest = (data: unknown) => ApiChatMessageRequestSchema.parse(data);

export const validatePagination = (query: unknown) => PaginationSchema.parse(query);
export const validatePlayerSearchQuery = (query: unknown) => PlayerSearchQuerySchema.parse(query);
export const validateReportSearchQuery = (query: unknown) => ReportSearchQuerySchema.parse(query);

export const validateLoginRequest = (data: unknown) => LoginRequestSchema.parse(data);
export const validateRegisterRequest = (data: unknown) => RegisterRequestSchema.parse(data);

// ===============================
// 🎯 SAFE PARSERS
// ===============================

export const safeParseApiDiceRollRequest = (data: unknown) => ApiDiceRollRequestSchema.safeParse(data);
export const safeParseApiReportSubmitRequest = (data: unknown) => ApiReportSubmitRequestSchema.safeParse(data);
export const safeParseApiPlayerInitRequest = (data: unknown) => ApiPlayerInitRequestSchema.safeParse(data);
export const safeParsePagination = (query: unknown) => PaginationSchema.safeParse(query);
export const safeParseLoginRequest = (data: unknown) => LoginRequestSchema.safeParse(data); 
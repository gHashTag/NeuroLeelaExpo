import { z } from 'zod';
import { DiceRollSchema, PositionSchema, GameStepSchema, GameMoveResultSchema } from './game';
import { PlayerSchema, PlayerUpdateSchema } from './database';

// ===============================
// 🎯 INNGEST EVENT SCHEMAS (ZOD)
// ===============================

// 🎲 Dice Roll Event Data Schema
export const DiceRollEventDataSchema = z.object({
  userId: z.string().min(1, 'User ID обязателен'),
  roll: DiceRollSchema
});

// 📋 Report Submit Event Data Schema
export const ReportSubmitEventDataSchema = z.object({
  userId: z.string().min(1, 'User ID обязателен'),
  report: z.string().min(3, 'Отчет должен содержать минимум 3 символа').max(2000, 'Отчет не может превышать 2000 символов'),
  planNumber: PositionSchema
});

// 🎮 Player State Update Event Data Schema
export const PlayerStateUpdateEventDataSchema = z.object({
  userId: z.string().min(1, 'User ID обязателен'),
  updates: PlayerUpdateSchema,
  timestamp: z.number().optional()
});

// 👤 Player Init Event Data Schema
export const PlayerInitEventDataSchema = z.object({
  userId: z.string().min(1, 'User ID обязателен'),
  email: z.string().email('Некорректный email').optional()
});

// ===============================
// 🎯 INNGEST EVENT SCHEMAS
// ===============================

// 🎲 Game Dice Roll Event
export const GameDiceRollEventSchema = z.object({
  name: z.literal('game.dice.roll'),
  data: DiceRollEventDataSchema,
  user: z.record(z.any()).optional(),
  id: z.string().optional(),
  timestamp: z.number().optional(),
  version: z.string().optional()
});

// 📋 Game Report Submit Event
export const GameReportSubmitEventSchema = z.object({
  name: z.literal('game.report.submit'),
  data: ReportSubmitEventDataSchema,
  user: z.record(z.any()).optional(),
  id: z.string().optional(),
  timestamp: z.number().optional(),
  version: z.string().optional()
});

// 🎮 Game Player State Update Event
export const GamePlayerStateUpdateEventSchema = z.object({
  name: z.literal('game.player.state.update'),
  data: PlayerStateUpdateEventDataSchema,
  user: z.record(z.any()).optional(),
  id: z.string().optional(),
  timestamp: z.number().optional(),
  version: z.string().optional()
});

// 👤 Game Player Init Event
export const GamePlayerInitEventSchema = z.object({
  name: z.literal('game.player.init'),
  data: PlayerInitEventDataSchema,
  user: z.record(z.any()).optional(),
  id: z.string().optional(),
  timestamp: z.number().optional(),
  version: z.string().optional()
});

// 🎯 Union of all game events
export const GameEventSchema = z.union([
  GameDiceRollEventSchema,
  GameReportSubmitEventSchema,
  GamePlayerStateUpdateEventSchema,
  GamePlayerInitEventSchema
]);

// ===============================
// 🔄 INNGEST FUNCTION RESPONSE SCHEMAS
// ===============================

// 🎲 Dice Roll Function Response Schema
export const DiceRollFunctionResponseSchema = z.object({
  success: z.boolean(),
  userId: z.string(),
  roll: DiceRollSchema,
  gameResult: GameMoveResultSchema,
  message: z.string()
});

// 📋 Report Function Response Schema
export const ReportFunctionResponseSchema = z.object({
  success: z.boolean(),
  userId: z.string(),
  planNumber: PositionSchema,
  reportSaved: z.boolean(),
  diceUnlocked: z.boolean(),
  message: z.string()
});

// 🎮 Player State Update Function Response Schema
export const PlayerStateUpdateFunctionResponseSchema = z.object({
  success: z.boolean(),
  userId: z.string(),
  updatesApplied: PlayerUpdateSchema,
  message: z.string()
});

// 👤 Player Init Function Response Schema
export const PlayerInitFunctionResponseSchema = z.object({
  success: z.boolean(),
  userId: z.string(),
  playerCreated: z.boolean(),
  existingPlayer: z.boolean().optional(),
  newPlayer: PlayerSchema.optional(),
  message: z.string()
});

// ===============================
// 🎯 INNGEST STEP SCHEMAS
// ===============================

// 🔧 Step Run Schema (generic)
export const StepRunSchema = z.object({
  stepId: z.string(),
  result: z.any(),
  error: z.string().optional()
});

// 📤 Step Send Event Schema
export const StepSendEventSchema = z.object({
  stepId: z.string(),
  event: GameEventSchema,
  success: z.boolean(),
  error: z.string().optional()
});

// ===============================
// 🎯 ERROR SCHEMAS
// ===============================

// ❌ Inngest Function Error Schema
export const InngestFunctionErrorSchema = z.object({
  name: z.string(),
  message: z.string(),
  stack: z.string().optional(),
  code: z.string().optional(),
  step: z.string().optional(),
  retryable: z.boolean().optional()
});

// ⚠️ Validation Error Schema
export const ValidationErrorSchema = z.object({
  field: z.string(),
  message: z.string(),
  value: z.any().optional(),
  code: z.string().optional()
});

// 🚨 Comprehensive Error Response Schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.record(z.any()).optional(),
  validationErrors: z.array(ValidationErrorSchema).optional(),
  timestamp: z.number(),
  userId: z.string().optional()
});

// ===============================
// 🔄 TYPE INFERENCE
// ===============================

export type DiceRollEventData = z.infer<typeof DiceRollEventDataSchema>;
export type ReportSubmitEventData = z.infer<typeof ReportSubmitEventDataSchema>;
export type PlayerStateUpdateEventData = z.infer<typeof PlayerStateUpdateEventDataSchema>;
export type PlayerInitEventData = z.infer<typeof PlayerInitEventDataSchema>;

export type GameDiceRollEvent = z.infer<typeof GameDiceRollEventSchema>;
export type GameReportSubmitEvent = z.infer<typeof GameReportSubmitEventSchema>;
export type GamePlayerStateUpdateEvent = z.infer<typeof GamePlayerStateUpdateEventSchema>;
export type GamePlayerInitEvent = z.infer<typeof GamePlayerInitEventSchema>;
export type GameEvent = z.infer<typeof GameEventSchema>;

export type DiceRollFunctionResponse = z.infer<typeof DiceRollFunctionResponseSchema>;
export type ReportFunctionResponse = z.infer<typeof ReportFunctionResponseSchema>;
export type PlayerStateUpdateFunctionResponse = z.infer<typeof PlayerStateUpdateFunctionResponseSchema>;
export type PlayerInitFunctionResponse = z.infer<typeof PlayerInitFunctionResponseSchema>;

export type StepRun = z.infer<typeof StepRunSchema>;
export type StepSendEvent = z.infer<typeof StepSendEventSchema>;

export type InngestFunctionError = z.infer<typeof InngestFunctionErrorSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// ===============================
// 🛡️ VALIDATION HELPERS
// ===============================

export const validateDiceRollEvent = (event: unknown) => GameDiceRollEventSchema.parse(event);
export const validateReportSubmitEvent = (event: unknown) => GameReportSubmitEventSchema.parse(event);
export const validatePlayerStateUpdateEvent = (event: unknown) => GamePlayerStateUpdateEventSchema.parse(event);
export const validatePlayerInitEvent = (event: unknown) => GamePlayerInitEventSchema.parse(event);
export const validateGameEvent = (event: unknown) => GameEventSchema.parse(event);

export const validateDiceRollEventData = (data: unknown) => DiceRollEventDataSchema.parse(data);
export const validateReportSubmitEventData = (data: unknown) => ReportSubmitEventDataSchema.parse(data);
export const validatePlayerStateUpdateEventData = (data: unknown) => PlayerStateUpdateEventDataSchema.parse(data);
export const validatePlayerInitEventData = (data: unknown) => PlayerInitEventDataSchema.parse(data);

export const validateDiceRollResponse = (response: unknown) => DiceRollFunctionResponseSchema.parse(response);
export const validateReportResponse = (response: unknown) => ReportFunctionResponseSchema.parse(response);
export const validatePlayerStateUpdateResponse = (response: unknown) => PlayerStateUpdateFunctionResponseSchema.parse(response);
export const validatePlayerInitResponse = (response: unknown) => PlayerInitFunctionResponseSchema.parse(response);

// ===============================
// 🎯 SAFE PARSERS (не бросают ошибки)
// ===============================

export const safeParseDiceRollEvent = (event: unknown) => GameDiceRollEventSchema.safeParse(event);
export const safeParseReportSubmitEvent = (event: unknown) => GameReportSubmitEventSchema.safeParse(event);
export const safeParsePlayerStateUpdateEvent = (event: unknown) => GamePlayerStateUpdateEventSchema.safeParse(event);
export const safeParsePlayerInitEvent = (event: unknown) => GamePlayerInitEventSchema.safeParse(event);
export const safeParseGameEvent = (event: unknown) => GameEventSchema.safeParse(event);

// ===============================
// 🔧 UTILITY SCHEMAS
// ===============================

// 📊 HTTP Status Code Schema
export const HTTPStatusCodeSchema = z.number().int().min(100).max(599);

// 🎯 Inngest Function ID Schema
export const InngestFunctionIdSchema = z.enum([
  'process-dice-roll',
  'process-report',
  'update-player-state',
  'initialize-player'
]);

// 🎮 Inngest Function Name Schema
export const InngestFunctionNameSchema = z.enum([
  'Обработка броска кубика',
  'Обработка отчета',
  'Обновление состояния игрока',
  'Инициализация игрока'
]);

export type HTTPStatusCode = z.infer<typeof HTTPStatusCodeSchema>;
export type InngestFunctionId = z.infer<typeof InngestFunctionIdSchema>;
export type InngestFunctionName = z.infer<typeof InngestFunctionNameSchema>; 
import { z } from 'zod';

// ===============================
// 🎲 GAME LOGIC SCHEMAS (ZOD)
// ===============================

// 🎯 Game Constants Schema
export const GameConstantsSchema = z.object({
  TOTAL_PLANS: z.literal(72),
  WIN_LOKA: z.literal(68),
  MAX_ROLL: z.literal(6),
  START_LOKA: z.literal(6)
});

// 🎲 Dice Roll Schema
export const DiceRollSchema = z.number().int().min(1).max(6);

// 📍 Position Schema (план/лока)
export const PositionSchema = z.number().int().min(0).max(72);

// 🏹 Direction Schema
export const DirectionSchema = z.enum([
  'stop 🛑',
  'arrow 🏹', 
  'snake 🐍',
  'win 🕉',
  'step 🚶🏼'
]);

// 🎮 Game Step Schema
export const GameStepSchema = z.object({
  loka: PositionSchema,
  previous_loka: PositionSchema,
  direction: z.string(),
  consecutive_sixes: z.number().int().min(0).max(3),
  position_before_three_sixes: PositionSchema,
  is_finished: z.boolean()
});

// 📖 Plan Schema
export const PlanSchema = z.object({
  short_desc: z.string(),
  image: z.string(),
  name: z.string()
});

// 🎯 Game Context Schema
export const GameContextSchema = z.object({
  currentPlan: PositionSchema,
  previousPlan: PositionSchema,
  roll: DiceRollSchema,
  direction: z.string(),
  isFinished: z.boolean(),
  consecutiveSixes: z.number().int().min(0).max(3)
});

// 🏹 Arrow Positions Schema
export const ArrowPositionsSchema = z.record(
  z.string().transform(Number),
  PositionSchema
).refine(
  (data) => Object.keys(data).every(key => Number(key) >= 1 && Number(key) <= 72),
  'Все ключи должны быть валидными позициями (1-72)'
);

// 🐍 Snake Positions Schema  
export const SnakePositionsSchema = z.record(
  z.string().transform(Number),
  PositionSchema
).refine(
  (data) => Object.keys(data).every(key => Number(key) >= 1 && Number(key) <= 72),
  'Все ключи должны быть валидными позициями (1-72)'
);

// 🎲 Consecutive Sixes Result Schema
export const ConsecutiveSixesResultSchema = z.object({
  newConsecutive: z.number().int().min(0).max(3),
  newPosition: PositionSchema,
  newBeforeThreeSixes: PositionSchema,
  direction: DirectionSchema.optional()
});

// 🎯 Direction And Position Result Schema
export const DirectionAndPositionResultSchema = z.object({
  finalLoka: PositionSchema,
  direction: DirectionSchema,
  isGameFinished: z.boolean()
});

// 🎮 Game Move Result Schema
export const GameMoveResultSchema = z.object({
  gameStep: GameStepSchema,
  plan: PlanSchema,
  direction: z.string(),
  message: z.string()
});

// 🎮 Game State Schema (для базы данных)
export const GameStateSchema = z.object({
  id: z.string(),
  plan: PositionSchema,
  previous_plan: PositionSchema.nullable(),
  message: z.string().nullable(),
  avatar: z.string().nullable(),
  fullName: z.string().nullable(),
  intention: z.string().nullable(),
  isStart: z.boolean().nullable(),
  isFinished: z.boolean().nullable(),
  consecutiveSixes: z.number().int().min(0).max(3).nullable(),
  positionBeforeThreeSixes: PositionSchema.nullable(),
  needsReport: z.boolean().nullable()
});

// 🌐 Language Code Schema
export const LanguageCodeSchema = z.enum(['en', 'ru']).default('en');

// 📝 Game Message Schema
export const GameMessageSchema = z.object({
  text: z.string().min(1, 'Сообщение не может быть пустым')
});

// 🎲 Player Game Session Schema (для валидации сессий)
export const PlayerGameSessionSchema = z.object({
  userId: z.string().min(1),
  sessionId: z.string().min(1),
  startedAt: z.date(),
  lastActivity: z.date(),
  isActive: z.boolean(),
  totalRolls: z.number().int().min(0),
  currentPosition: PositionSchema,
  startPosition: PositionSchema
});

// ===============================
// 🔄 TYPE INFERENCE
// ===============================

export type GameConstants = z.infer<typeof GameConstantsSchema>;
export type DiceRoll = z.infer<typeof DiceRollSchema>;
export type Position = z.infer<typeof PositionSchema>;
export type Direction = z.infer<typeof DirectionSchema>;
export type GameStep = z.infer<typeof GameStepSchema>;
export type Plan = z.infer<typeof PlanSchema>;
export type GameContext = z.infer<typeof GameContextSchema>;
export type ArrowPositions = z.infer<typeof ArrowPositionsSchema>;
export type SnakePositions = z.infer<typeof SnakePositionsSchema>;
export type ConsecutiveSixesResult = z.infer<typeof ConsecutiveSixesResultSchema>;
export type DirectionAndPositionResult = z.infer<typeof DirectionAndPositionResultSchema>;
export type GameMoveResult = z.infer<typeof GameMoveResultSchema>;
export type GameState = z.infer<typeof GameStateSchema>;
export type LanguageCode = z.infer<typeof LanguageCodeSchema>;
export type GameMessage = z.infer<typeof GameMessageSchema>;
export type PlayerGameSession = z.infer<typeof PlayerGameSessionSchema>;

// ===============================
// 🛡️ VALIDATION HELPERS
// ===============================

export const validateDiceRoll = (roll: unknown) => DiceRollSchema.parse(roll);
export const validatePosition = (position: unknown) => PositionSchema.parse(position);
export const validateDirection = (direction: unknown) => DirectionSchema.parse(direction);
export const validateGameStep = (step: unknown) => GameStepSchema.parse(step);
export const validateGameContext = (context: unknown) => GameContextSchema.parse(context);
export const validateGameMoveResult = (result: unknown) => GameMoveResultSchema.parse(result);
export const validateGameState = (state: unknown) => GameStateSchema.parse(state);
export const validateLanguageCode = (lang: unknown) => LanguageCodeSchema.parse(lang);
export const validateGameMessage = (message: unknown) => GameMessageSchema.parse(message);

// ===============================
// 🎯 GAME RULE VALIDATORS
// ===============================

// Валидатор для проверки валидного хода
export const validateGameMove = z.object({
  currentPosition: PositionSchema,
  roll: DiceRollSchema,
  consecutiveSixes: z.number().int().min(0).max(3),
  isFinished: z.boolean()
}).refine(
  (data) => {
    // Правило: если игра закончена, нужна 6 для начала
    if (data.isFinished && data.currentPosition === 68) {
      return data.roll === 6 || data.currentPosition === 68;
    }
    return true;
  },
  'Для начала игры нужно бросить 6'
);

// Валидатор для проверки корректности позиций стрел и змей
export const validateSpecialPositions = z.object({
  arrows: ArrowPositionsSchema,
  snakes: SnakePositionsSchema
}).refine(
  (data) => {
    // Проверяем, что позиции стрел и змей не пересекаются
    const arrowKeys = Object.keys(data.arrows).map(Number);
    const snakeKeys = Object.keys(data.snakes).map(Number);
    const intersection = arrowKeys.filter(key => snakeKeys.includes(key));
    return intersection.length === 0;
  },
  'Позиции стрел и змей не должны пересекаться'
);

export type GameMove = z.infer<typeof validateGameMove>;
export type SpecialPositions = z.infer<typeof validateSpecialPositions>; 
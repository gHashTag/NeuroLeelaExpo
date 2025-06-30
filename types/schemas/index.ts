// ===============================
// 🕉️ NEUROLEELA ZOD SCHEMAS
// ===============================
// Comprehensive type-safe schemas for the entire NeuroLeela project
// Covers: Database, Game Logic, Inngest Events, API, Authentication
// ===============================

// 🗃️ Database Schemas
export * from './database';

// 🎲 Game Logic Schemas  
export * from './game';

// 🎯 Inngest Event Schemas
export * from './inngest';

// 🌐 API Schemas
export * from './api';

// 📊 Observability Schemas
export * from './observability';

// 🎯 State Machine Schemas
export * from './state-machine';

// 🛡️ Error Handling & Security Schemas
export * from './errors-security';

// ⚙️ Runtime Configuration Schemas
export * from './runtime-config';

// ===============================
// 🎯 UNIVERSAL HELPERS
// ===============================

import { z } from 'zod';

// 🔄 Generic Result Schema (для функциональных результатов)
export const ResultSchema = <T extends z.ZodType>(schema: T) => 
  z.union([
    z.object({
      success: z.literal(true),
      data: schema,
      error: z.undefined().optional()
    }),
    z.object({
      success: z.literal(false),
      data: z.undefined().optional(),
      error: z.string()
    })
  ]);

// 📦 Wrapped Response Schema (для API ответов)
export const WrappedResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string(),
    timestamp: z.number(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    code: z.string().optional()
  });

// 🎯 Environment Variable Schema
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  EXPO_PUBLIC_DATABASE_URL: z.string().url('Database URL должен быть валидным URL'),
  PORT: z.string().transform(Number).pipe(z.number().int().min(1000).max(65535)).default('3001'),
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info')
});

// 🔧 Config Schema
export const ConfigSchema = z.object({
  app: z.object({
    name: z.string().default('NeuroLeela'),
    version: z.string().default('1.0.0'),
    environment: z.enum(['development', 'production', 'test']).default('development')
  }),
  database: z.object({
    url: z.string().url(),
    ssl: z.boolean().default(true),
    maxConnections: z.number().int().min(1).max(100).default(10)
  }),
  inngest: z.object({
    url: z.string().url().default('http://localhost:8288'),
    eventKey: z.string().optional(),
    signingKey: z.string().optional(),
    retryAttempts: z.number().int().min(0).max(10).default(3)
  }),
  game: z.object({
    maxPlans: z.number().int().min(1).max(100).default(72),
    winPosition: z.number().int().min(1).max(100).default(68),
    startPosition: z.number().int().min(1).max(100).default(6),
    maxDiceValue: z.number().int().min(1).max(20).default(6)
  })
});

// ===============================
// 🔄 TYPE INFERENCE FOR UNIVERSAL SCHEMAS
// ===============================

export type Result<T> = z.infer<ReturnType<typeof ResultSchema<z.ZodType<T>>>>;
export type WrappedResponse<T> = z.infer<ReturnType<typeof WrappedResponseSchema<z.ZodType<T>>>>;
export type Env = z.infer<typeof EnvSchema>;
export type Config = z.infer<typeof ConfigSchema>;

// ===============================
// 🛡️ UNIVERSAL VALIDATION HELPERS
// ===============================

export const validateEnv = (env: Record<string, string | undefined>) => EnvSchema.parse(env);
export const validateConfig = (config: unknown) => ConfigSchema.parse(config);

export const createResultSuccess = <T>(data: T): Result<T> => ({
  success: true,
  data,
  error: undefined
});

export const createResultError = <T>(error: string): Result<T> => ({
  success: false,
  data: undefined,
  error
});

export const createWrappedSuccess = <T>(data: T, message = 'Success'): WrappedResponse<T> => ({
  success: true,
  message,
  timestamp: Date.now(),
  data,
  error: undefined,
  code: undefined
});

export const createWrappedError = <T>(error: string, code?: string): WrappedResponse<T> => ({
  success: false,
  message: 'Error occurred',
  timestamp: Date.now(),
  data: undefined,
  error,
  code
});

// ===============================
// 🎯 BATCH VALIDATION HELPERS
// ===============================

// Валидация массива данных с детализированными ошибками
export const validateBatch = <T>(
  schema: z.ZodType<T>,
  items: unknown[],
  stopOnFirstError = false
): {
  valid: T[];
  errors: Array<{ index: number; error: string; item: unknown }>;
  success: boolean;
} => {
  const valid: T[] = [];
  const errors: Array<{ index: number; error: string; item: unknown }> = [];

  for (let i = 0; i < items.length; i++) {
    const result = schema.safeParse(items[i]);
    
    if (result.success) {
      valid.push(result.data);
    } else {
      errors.push({
        index: i,
        error: result.error.message,
        item: items[i]
      });
      
      if (stopOnFirstError) {
        break;
      }
    }
  }

  return {
    valid,
    errors,
    success: errors.length === 0
  };
};

// Создание композитного валидатора
export const createCompositeValidator = <T extends Record<string, z.ZodType>>(
  schemas: T
) => {
  return (data: Record<string, unknown>): {
    [K in keyof T]: z.infer<T[K]> | undefined;
  } & { errors: Record<string, string> } => {
    const result = {} as any;
    const errors: Record<string, string> = {};

    for (const [key, schema] of Object.entries(schemas)) {
      const parseResult = schema.safeParse(data[key]);
      
      if (parseResult.success) {
        result[key] = parseResult.data;
      } else {
        errors[key] = parseResult.error.message;
      }
    }

    result.errors = errors;
    return result;
  };
};

// ===============================
// 🎯 RUNTIME SCHEMA VALIDATION
// ===============================

// Middleware для валидации в runtime
export const createZodMiddleware = <T>(schema: z.ZodType<T>) => {
  return (data: unknown): { isValid: boolean; data?: T; error?: string } => {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { isValid: true, data: result.data };
    } else {
      return { 
        isValid: false, 
        error: `Validation failed: ${result.error.message}` 
      };
    }
  };
};

// Декоратор для автоматической валидации параметров функций
export const withValidation = <TInput, TOutput>(
  inputSchema: z.ZodType<TInput>,
  outputSchema?: z.ZodType<TOutput>
) => {
  return <TArgs extends unknown[]>(
    fn: (validatedInput: TInput, ...args: TArgs) => TOutput
  ) => {
    return (input: unknown, ...args: TArgs): TOutput => {
      const validatedInput = inputSchema.parse(input);
      const result = fn(validatedInput, ...args);
      
      if (outputSchema) {
        return outputSchema.parse(result);
      }
      
      return result;
    };
  };
};

// ===============================
// 🚀 EXPORT SUMMARY
// ===============================

/**
 * 📚 NEUROLEELA ZOD SCHEMAS SUMMARY:
 * 
 * 🗃️ DATABASE (types/schemas/database.ts):
 * - PlayerSchema, NewPlayerSchema, PlayerUpdateSchema
 * - ReportSchema, NewReportSchema  
 * - ChatHistorySchema, NewChatHistorySchema
 * 
 * 🎲 GAME LOGIC (types/schemas/game.ts):
 * - GameStepSchema, GameContextSchema, GameMoveResultSchema
 * - DiceRollSchema, PositionSchema, DirectionSchema
 * - ArrowPositionsSchema, SnakePositionsSchema
 * 
 * 🎯 INNGEST EVENTS (types/schemas/inngest.ts):
 * - GameDiceRollEventSchema, GameReportSubmitEventSchema
 * - PlayerStateUpdateEventSchema, PlayerInitEventSchema
 * - Function response schemas for all 4 Inngest functions
 * 
 * 🌐 API (types/schemas/api.ts):
 * - Request/Response schemas for all API endpoints
 * - Authentication schemas (Login, Register, AuthToken)
 * - Search and pagination schemas
 * 
 * 🔧 UNIVERSAL UTILITIES:
 * - ResultSchema, WrappedResponseSchema
 * - EnvSchema, ConfigSchema
 * - Batch validation, composite validators, middleware
 * 
 * Total: 100+ comprehensive Zod schemas covering the entire NeuroLeela codebase! 🕉️
 */ 
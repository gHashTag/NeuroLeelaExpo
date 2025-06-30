import { z } from 'zod';

// ===============================
// 🛡️ ERROR HANDLING SCHEMAS (ZOD)
// ===============================

// 🚨 Error Severity Levels
export const ErrorSeveritySchema = z.enum([
  'trace',     // Мельчайшие детали для отладки
  'debug',     // Отладочная информация
  'info',      // Информационные сообщения
  'warn',      // Предупреждения
  'error',     // Ошибки, не критичные для работы
  'fatal',     // Критические ошибки, остановка работы
  'security'   // Проблемы безопасности
]);

// 🏷️ Error Categories
export const ErrorCategorySchema = z.enum([
  'validation',        // Ошибки валидации данных
  'authentication',    // Ошибки аутентификации
  'authorization',     // Ошибки авторизации
  'database',         // Ошибки базы данных
  'network',          // Сетевые ошибки
  'inngest',          // Ошибки Inngest
  'game_logic',       // Ошибки игровой логики
  'rate_limit',       // Превышение лимитов
  'timeout',          // Таймауты
  'dependency',       // Ошибки внешних зависимостей
  'business_rule',    // Нарушение бизнес-правил
  'system',           // Системные ошибки
  'unknown'           // Неизвестные ошибки
]);

// 📋 Structured Error Schema (without inner errors first)
const BaseStructuredErrorSchema = z.object({
  // Основная информация
  id: z.string(), // уникальный ID ошибки
  code: z.string(), // программный код ошибки (например, "VALIDATION_FAILED")
  message: z.string(), // человекочитаемое сообщение
  
  // Классификация
  severity: ErrorSeveritySchema,
  category: ErrorCategorySchema,
  
  // Контекст
  context: z.object({
    userId: z.string().optional(),
    sessionId: z.string().optional(),
    requestId: z.string().optional(),
    functionName: z.string().optional(),
    fileName: z.string().optional(),
    lineNumber: z.number().optional(),
    component: z.string().optional(),
    operation: z.string().optional(),
    timestamp: z.date(),
    environment: z.enum(['development', 'staging', 'production']).optional()
  }),
  
  // Техническая информация
  stack: z.string().optional(),
  cause: z.string().optional(), // что вызвало ошибку
  
  // Метаданные
  metadata: z.record(z.unknown()).optional(),
  
  // Пользовательская информация
  userMessage: z.string().optional(), // сообщение для показа пользователю
  userActions: z.array(z.string()).optional(), // что пользователь может сделать
  
  // Информация для восстановления
  isRetryable: z.boolean().default(false),
  retryAfter: z.number().optional(), // секунды
  maxRetries: z.number().optional(),
  
  // Мониторинг
  shouldAlert: z.boolean().default(false),
  shouldLog: z.boolean().default(true),
  tags: z.array(z.string()).optional()
});

// Now add recursive part
export const StructuredErrorSchema: z.ZodType<any> = BaseStructuredErrorSchema.extend({
  // Связанные ошибки
  innerErrors: z.array(z.lazy(() => StructuredErrorSchema)).optional()
});

// 🔄 Error Result Pattern
export const ErrorResultSchema = z.object({
  success: z.literal(false),
  error: StructuredErrorSchema,
  timestamp: z.date()
});

export const SuccessResultSchema = <T extends z.ZodType>(dataSchema: T): z.ZodObject<{
  success: z.ZodLiteral<true>;
  data: T;
  timestamp: z.ZodDate;
}> => z.object({
  success: z.literal(true),
  data: dataSchema,
  timestamp: z.date()
});

export const ResultSchema = <T extends z.ZodType>(dataSchema: T) => 
  z.discriminatedUnion('success', [
    SuccessResultSchema(dataSchema),
    ErrorResultSchema
  ]);

// ===============================
// 🔐 SECURITY SCHEMAS (ZOD)
// ===============================

// 🔑 Authentication Types
export const AuthMethodSchema = z.enum([
  'email_password',
  'oauth_google',
  'oauth_facebook',
  'oauth_apple',
  'anonymous',
  'magic_link',
  'phone_otp'
]);

// 👤 User Role Schema
export const UserRoleSchema = z.enum([
  'guest',          // Незарегистрированный пользователь
  'player',         // Обычный игрок
  'premium_player', // Премиум игрок
  'moderator',      // Модератор
  'admin',          // Администратор
  'super_admin'     // Супер-администратор
]);

// 🎫 Permission Schema
export const PermissionSchema = z.enum([
  // Game permissions
  'game:play',
  'game:reset',
  'game:view_stats',
  
  // Report permissions
  'report:submit',
  'report:view_own',
  'report:view_all',
  'report:moderate',
  
  // User permissions
  'user:view_profile',
  'user:edit_profile',
  'user:delete_account',
  
  // Admin permissions
  'admin:view_users',
  'admin:manage_users',
  'admin:view_analytics',
  'admin:manage_system',
  
  // System permissions
  'system:health_check',
  'system:logs_view',
  'system:metrics_view'
]);

// 🔐 Security Authentication Token Schema
export const SecurityAuthTokenSchema = z.object({
  token: z.string(),
  type: z.enum(['access', 'refresh', 'magic_link', 'otp']),
  expiresAt: z.date(),
  issuedAt: z.date(),
  userId: z.string(),
  sessionId: z.string(),
  permissions: z.array(PermissionSchema),
  metadata: z.record(z.unknown()).optional()
});

// 🔒 Security Context Schema
export const SecurityContextSchema = z.object({
  userId: z.string(),
  sessionId: z.string(),
  roles: z.array(UserRoleSchema),
  permissions: z.array(PermissionSchema),
  
  // Request context
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  deviceId: z.string().optional(),
  
  // Security flags
  isAuthenticated: z.boolean(),
  isTrustedDevice: z.boolean().default(false),
  requiresMFA: z.boolean().default(false),
  
  // Rate limiting
  rateLimitRemaining: z.number().optional(),
  rateLimitReset: z.date().optional(),
  
  // Audit trail
  lastActivity: z.date(),
  loginTime: z.date().optional(),
  authMethod: AuthMethodSchema.optional()
});

// 🚫 Rate Limiting Schema
export const RateLimitSchema = z.object({
  key: z.string(), // identifier for rate limiting (user ID, IP, etc.)
  limit: z.number(), // max requests allowed
  window: z.number(), // time window in seconds
  current: z.number(), // current request count
  remaining: z.number(), // remaining requests
  resetTime: z.date(), // when the window resets
  isBlocked: z.boolean()
});

// 🛡️ Security Event Schema
export const SecurityEventTypeSchema = z.enum([
  'login_success',
  'login_failed',
  'logout',
  'token_refresh',
  'permission_denied',
  'rate_limit_exceeded',
  'suspicious_activity',
  'data_breach_attempt',
  'privilege_escalation',
  'account_locked',
  'password_changed',
  'mfa_enabled',
  'mfa_disabled'
]);

export const SecurityEventSchema = z.object({
  id: z.string(),
  type: SecurityEventTypeSchema,
  severity: ErrorSeveritySchema,
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  
  // Context
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  location: z.object({
    country: z.string().optional(),
    region: z.string().optional(),
    city: z.string().optional()
  }).optional(),
  
  // Event details
  description: z.string(),
  metadata: z.record(z.unknown()).optional(),
  
  // Timing
  timestamp: z.date(),
  
  // Response
  actionTaken: z.string().optional(),
  isResolved: z.boolean().default(false),
  resolvedAt: z.date().optional()
});

// ===============================
// 🔄 TYPE INFERENCE
// ===============================

export type ErrorSeverity = z.infer<typeof ErrorSeveritySchema>;
export type ErrorCategory = z.infer<typeof ErrorCategorySchema>;
export type StructuredError = z.infer<typeof StructuredErrorSchema>;
export type ErrorResult = z.infer<typeof ErrorResultSchema>;
export type AuthMethod = z.infer<typeof AuthMethodSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type Permission = z.infer<typeof PermissionSchema>;
export type SecurityAuthToken = z.infer<typeof SecurityAuthTokenSchema>;
export type SecurityContext = z.infer<typeof SecurityContextSchema>;
export type RateLimit = z.infer<typeof RateLimitSchema>;
export type SecurityEvent = z.infer<typeof SecurityEventSchema>;

// Generic Result Types
export type Result<T> = z.infer<ReturnType<typeof ResultSchema<z.ZodType<T>>>>;
export type SuccessResult<T> = z.infer<ReturnType<typeof SuccessResultSchema<z.ZodType<T>>>>;

// ===============================
// 🛠️ ERROR BUILDERS
// ===============================

// Error Factory
export const createError = (
  code: string,
  message: string,
  category: ErrorCategory,
  severity: ErrorSeverity = 'error',
  context?: Partial<StructuredError['context']>,
  metadata?: Record<string, unknown>
): StructuredError => ({
  id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  code,
  message,
  severity,
  category,
  context: {
    timestamp: new Date(),
    ...context
  },
  metadata,
  isRetryable: false,
  shouldAlert: severity === 'fatal' || severity === 'security',
  shouldLog: true
});

// Specific Error Builders
export const createValidationError = (
  field: string,
  value: unknown,
  reason: string,
  context?: Partial<StructuredError['context']>
): StructuredError => createError(
  'VALIDATION_FAILED',
  `Validation failed for field "${field}": ${reason}`,
  'validation',
  'error',
  context,
  { field, value, reason }
);

export const createAuthenticationError = (
  reason: string,
  context?: Partial<StructuredError['context']>
): StructuredError => createError(
  'AUTHENTICATION_FAILED',
  `Authentication failed: ${reason}`,
  'authentication',
  'security',
  context,
  { reason }
);

export const createAuthorizationError = (
  requiredPermission: Permission,
  userPermissions: Permission[],
  context?: Partial<StructuredError['context']>
): StructuredError => createError(
  'AUTHORIZATION_FAILED',
  `Insufficient permissions. Required: ${requiredPermission}`,
  'authorization',
  'security',
  context,
  { requiredPermission, userPermissions }
);

export const createRateLimitError = (
  limit: number,
  window: number,
  resetTime: Date,
  context?: Partial<StructuredError['context']>
): StructuredError => createError(
  'RATE_LIMIT_EXCEEDED',
  `Rate limit exceeded: ${limit} requests per ${window} seconds`,
  'rate_limit',
  'warn',
  context,
  { limit, window, resetTime: resetTime.toISOString() }
);

// Result Builders
export const createSuccessResult = <T>(data: T): SuccessResult<T> => ({
  success: true,
  data,
  timestamp: new Date()
});

export const createErrorResult = (error: StructuredError): ErrorResult => ({
  success: false,
  error,
  timestamp: new Date()
});

// ===============================
// 🔐 SECURITY BUILDERS
// ===============================

// Security Context Builder
export const createSecurityContext = (
  userId: string,
  sessionId: string,
  roles: UserRole[],
  permissions: Permission[],
  options?: Partial<SecurityContext>
): SecurityContext => ({
  userId,
  sessionId,
  roles,
  permissions,
  isAuthenticated: true,
  isTrustedDevice: false,
  requiresMFA: false,
  lastActivity: new Date(),
  ...options
});

// Permission Checker
export const hasPermission = (
  context: SecurityContext,
  requiredPermission: Permission
): boolean => {
  return context.permissions.includes(requiredPermission);
};

export const hasAnyPermission = (
  context: SecurityContext,
  requiredPermissions: Permission[]
): boolean => {
  return requiredPermissions.some(permission => 
    context.permissions.includes(permission)
  );
};

export const hasAllPermissions = (
  context: SecurityContext,
  requiredPermissions: Permission[]
): boolean => {
  return requiredPermissions.every(permission => 
    context.permissions.includes(permission)
  );
};

// Security Event Builder
export const createSecurityEvent = (
  type: z.infer<typeof SecurityEventTypeSchema>,
  description: string,
  severity: ErrorSeverity = 'info',
  userId?: string,
  metadata?: Record<string, unknown>
): SecurityEvent => ({
  id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  severity,
  userId,
  description,
  metadata,
  timestamp: new Date(),
  isResolved: false
});

// ===============================
// 🛡️ VALIDATION HELPERS
// ===============================

export const validateStructuredError = (data: unknown) => StructuredErrorSchema.parse(data);
export const validateSecurityContext = (data: unknown) => SecurityContextSchema.parse(data);
export const validateSecurityAuthToken = (data: unknown) => SecurityAuthTokenSchema.parse(data);
export const validateSecurityEvent = (data: unknown) => SecurityEventSchema.parse(data);
export const validateRateLimit = (data: unknown) => RateLimitSchema.parse(data);

// Safe parsers
export const safeParseStructuredError = (data: unknown) => StructuredErrorSchema.safeParse(data);
export const safeParseSecurityContext = (data: unknown) => SecurityContextSchema.safeParse(data);

// ===============================
// 🎯 ADVANCED ERROR PATTERNS
// ===============================

// Error Aggregation Schema
export const ErrorAggregationSchema = z.object({
  errorCode: z.string(),
  count: z.number(),
  firstOccurrence: z.date(),
  lastOccurrence: z.date(),
  affectedUsers: z.array(z.string()),
  severity: ErrorSeveritySchema,
  category: ErrorCategorySchema,
  trend: z.enum(['increasing', 'decreasing', 'stable']),
  metadata: z.record(z.unknown()).optional()
});

// Circuit Breaker State Schema
export const CircuitBreakerStateSchema = z.enum(['closed', 'open', 'half_open']);

export const CircuitBreakerSchema = z.object({
  name: z.string(),
  state: CircuitBreakerStateSchema,
  failureCount: z.number(),
  successCount: z.number(),
  lastFailureTime: z.date().optional(),
  nextAttemptTime: z.date().optional(),
  failureThreshold: z.number(),
  recoveryTimeout: z.number(), // milliseconds
  isHealthy: z.boolean()
});

export type ErrorAggregation = z.infer<typeof ErrorAggregationSchema>;
export type CircuitBreaker = z.infer<typeof CircuitBreakerSchema>; 
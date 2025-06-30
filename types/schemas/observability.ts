import { z } from 'zod';

// ===============================
// 📊 OBSERVABILITY SCHEMAS (ZOD)
// ===============================

// 📝 Log Level Schema
export const LogLevelSchema = z.enum(['debug', 'info', 'warn', 'error', 'fatal']);

// 🏷️ Log Context Schema
export const LogContextSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  requestId: z.string().optional(),
  functionId: z.string().optional(),
  eventId: z.string().optional(),
  traceId: z.string().optional(),
  spanId: z.string().optional(),
  environment: z.enum(['development', 'staging', 'production']).optional()
});

// 📋 Structured Log Entry Schema
export const LogEntrySchema = z.object({
  timestamp: z.date(),
  level: LogLevelSchema,
  message: z.string(),
  context: LogContextSchema.optional(),
  metadata: z.record(z.unknown()).optional(),
  error: z.object({
    name: z.string(),
    message: z.string(),
    stack: z.string().optional(),
    code: z.string().optional()
  }).optional(),
  duration: z.number().optional(), // milliseconds
  component: z.enum([
    'inngest-function',
    'database',
    'api-endpoint',
    'game-engine',
    'auth-service',
    'external-api'
  ]).optional()
});

// 📈 Metrics Schema
export const MetricTypeSchema = z.enum(['counter', 'gauge', 'histogram', 'summary']);

export const MetricSchema = z.object({
  name: z.string(),
  type: MetricTypeSchema,
  value: z.number(),
  labels: z.record(z.string()).optional(),
  timestamp: z.date(),
  unit: z.string().optional()
});

// 🎯 Performance Metrics Schema
export const PerformanceMetricsSchema = z.object({
  // Function execution metrics
  functionDuration: z.number(), // ms
  stepDurations: z.record(z.number()).optional(), // step_name -> duration
  databaseQueryTime: z.number().optional(), // ms
  apiResponseTime: z.number().optional(), // ms
  
  // Resource usage
  memoryUsage: z.number().optional(), // MB
  cpuUsage: z.number().optional(), // percentage
  
  // Event processing
  eventProcessingTime: z.number().optional(), // ms
  queueWaitTime: z.number().optional(), // ms
  
  // Game specific
  gameLogicExecutionTime: z.number().optional(), // ms
  validationTime: z.number().optional(), // ms
  
  // Database specific
  connectionPoolSize: z.number().optional(),
  activeConnections: z.number().optional(),
  queryCount: z.number().optional()
});

// 🚨 Alert Schema
export const AlertSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const AlertSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: AlertSeveritySchema,
  component: z.string(),
  metric: z.string().optional(),
  threshold: z.number().optional(),
  currentValue: z.number().optional(),
  timestamp: z.date(),
  resolved: z.boolean().default(false),
  resolvedAt: z.date().optional(),
  tags: z.array(z.string()).optional()
});

// 🔄 Health Check Schema
export const HealthStatusSchema = z.enum(['healthy', 'degraded', 'unhealthy', 'unknown']);

export const HealthCheckSchema = z.object({
  service: z.string(),
  status: HealthStatusSchema,
  timestamp: z.date(),
  responseTime: z.number(), // ms
  details: z.record(z.unknown()).optional(),
  dependencies: z.array(z.object({
    name: z.string(),
    status: HealthStatusSchema,
    responseTime: z.number().optional()
  })).optional()
});

// 🔍 Trace Schema (для distributed tracing)
export const TraceSpanSchema = z.object({
  traceId: z.string(),
  spanId: z.string(),
  parentSpanId: z.string().optional(),
  operationName: z.string(),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().optional(), // ms
  tags: z.record(z.string()).optional(),
  logs: z.array(z.object({
    timestamp: z.date(),
    fields: z.record(z.unknown())
  })).optional(),
  status: z.enum(['ok', 'cancelled', 'unknown', 'invalid_argument', 'deadline_exceeded', 'not_found', 'already_exists', 'permission_denied', 'resource_exhausted', 'failed_precondition', 'aborted', 'out_of_range', 'unimplemented', 'internal', 'unavailable', 'data_loss', 'unauthenticated']).optional()
});

// 📊 Dashboard Widget Schema
export const DashboardWidgetTypeSchema = z.enum(['metric', 'chart', 'table', 'alert', 'status']);

export const DashboardWidgetSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: DashboardWidgetTypeSchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number()
  }),
  config: z.record(z.unknown()),
  refreshInterval: z.number().optional() // seconds
});

// 🎮 Game-Specific Observability
export const GameEventObservabilitySchema = z.object({
  eventType: z.enum(['dice.roll', 'report.submit', 'player.init', 'player.state.update']),
  userId: z.string(),
  gameState: z.object({
    currentPlan: z.number(),
    previousPlan: z.number().optional(),
    isFinished: z.boolean(),
    consecutiveSixes: z.number()
  }),
  performance: PerformanceMetricsSchema.optional(),
  errors: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional()
});

// ===============================
// 🔄 TYPE INFERENCE
// ===============================

export type LogLevel = z.infer<typeof LogLevelSchema>;
export type LogContext = z.infer<typeof LogContextSchema>;
export type LogEntry = z.infer<typeof LogEntrySchema>;
export type Metric = z.infer<typeof MetricSchema>;
export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;
export type Alert = z.infer<typeof AlertSchema>;
export type HealthCheck = z.infer<typeof HealthCheckSchema>;
export type TraceSpan = z.infer<typeof TraceSpanSchema>;
export type DashboardWidget = z.infer<typeof DashboardWidgetSchema>;
export type GameEventObservability = z.infer<typeof GameEventObservabilitySchema>;

// ===============================
// 🛡️ VALIDATION HELPERS
// ===============================

export const validateLogEntry = (data: unknown) => LogEntrySchema.parse(data);
export const validateMetric = (data: unknown) => MetricSchema.parse(data);
export const validatePerformanceMetrics = (data: unknown) => PerformanceMetricsSchema.parse(data);
export const validateAlert = (data: unknown) => AlertSchema.parse(data);
export const validateHealthCheck = (data: unknown) => HealthCheckSchema.parse(data);
export const validateTraceSpan = (data: unknown) => TraceSpanSchema.parse(data);
export const validateGameEventObservability = (data: unknown) => GameEventObservabilitySchema.parse(data);

// ===============================
// 🎯 OBSERVABILITY BUILDERS
// ===============================

// Structured Logger Factory
export const createLogEntry = (
  level: LogLevel,
  message: string,
  context?: LogContext,
  metadata?: Record<string, unknown>
): LogEntry => ({
  timestamp: new Date(),
  level,
  message,
  context,
  metadata
});

// Metric Builder
export const createMetric = (
  name: string,
  type: z.infer<typeof MetricTypeSchema>,
  value: number,
  labels?: Record<string, string>
): Metric => ({
  name,
  type,
  value,
  labels,
  timestamp: new Date()
});

// Performance Tracker
export const createPerformanceTracker = () => {
  const startTime = Date.now();
  const steps: Record<string, number> = {};
  
  return {
    markStep: (stepName: string) => {
      steps[stepName] = Date.now() - startTime;
    },
    finish: (): PerformanceMetrics => ({
      functionDuration: Date.now() - startTime,
      stepDurations: steps
    })
  };
};

// Alert Builder
export const createAlert = (
  title: string,
  description: string,
  severity: z.infer<typeof AlertSeveritySchema>,
  component: string
): Alert => ({
  id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  title,
  description,
  severity,
  component,
  timestamp: new Date(),
  resolved: false
});

// ===============================
// 🔍 ADVANCED OBSERVABILITY PATTERNS
// ===============================

// Event Correlation Schema
export const EventCorrelationSchema = z.object({
  correlationId: z.string(),
  causationId: z.string().optional(), // что вызвало это событие
  events: z.array(z.object({
    eventId: z.string(),
    eventType: z.string(),
    timestamp: z.date(),
    userId: z.string().optional(),
    metadata: z.record(z.unknown()).optional()
  })),
  startTime: z.date(),
  endTime: z.date().optional(),
  status: z.enum(['in_progress', 'completed', 'failed', 'timeout']),
  totalDuration: z.number().optional() // ms
});

// Business Metrics Schema
export const BusinessMetricsSchema = z.object({
  // Game metrics
  totalGames: z.number(),
  activeGames: z.number(),
  completedGames: z.number(),
  averageGameDuration: z.number(), // minutes
  
  // Player metrics
  totalPlayers: z.number(),
  activePlayersToday: z.number(),
  newPlayersToday: z.number(),
  playerRetentionRate: z.number(), // percentage
  
  // Report metrics
  totalReports: z.number(),
  reportsToday: z.number(),
  averageReportLength: z.number(), // characters
  
  // Performance metrics
  averageResponseTime: z.number(), // ms
  errorRate: z.number(), // percentage
  throughput: z.number(), // requests per second
  
  timestamp: z.date()
});

// Real-time Dashboard State Schema
export const DashboardStateSchema = z.object({
  lastUpdated: z.date(),
  metrics: BusinessMetricsSchema,
  alerts: z.array(AlertSchema),
  healthChecks: z.array(HealthCheckSchema),
  activeTraces: z.array(TraceSpanSchema),
  systemLoad: z.object({
    cpu: z.number(),
    memory: z.number(),
    network: z.number()
  }),
  connectionCounts: z.object({
    database: z.number(),
    inngest: z.number(),
    external: z.number()
  })
});

export type EventCorrelation = z.infer<typeof EventCorrelationSchema>;
export type BusinessMetrics = z.infer<typeof BusinessMetricsSchema>;
export type DashboardState = z.infer<typeof DashboardStateSchema>; 
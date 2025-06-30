import { z } from 'zod';

// ===============================
// ⚙️ RUNTIME CONFIGURATION SCHEMAS (ZOD)
// ===============================

// 🌍 Environment Schema
export const EnvironmentSchema = z.enum(['development', 'staging', 'production', 'test']);

// 🔗 Database Configuration Schema
export const DatabaseConfigSchema = z.object({
  // Connection
  url: z.string().url(),
  host: z.string().optional(),
  port: z.number().min(1).max(65535).optional(),
  database: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  
  // SSL/Security
  ssl: z.boolean().default(true),
  sslMode: z.enum(['require', 'prefer', 'disable']).default('require'),
  
  // Pool settings
  maxConnections: z.number().min(1).max(100).default(10),
  minConnections: z.number().min(0).max(50).default(2),
  connectionTimeout: z.number().min(1000).max(60000).default(30000), // ms
  idleTimeout: z.number().min(1000).max(300000).default(300000), // ms
  
  // Query settings
  queryTimeout: z.number().min(1000).max(120000).default(60000), // ms
  slowQueryThreshold: z.number().min(100).max(10000).default(1000), // ms
  
  // Migration settings
  migrationsPath: z.string().default('./drizzle'),
  autoMigrate: z.boolean().default(false),
  
  // Debugging
  logging: z.boolean().default(false),
  debug: z.boolean().default(false)
});

// 🎮 Inngest Configuration Schema
export const InngestConfigSchema = z.object({
  // Core settings
  appId: z.string().min(1),
  signingKey: z.string().optional(),
  eventKey: z.string().optional(),
  
  // Server settings
  baseUrl: z.string().url().optional(),
  port: z.number().min(1).max(65535).default(3001),
  path: z.string().default('/api/inngest'),
  
  // Development
  isDev: z.boolean().default(false),
  devServerUrl: z.string().url().default('http://localhost:8288'),
  
  // Event settings
  eventBatchSize: z.number().min(1).max(1000).default(100),
  eventRetryDelay: z.number().min(100).max(60000).default(1000), // ms
  maxRetries: z.number().min(0).max(10).default(3),
  
  // Function settings
  functionTimeout: z.number().min(1000).max(900000).default(300000), // ms (5 min)
  concurrency: z.number().min(1).max(1000).default(10),
  
  // Logging
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  enableMetrics: z.boolean().default(true)
});

// 🌐 Server Configuration Schema
export const ServerConfigSchema = z.object({
  // Basic settings
  port: z.number().min(1).max(65535).default(3000),
  host: z.string().default('localhost'),
  
  // CORS
  corsEnabled: z.boolean().default(true),
  corsOrigins: z.array(z.string()).default(['http://localhost:3000']),
  
  // Request limits
  bodyLimit: z.string().default('1mb'),
  requestTimeout: z.number().min(1000).max(300000).default(30000), // ms
  
  // Rate limiting
  rateLimitEnabled: z.boolean().default(true),
  rateLimitWindow: z.number().min(1000).max(3600000).default(900000), // 15 min
  rateLimitMax: z.number().min(1).max(10000).default(100),
  
  // Security
  helmet: z.boolean().default(true),
  compression: z.boolean().default(true),
  
  // Logging
  accessLogging: z.boolean().default(true),
  logFormat: z.enum(['combined', 'common', 'dev', 'short', 'tiny']).default('combined')
});

// 🔐 Security Configuration Schema
export const SecurityConfigSchema = z.object({
  // JWT Settings
  jwtSecret: z.string().min(32),
  jwtExpiresIn: z.string().default('24h'),
  jwtRefreshExpiresIn: z.string().default('7d'),
  
  // Password requirements
  passwordMinLength: z.number().min(6).max(128).default(8),
  passwordRequireNumbers: z.boolean().default(true),
  passwordRequireSymbols: z.boolean().default(true),
  passwordRequireUppercase: z.boolean().default(true),
  
  // Rate limiting
  loginAttemptLimit: z.number().min(1).max(20).default(5),
  loginAttemptWindow: z.number().min(60000).max(3600000).default(900000), // 15 min
  
  // Session settings
  sessionSecret: z.string().min(32),
  sessionMaxAge: z.number().min(3600000).max(2592000000).default(86400000), // 24h
  
  // Encryption
  encryptionKey: z.string().min(32),
  hashRounds: z.number().min(10).max(15).default(12),
  
  // API Security
  apiKeyRequired: z.boolean().default(false),
  apiKeyHeader: z.string().default('x-api-key'),
  
  // HTTPS
  forceHttps: z.boolean().default(false),
  httpsRedirect: z.boolean().default(false)
});

// 📊 Monitoring Configuration Schema
export const MonitoringConfigSchema = z.object({
  // Metrics
  metricsEnabled: z.boolean().default(true),
  metricsPort: z.number().min(1).max(65535).default(9090),
  metricsPath: z.string().default('/metrics'),
  
  // Health checks
  healthCheckEnabled: z.boolean().default(true),
  healthCheckInterval: z.number().min(5000).max(300000).default(30000), // ms
  
  // Logging
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  logFormat: z.enum(['json', 'pretty', 'text']).default('json'),
  logOutput: z.enum(['console', 'file', 'both']).default('console'),
  logFile: z.string().optional(),
  
  // Tracing
  tracingEnabled: z.boolean().default(false),
  tracingServiceName: z.string().default('neuroleela'),
  tracingEndpoint: z.string().url().optional(),
  
  // Alerting
  alertingEnabled: z.boolean().default(false),
  alertWebhookUrl: z.string().url().optional(),
  errorThreshold: z.number().min(1).max(1000).default(10), // errors per minute
  responseTimeThreshold: z.number().min(100).max(30000).default(5000) // ms
});

// 🎮 Game Configuration Schema
export const GameConfigSchema = z.object({
  // Board settings
  maxPlans: z.number().min(50).max(100).default(72),
  startingPlan: z.number().min(50).max(100).default(68),
  
  // Game rules
  consecutiveSixesLimit: z.number().min(2).max(5).default(3),
  resetOnThreeSixes: z.boolean().default(true),
  
  // Report settings
  reportRequired: z.boolean().default(true),
  reportMinLength: z.number().min(5).max(100).default(10),
  reportMaxLength: z.number().min(100).max(10000).default(2000),
  
  // Timing
  sessionTimeout: z.number().min(300000).max(7200000).default(1800000), // 30 min
  inactivityTimeout: z.number().min(60000).max(3600000).default(600000), // 10 min
  
  // Features
  chatEnabled: z.boolean().default(true),
  multiLanguageEnabled: z.boolean().default(true),
  analyticsEnabled: z.boolean().default(true),
  
  // AI Settings
  aiEnabled: z.boolean().default(true),
  aiProvider: z.enum(['openai', 'anthropic', 'local']).default('openai'),
  aiModel: z.string().default('gpt-4'),
  aiMaxTokens: z.number().min(100).max(4000).default(1000),
  aiTemperature: z.number().min(0).max(2).default(0.7)
});

// 🌐 Complete Application Configuration Schema
export const AppConfigSchema = z.object({
  // Environment
  env: EnvironmentSchema,
  version: z.string(),
  name: z.string().default('NeuroLeela'),
  
  // Component configurations
  database: DatabaseConfigSchema,
  inngest: InngestConfigSchema,
  server: ServerConfigSchema,
  security: SecurityConfigSchema,
  monitoring: MonitoringConfigSchema,
  game: GameConfigSchema,
  
  // Feature flags
  features: z.object({
    newUserRegistration: z.boolean().default(true),
    guestMode: z.boolean().default(true),
    premiumFeatures: z.boolean().default(false),
    betaFeatures: z.boolean().default(false),
    maintenanceMode: z.boolean().default(false)
  }),
  
  // External services
  external: z.object({
    openaiApiKey: z.string().optional(),
    stripePublicKey: z.string().optional(),
    stripeSecretKey: z.string().optional(),
    emailServiceApiKey: z.string().optional(),
    analyticsId: z.string().optional()
  }).optional(),
  
  // Development settings
  development: z.object({
    hotReload: z.boolean().default(true),
    debugMode: z.boolean().default(false),
    mockExternalServices: z.boolean().default(false),
    seedDatabase: z.boolean().default(false)
  }).optional()
});

// ===============================
// 🔄 TYPE INFERENCE
// ===============================

export type Environment = z.infer<typeof EnvironmentSchema>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type InngestConfig = z.infer<typeof InngestConfigSchema>;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type SecurityConfig = z.infer<typeof SecurityConfigSchema>;
export type MonitoringConfig = z.infer<typeof MonitoringConfigSchema>;
export type GameConfig = z.infer<typeof GameConfigSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;

// ===============================
// 🛠️ CONFIGURATION BUILDERS
// ===============================

// Environment Variable Schema
export const EnvVarsSchema = z.object({
  // Core
  NODE_ENV: z.string().transform(val => val as Environment).default('development'),
  APP_VERSION: z.string().default('1.0.0'),
  
  // Database
  DATABASE_URL: z.string().url(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().transform(Number).optional(),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_SSL: z.string().transform(val => val === 'true').default('true'),
  
  // Inngest
  INNGEST_APP_ID: z.string(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  INNGEST_EVENT_KEY: z.string().optional(),
  
  // Server
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('localhost'),
  
  // Security
  JWT_SECRET: z.string().min(32),
  SESSION_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  
  // External APIs
  OPENAI_API_KEY: z.string().optional(),
  STRIPE_PUBLIC_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  
  // Optional overrides
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).optional(),
  METRICS_ENABLED: z.string().transform(val => val === 'true').optional(),
  RATE_LIMIT_ENABLED: z.string().transform(val => val === 'true').optional()
});

// Configuration Factory
export const createAppConfig = (envVars: z.infer<typeof EnvVarsSchema>): AppConfig => {
  const isDev = envVars.NODE_ENV === 'development';
  const isProd = envVars.NODE_ENV === 'production';
  
  return {
    env: envVars.NODE_ENV,
    version: envVars.APP_VERSION,
    name: 'NeuroLeela',
    
    database: {
      url: envVars.DATABASE_URL,
      host: envVars.DB_HOST,
      port: envVars.DB_PORT,
      database: envVars.DB_NAME,
      username: envVars.DB_USER,
      password: envVars.DB_PASSWORD,
      ssl: envVars.DB_SSL,
      sslMode: 'require',
      maxConnections: isProd ? 20 : 5,
      minConnections: isProd ? 5 : 1,
      connectionTimeout: 30000,
      idleTimeout: 300000,
      queryTimeout: 60000,
      slowQueryThreshold: 1000,
      migrationsPath: './drizzle',
      autoMigrate: false,
      logging: isDev,
      debug: isDev
    },
    
    inngest: {
      appId: envVars.INNGEST_APP_ID,
      signingKey: envVars.INNGEST_SIGNING_KEY,
      eventKey: envVars.INNGEST_EVENT_KEY,
      baseUrl: undefined,
      port: 3001,
      path: '/api/inngest',
      isDev,
      devServerUrl: 'http://localhost:8288',
      eventBatchSize: 100,
      eventRetryDelay: 1000,
      maxRetries: 3,
      functionTimeout: 300000,
      concurrency: isProd ? 20 : 5,
      logLevel: envVars.LOG_LEVEL || 'info',
      enableMetrics: envVars.METRICS_ENABLED ?? true
    },
    
    server: {
      port: envVars.PORT,
      host: envVars.HOST,
      corsEnabled: true,
      corsOrigins: isDev ? ['http://localhost:3000', 'http://localhost:19006'] : [],
      bodyLimit: '1mb',
      requestTimeout: 30000,
      rateLimitEnabled: envVars.RATE_LIMIT_ENABLED ?? !isDev,
      rateLimitWindow: 900000,
      rateLimitMax: isDev ? 1000 : 100,
      helmet: isProd,
      compression: isProd,
      accessLogging: true,
      logFormat: isDev ? 'dev' : 'combined'
    },
    
    security: {
      jwtSecret: envVars.JWT_SECRET,
      jwtExpiresIn: '24h',
      jwtRefreshExpiresIn: '7d',
      passwordMinLength: 8,
      passwordRequireNumbers: true,
      passwordRequireSymbols: true,
      passwordRequireUppercase: true,
      loginAttemptLimit: 5,
      loginAttemptWindow: 900000,
      sessionSecret: envVars.SESSION_SECRET,
      sessionMaxAge: 86400000,
      encryptionKey: envVars.ENCRYPTION_KEY,
      hashRounds: 12,
      apiKeyRequired: false,
      apiKeyHeader: 'x-api-key',
      forceHttps: isProd,
      httpsRedirect: isProd
    },
    
    monitoring: {
      metricsEnabled: envVars.METRICS_ENABLED ?? true,
      metricsPort: 9090,
      metricsPath: '/metrics',
      healthCheckEnabled: true,
      healthCheckInterval: 30000,
      logLevel: envVars.LOG_LEVEL || (isDev ? 'debug' : 'info'),
      logFormat: 'json',
      logOutput: 'console',
      tracingEnabled: false,
      tracingServiceName: 'neuroleela',
      alertingEnabled: isProd,
      errorThreshold: 10,
      responseTimeThreshold: 5000
    },
    
    game: {
      maxPlans: 72,
      startingPlan: 68,
      consecutiveSixesLimit: 3,
      resetOnThreeSixes: true,
      reportRequired: true,
      reportMinLength: 10,
      reportMaxLength: 2000,
      sessionTimeout: 1800000,
      inactivityTimeout: 600000,
      chatEnabled: true,
      multiLanguageEnabled: true,
      analyticsEnabled: true,
      aiEnabled: !!envVars.OPENAI_API_KEY,
      aiProvider: 'openai',
      aiModel: 'gpt-4',
      aiMaxTokens: 1000,
      aiTemperature: 0.7
    },
    
    features: {
      newUserRegistration: true,
      guestMode: true,
      premiumFeatures: isProd,
      betaFeatures: isDev,
      maintenanceMode: false
    },
    
    external: {
      openaiApiKey: envVars.OPENAI_API_KEY,
      stripePublicKey: envVars.STRIPE_PUBLIC_KEY,
      stripeSecretKey: envVars.STRIPE_SECRET_KEY
    },
    
    development: isDev ? {
      hotReload: true,
      debugMode: true,
      mockExternalServices: false,
      seedDatabase: false
    } : undefined
  };
};

// ===============================
// 🔍 RUNTIME VALIDATION
// ===============================

// Validate environment variables
export const validateEnvVars = (env: Record<string, string | undefined>) => {
  try {
    return EnvVarsSchema.parse(env);
  } catch (error) {
    console.error('❌ Invalid environment configuration:', error);
    process.exit(1);
  }
};

// Validate complete configuration
export const validateAppConfig = (config: unknown): AppConfig => {
  try {
    return AppConfigSchema.parse(config);
  } catch (error) {
    console.error('❌ Invalid application configuration:', error);
    throw error;
  }
};

// Configuration summary for debugging
export const getConfigSummary = (config: AppConfig) => ({
  environment: config.env,
  version: config.version,
  database: {
    connected: !!config.database.url,
    ssl: config.database.ssl,
    poolSize: config.database.maxConnections
  },
  server: {
    port: config.server.port,
    cors: config.server.corsEnabled,
    rateLimit: config.server.rateLimitEnabled
  },
  features: config.features,
  security: {
    jwtEnabled: !!config.security.jwtSecret,
    httpsRequired: config.security.forceHttps
  },
  monitoring: {
    metricsEnabled: config.monitoring.metricsEnabled,
    logLevel: config.monitoring.logLevel
  }
});

// ===============================
// 🛡️ VALIDATION HELPERS
// ===============================

export const validateDatabaseConfig = (data: unknown) => DatabaseConfigSchema.parse(data);
export const validateInngestConfig = (data: unknown) => InngestConfigSchema.parse(data);
export const validateServerConfig = (data: unknown) => ServerConfigSchema.parse(data);
export const validateSecurityConfig = (data: unknown) => SecurityConfigSchema.parse(data);
export const validateMonitoringConfig = (data: unknown) => MonitoringConfigSchema.parse(data);
export const validateGameConfig = (data: unknown) => GameConfigSchema.parse(data);

// Safe parsers
export const safeParseEnvVars = (data: unknown) => EnvVarsSchema.safeParse(data);
export const safeParseAppConfig = (data: unknown) => AppConfigSchema.safeParse(data); 
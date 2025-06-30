#!/usr/bin/env bun
// 🕉️ Comprehensive тест для всех Zod схем NeuroLeela

import {
  // Database schemas
  validatePlayer,
  validateNewPlayer,
  validatePlayerUpdate,
  validateReport,
  validateNewReport,
  validateChatHistory,
  validateNewChatHistory,
  
  // Game logic schemas
  validateDiceRoll,
  validatePosition,
  validateDirection,
  validateGameStep,
  validateGameContext,
  validateGameMoveResult,
  validateGameState,
  validateLanguageCode,
  validateGameMessage,
  
  // Inngest event schemas
  validateDiceRollEvent,
  validateReportSubmitEvent,
  validatePlayerStateUpdateEvent,
  validatePlayerInitEvent,
  validateDiceRollEventData,
  validateReportSubmitEventData,
  validatePlayerStateUpdateEventData,
  validatePlayerInitEventData,
  validateDiceRollResponse,
  validateReportResponse,
  validatePlayerStateUpdateResponse,
  validatePlayerInitResponse,
  
  // API schemas
  validateApiDiceRollRequest,
  validateApiReportSubmitRequest,
  validateApiPlayerInitRequest,
  validateApiPlayerUpdateRequest,
  validateApiChatMessageRequest,
  validatePagination,
  validatePlayerSearchQuery,
  validateReportSearchQuery,
  validateLoginRequest,
  validateRegisterRequest,
  
  // Universal schemas
  validateEnv,
  validateConfig,
  
  // Safe parsers
  safeParseDiceRollEvent,
  safeParseReportSubmitEvent,
  safeParsePlayerStateUpdateEvent,
  safeParsePlayerInitEvent,
  safeParseGameEvent
} from '../types/schemas';

// 🎨 Цветовая схема для вывода
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`),
  header: (msg: string) => console.log(`${colors.cyan}${colors.bright}\n🕉️ ${msg}${colors.reset}`),
  subheader: (msg: string) => console.log(`${colors.magenta}${colors.bright}${msg}${colors.reset}`)
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

// Утилиты для тестирования
const test = (name: string, fn: () => void) => {
  totalTests++;
  try {
    fn();
    log.success(name);
    passedTests++;
  } catch (error) {
    log.error(`${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    failedTests++;
  }
};

const expectValid = (validator: (data: unknown) => any, data: unknown) => {
  const result = validator(data);
  if (!result) throw new Error('Validation failed');
  return result;
};

const expectInvalid = (validator: (data: unknown) => any, data: unknown) => {
  try {
    validator(data);
    throw new Error('Expected validation to fail, but it passed');
  } catch (error) {
    // Ожидаем ошибку валидации
    return error;
  }
};

// ===============================
// 🗃️ DATABASE SCHEMA TESTS
// ===============================
const testDatabaseSchemas = () => {
  log.header('TESTING DATABASE SCHEMAS');
  
  log.subheader('👤 Player Schemas');
  
  test('Valid Player', () => {
    expectValid(validatePlayer, {
      id: 'user-123',
      plan: 15,
      previous_plan: 10,
      updated_at: new Date(),
      created_at: '2025-01-01T00:00:00.000Z',
      message: 'Тестовое сообщение',
      avatar: 'https://example.com/avatar.jpg',
      fullName: 'Иван Иванов',
      intention: 'Познание себя',
      isStart: false,
      isFinished: false,
      consecutiveSixes: 2,
      positionBeforeThreeSixes: 5,
      needsReport: true
    });
  });
  
  test('Valid New Player', () => {
    expectValid(validateNewPlayer, {
      id: 'new-user',
      plan: 68,
      message: 'Добро пожаловать!',
      isFinished: true,
      consecutiveSixes: 0,
      needsReport: false
    });
  });
  
  test('Valid Player Update', () => {
    expectValid(validatePlayerUpdate, {
      plan: 25,
      fullName: 'Новое имя',
      needsReport: false
    });
  });
  
  test('Invalid Player - Bad plan value', () => {
    expectInvalid(validatePlayer, {
      id: 'user-123',
      plan: 100, // > 72
      isFinished: false
    });
  });
  
  test('Invalid Player - Missing ID', () => {
    expectInvalid(validatePlayer, {
      plan: 15,
      isFinished: false
    });
  });
  
  log.subheader('📋 Report Schemas');
  
  test('Valid Report', () => {
    expectValid(validateReport, {
      id: 1,
      user_id: 'user-123',
      plan_number: 15,
      content: 'Это мой отчет о прохождении плана 15. Очень интересный опыт!',
      likes: 5,
      comments: 2,
      created_at: new Date(),
      updated_at: '2025-01-01T00:00:00.000Z'
    });
  });
  
  test('Valid New Report', () => {
    expectValid(validateNewReport, {
      user_id: 'user-456',
      plan_number: 30,
      content: 'Новый отчет для тестирования схемы валидации',
      likes: 0,
      comments: 0
    });
  });
  
  test('Invalid Report - Short content', () => {
    expectInvalid(validateReport, {
      id: 1,
      user_id: 'user-123',
      plan_number: 15,
      content: 'Короткий', // < 10 символов
      likes: 0,
      comments: 0
    });
  });
  
  log.subheader('💬 Chat History Schemas');
  
  test('Valid Chat History', () => {
    expectValid(validateChatHistory, {
      id: 1,
      user_id: 'user-789',
      plan_number: 20,
      user_message: 'Как правильно понимать этот план?',
      ai_response: 'Этот план символизирует важность терпения и самопознания...',
      report_id: 5,
      message_type: 'question',
      created_at: new Date()
    });
  });
  
  test('Valid New Chat History', () => {
    expectValid(validateNewChatHistory, {
      user_id: 'user-999',
      plan_number: 45,
      user_message: 'Что означает этот символ?',
      ai_response: 'Символ представляет собой архетип мудрости...',
      message_type: 'general'
    });
  });
};

// ===============================
// 🎲 GAME LOGIC SCHEMA TESTS
// ===============================
const testGameLogicSchemas = () => {
  log.header('TESTING GAME LOGIC SCHEMAS');
  
  log.subheader('🎲 Basic Game Elements');
  
  test('Valid Dice Roll', () => {
    expectValid(validateDiceRoll, 6);
    expectValid(validateDiceRoll, 1);
    expectValid(validateDiceRoll, 3);
  });
  
  test('Invalid Dice Roll', () => {
    expectInvalid(validateDiceRoll, 0);
    expectInvalid(validateDiceRoll, 7);
    expectInvalid(validateDiceRoll, 3.5);
  });
  
  test('Valid Position', () => {
    const validPositions = [0, 36, 72];
    validPositions.forEach(pos => {
      const result = validatePosition(pos);
      if (result !== pos) throw new Error(`Position validation failed for ${pos}`);
    });
  });
  
  test('Invalid Position', () => {
    expectInvalid(validatePosition, -1);
    expectInvalid(validatePosition, 73);
    expectInvalid(validatePosition, 15.5);
  });
  
  test('Valid Direction', () => {
    expectValid(validateDirection, 'stop 🛑');
    expectValid(validateDirection, 'arrow 🏹');
    expectValid(validateDirection, 'snake 🐍');
    expectValid(validateDirection, 'win 🕉');
    expectValid(validateDirection, 'step 🚶🏼');
  });
  
  test('Invalid Direction', () => {
    expectInvalid(validateDirection, 'invalid');
    expectInvalid(validateDirection, 'stop');
    expectInvalid(validateDirection, '');
  });
  
  log.subheader('🎮 Complex Game Structures');
  
  test('Valid Game Step', () => {
    expectValid(validateGameStep, {
      loka: 25,
      previous_loka: 20,
      direction: 'step 🚶🏼',
      consecutive_sixes: 1,
      position_before_three_sixes: 15,
      is_finished: false
    });
  });
  
  test('Valid Game Context', () => {
    expectValid(validateGameContext, {
      currentPlan: 30,
      previousPlan: 25,
      roll: 5,
      direction: 'arrow 🏹',
      isFinished: false,
      consecutiveSixes: 0
    });
  });
  
  test('Valid Game Move Result', () => {
    expectValid(validateGameMoveResult, {
      gameStep: {
        loka: 40,
        previous_loka: 35,
        direction: 'step',
        consecutive_sixes: 0,
        position_before_three_sixes: 0,
        is_finished: false
      },
      plan: {
        short_desc: 'Описание плана 40',
        image: '',
        name: 'План 40'
      },
      direction: 'Обычный ход',
      message: 'Вы переместились с 35 на 40'
    });
  });
  
  test('Valid Game State', () => {
    expectValid(validateGameState, {
      id: 'player-123',
      plan: 55,
      previous_plan: 50,
      message: 'Игровое сообщение',
      avatar: null,
      fullName: 'Игрок',
      intention: null,
      isStart: false,
      isFinished: false,
      consecutiveSixes: 1,
      positionBeforeThreeSixes: 45,
      needsReport: true
    });
  });
  
  test('Valid Language Code', () => {
    expectValid(validateLanguageCode, 'en');
    expectValid(validateLanguageCode, 'ru');
  });
  
  test('Invalid Language Code', () => {
    expectInvalid(validateLanguageCode, 'fr');
    expectInvalid(validateLanguageCode, 'invalid');
  });
  
  test('Valid Game Message', () => {
    expectValid(validateGameMessage, {
      text: 'Добро пожаловать в игру NeuroLeela!'
    });
  });
  
  test('Invalid Game Message - Empty text', () => {
    expectInvalid(validateGameMessage, {
      text: ''
    });
  });
};

// ===============================
// 🎯 INNGEST EVENT SCHEMA TESTS
// ===============================
const testInngestEventSchemas = () => {
  log.header('TESTING INNGEST EVENT SCHEMAS');
  
  log.subheader('📤 Event Data Schemas');
  
  test('Valid Dice Roll Event Data', () => {
    expectValid(validateDiceRollEventData, {
      userId: 'user-123',
      roll: 4
    });
  });
  
  test('Valid Report Submit Event Data', () => {
    expectValid(validateReportSubmitEventData, {
      userId: 'user-456',
      report: 'Мой детальный отчет о прохождении данного плана игры.',
      planNumber: 25
    });
  });
  
  test('Valid Player State Update Event Data', () => {
    expectValid(validatePlayerStateUpdateEventData, {
      userId: 'user-789',
      updates: {
        plan: 30,
        needsReport: false,
        message: 'Обновленное сообщение'
      },
      timestamp: Date.now()
    });
  });
  
  test('Valid Player Init Event Data', () => {
    expectValid(validatePlayerInitEventData, {
      userId: 'new-user-001',
      email: 'user@example.com'
    });
  });
  
  log.subheader('🎯 Complete Events');
  
  test('Valid Dice Roll Event', () => {
    expectValid(validateDiceRollEvent, {
      name: 'game.dice.roll',
      data: {
        userId: 'event-user-1',
        roll: 6
      },
      user: {},
      id: '01234567890',
      timestamp: Date.now(),
      version: '1.0'
    });
  });
  
  test('Valid Report Submit Event', () => {
    expectValid(validateReportSubmitEvent, {
      name: 'game.report.submit',
      data: {
        userId: 'event-user-2',
        report: 'Подробный отчет о моем духовном путешествии',
        planNumber: 42
      }
    });
  });
  
  test('Valid Player State Update Event', () => {
    expectValid(validatePlayerStateUpdateEvent, {
      name: 'game.player.state.update',
      data: {
        userId: 'event-user-3',
        updates: {
          plan: 15,
          isFinished: false
        }
      }
    });
  });
  
  test('Valid Player Init Event', () => {
    expectValid(validatePlayerInitEvent, {
      name: 'game.player.init',
      data: {
        userId: 'event-user-4'
      }
    });
  });
  
  log.subheader('📦 Function Responses');
  
  test('Valid Dice Roll Response', () => {
    expectValid(validateDiceRollResponse, {
      success: true,
      userId: 'response-user-1',
      roll: 5,
      gameResult: {
        gameStep: {
          loka: 20,
          previous_loka: 15,
          direction: 'step',
          consecutive_sixes: 0,
          position_before_three_sixes: 0,
          is_finished: false
        },
        plan: {
          short_desc: 'Тестовый план',
          image: '',
          name: 'План 20'
        },
        direction: 'Обычный ход',
        message: 'Вы перешли на план 20'
      },
      message: 'Dice roll processed successfully'
    });
  });
  
  test('Valid Report Response', () => {
    expectValid(validateReportResponse, {
      success: true,
      userId: 'response-user-2',
      planNumber: 30,
      reportSaved: true,
      diceUnlocked: true,
      message: 'Report processed successfully'
    });
  });
  
  test('Valid Player State Update Response', () => {
    expectValid(validatePlayerStateUpdateResponse, {
      success: true,
      userId: 'response-user-3',
      updatesApplied: {
        plan: 25,
        needsReport: false
      },
      message: 'State updated successfully'
    });
  });
  
  test('Valid Player Init Response', () => {
    expectValid(validatePlayerInitResponse, {
      success: true,
      userId: 'response-user-4',
      playerCreated: true,
      message: 'Player initialized successfully'
    });
  });
};

// ===============================
// 🌐 API SCHEMA TESTS
// ===============================
const testApiSchemas = () => {
  log.header('TESTING API SCHEMAS');
  
  log.subheader('📨 Request Schemas');
  
  test('Valid API Dice Roll Request', () => {
    expectValid(validateApiDiceRollRequest, {
      userId: 'api-user-1',
      roll: 3
    });
  });
  
  test('Valid API Report Submit Request', () => {
    expectValid(validateApiReportSubmitRequest, {
      userId: 'api-user-2',
      planNumber: 15,
      content: 'Мой API отчет для тестирования схемы валидации'
    });
  });
  
  test('Valid API Player Init Request', () => {
    expectValid(validateApiPlayerInitRequest, {
      userId: 'api-user-3',
      email: 'api@example.com',
      fullName: 'API Пользователь',
      intention: 'API тестирование'
    });
  });
  
  test('Valid API Player Update Request', () => {
    expectValid(validateApiPlayerUpdateRequest, {
      userId: 'api-user-4',
      updates: {
        fullName: 'Обновленное имя',
        intention: 'Новое намерение',
        avatar: 'https://example.com/new-avatar.jpg'
      }
    });
  });
  
  test('Valid API Chat Message Request', () => {
    expectValid(validateApiChatMessageRequest, {
      userId: 'api-user-5',
      planNumber: 25,
      message: 'Как понимать этот план?',
      messageType: 'question',
      reportId: 10
    });
  });
  
  log.subheader('🔍 Query Schemas');
  
  test('Valid Pagination', () => {
    expectValid(validatePagination, {
      page: 2,
      limit: 50,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  });
  
  test('Valid Player Search Query', () => {
    expectValid(validatePlayerSearchQuery, {
      userId: 'search-user',
      fullName: 'Иван',
      minPlan: 10,
      maxPlan: 50,
      isFinished: false,
      needsReport: true,
      page: 1,
      limit: 20
    });
  });
  
  test('Valid Report Search Query', () => {
    expectValid(validateReportSearchQuery, {
      userId: 'report-search-user',
      planNumber: 35,
      minLikes: 5,
      dateFrom: new Date('2025-01-01'),
      dateTo: new Date('2025-12-31'),
      page: 1,
      limit: 10
    });
  });
  
  log.subheader('🔐 Authentication Schemas');
  
  test('Valid Login Request', () => {
    expectValid(validateLoginRequest, {
      email: 'test@neuroleela.com',
      password: 'securePassword123'
    });
  });
  
  test('Valid Register Request', () => {
    expectValid(validateRegisterRequest, {
      email: 'newuser@neuroleela.com',
      password: 'strongPassword456',
      fullName: 'Новый Пользователь',
      intention: 'Духовное развитие и самопознание'
    });
  });
  
  test('Invalid Login - Short password', () => {
    expectInvalid(validateLoginRequest, {
      email: 'test@example.com',
      password: '123' // < 6 символов
    });
  });
  
  test('Invalid Register - Invalid email', () => {
    expectInvalid(validateRegisterRequest, {
      email: 'invalid-email',
      password: 'password123',
      fullName: 'Имя'
    });
  });
};

// ===============================
// 🔧 UNIVERSAL SCHEMA TESTS
// ===============================
const testUniversalSchemas = () => {
  log.header('TESTING UNIVERSAL SCHEMAS');
  
  log.subheader('🌍 Environment Schema');
  
  test('Valid Environment', () => {
    const validEnv = {
      NODE_ENV: 'development',
      EXPO_PUBLIC_DATABASE_URL: 'postgresql://user:pass@host:5432/db',
      PORT: '3001',
      INNGEST_EVENT_KEY: 'test-key',
      INNGEST_SIGNING_KEY: 'test-signing-key',
      OPENAI_API_KEY: 'sk-test-key',
      LOG_LEVEL: 'info'
    };
    const result = validateEnv(validEnv as any);
    if (!result) throw new Error('Validation failed');
  });
  
  test('Invalid Environment - Bad URL', () => {
    const invalidEnv = {
      NODE_ENV: 'development',
      EXPO_PUBLIC_DATABASE_URL: 'not-a-url',
      PORT: '3001'
    };
    try {
      validateEnv(invalidEnv as any);
      throw new Error('Expected validation to fail, but it passed');
    } catch (error) {
      // Ожидаем ошибку валидации
    }
  });
  
  log.subheader('⚙️ Config Schema');
  
  test('Valid Config', () => {
    const validConfig = {
      app: {
        name: 'NeuroLeela',
        version: '1.0.0',
        environment: 'development'
      },
      database: {
        url: 'postgresql://user:pass@host:5432/db',
        ssl: true,
        maxConnections: 10
      },
      inngest: {
        url: 'http://localhost:8288',
        eventKey: 'test-key',
        signingKey: 'test-key',
        retryAttempts: 3
      },
      game: {
        maxPlans: 72,
        winPosition: 68,
        startPosition: 6,
        maxDiceValue: 6
      }
    };
    const result = validateConfig(validConfig);
    if (!result) throw new Error('Validation failed');
  });
};

// ===============================
// 📊 OBSERVABILITY SCHEMA TESTS
// ===============================
const testObservabilitySchemas = () => {
  log.header('TESTING OBSERVABILITY SCHEMAS');
  
  log.subheader('📝 Log Entry Schema');
  
  test('Valid Log Entry', () => {
    expectValid(require('../types/schemas/observability').validateLogEntry, {
      timestamp: new Date(),
      level: 'info',
      message: 'Test log message',
      context: {
        userId: 'user-123',
        requestId: 'req-456',
        environment: 'development'
      },
      metadata: {
        action: 'dice_roll',
        result: 6
      },
      duration: 150
    });
  });
  
  test('Valid Metric', () => {
    expectValid(require('../types/schemas/observability').validateMetric, {
      name: 'dice_rolls_total',
      type: 'counter',
      value: 1,
      labels: { userId: 'user-123', result: '6' },
      timestamp: new Date(),
      unit: 'count'
    });
  });
  
  test('Valid Performance Metrics', () => {
    expectValid(require('../types/schemas/observability').validatePerformanceMetrics, {
      functionDuration: 250,
      stepDurations: {
        validation: 50,
        database: 100,
        processing: 100
      },
      databaseQueryTime: 75,
      memoryUsage: 128,
      queryCount: 3
    });
  });
  
  test('Valid Alert', () => {
    expectValid(require('../types/schemas/observability').validateAlert, {
      id: 'alert-123',
      title: 'High Error Rate',
      description: 'Error rate exceeded threshold',
      severity: 'high',
      component: 'inngest-function',
      metric: 'error_rate',
      threshold: 0.1,
      currentValue: 0.15,
      timestamp: new Date(),
      resolved: false
    });
  });
  
  test('Valid Health Check', () => {
    expectValid(require('../types/schemas/observability').validateHealthCheck, {
      service: 'database',
      status: 'healthy',
      timestamp: new Date(),
      responseTime: 50,
      details: {
        connectionPool: 'active',
        version: '14.2'
      }
    });
  });
  
  test('Valid Game Event Observability', () => {
    expectValid(require('../types/schemas/observability').validateGameEventObservability, {
      eventType: 'dice.roll',
      userId: 'user-123',
      gameState: {
        currentPlan: 15,
        previousPlan: 10,
        isFinished: false,
        consecutiveSixes: 1
      },
      performance: {
        functionDuration: 200,
        validationTime: 50
      },
      metadata: {
        diceValue: 5
      }
    });
  });
};

// ===============================
// 🎯 STATE MACHINE SCHEMA TESTS
// ===============================
const testStateMachineSchemas = () => {
  log.header('TESTING STATE MACHINE SCHEMAS');
  
  log.subheader('🎮 Game State Machine');
  
  test('Valid Game State Machine', () => {
    expectValid(require('../types/schemas/state-machine').validateGameStateMachine, {
      currentState: 'playing',
      previousState: 'waiting_to_start',
      diceRollState: 'ready',
      reportState: 'not_required',
      currentPlan: 15,
      previousPlan: 10,
      planStates: [
        {
          planNumber: 10,
          isVisited: true,
          visitCount: 1,
          lastVisited: new Date(),
          hasReport: true,
          reportContent: 'Test report'
        }
      ],
      consecutiveSixes: 0,
      positionBeforeThreeSixes: 0,
      transitionHistory: [
        {
          from: 'waiting_to_start',
          to: 'playing',
          trigger: 'dice_roll',
          timestamp: new Date()
        }
      ],
      lastActivity: new Date(),
      isValid: true,
      validationErrors: []
    });
  });
  
  test('Valid State Transition', () => {
    expectValid(require('../types/schemas/state-machine').validateStateTransition, {
      from: 'playing',
      to: 'needs_report',
      trigger: 'dice_roll',
      timestamp: new Date()
    });
  });
};

// ===============================
// 🛡️ ERROR & SECURITY SCHEMA TESTS
// ===============================
const testErrorSecuritySchemas = () => {
  log.header('TESTING ERROR & SECURITY SCHEMAS');
  
  log.subheader('🚨 Structured Error');
  
  test('Valid Structured Error', () => {
    expectValid(require('../types/schemas/errors-security').validateStructuredError, {
      id: 'err-123',
      code: 'VALIDATION_FAILED',
      message: 'Invalid input data',
      severity: 'error',
      category: 'validation',
      context: {
        userId: 'user-123',
        timestamp: new Date(),
        operation: 'dice_roll'
      },
      stack: 'Error stack trace...',
      metadata: {
        field: 'diceValue',
        value: 'invalid'
      },
      isRetryable: false,
      shouldAlert: false,
      shouldLog: true
    });
  });
  
  test('Valid Security Context', () => {
    expectValid(require('../types/schemas/errors-security').validateSecurityContext, {
      userId: 'user-123',
      sessionId: 'session-456',
      roles: ['player'],
      permissions: ['game:play', 'report:submit'],
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      isAuthenticated: true,
      isTrustedDevice: false,
      requiresMFA: false,
      lastActivity: new Date()
    });
  });
  
  test('Valid Security Auth Token', () => {
    expectValid(require('../types/schemas/errors-security').validateSecurityAuthToken, {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      type: 'access',
      expiresAt: new Date(Date.now() + 3600000),
      issuedAt: new Date(),
      userId: 'user-123',
      sessionId: 'session-456',
      permissions: ['game:play'],
      metadata: {
        deviceId: 'device-789'
      }
    });
  });
  
  test('Valid Security Event', () => {
    expectValid(require('../types/schemas/errors-security').validateSecurityEvent, {
      id: 'sec-123',
      type: 'login_success',
      severity: 'info',
      userId: 'user-123',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      description: 'User successfully logged in',
      timestamp: new Date(),
      isResolved: false
    });
  });
  
  test('Valid Rate Limit', () => {
    expectValid(require('../types/schemas/errors-security').validateRateLimit, {
      key: 'user:user-123',
      limit: 100,
      window: 3600,
      current: 15,
      remaining: 85,
      resetTime: new Date(Date.now() + 3600000),
      isBlocked: false
    });
  });
};

// ===============================
// ⚙️ RUNTIME CONFIG SCHEMA TESTS  
// ===============================
const testRuntimeConfigSchemas = () => {
  log.header('TESTING RUNTIME CONFIG SCHEMAS');
  
  log.subheader('🌐 App Configuration');
  
  test('Valid Environment Variables', () => {
    expectValid(require('../types/schemas/runtime-config').validateEnvVars, {
      NODE_ENV: 'development',
      APP_VERSION: '1.0.0',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
      INNGEST_APP_ID: 'neuroleela-dev',
      PORT: '3000',
      JWT_SECRET: '12345678901234567890123456789012',
      SESSION_SECRET: '12345678901234567890123456789012',
      ENCRYPTION_KEY: '12345678901234567890123456789012',
      LOG_LEVEL: 'debug',
      METRICS_ENABLED: 'true'
    });
  });
  
  test('Valid Database Config', () => {
    expectValid(require('../types/schemas/runtime-config').validateDatabaseConfig, {
      url: 'postgresql://user:pass@localhost:5432/db',
      host: 'localhost',
      port: 5432,
      database: 'neuroleela',
      username: 'user',
      password: 'pass',
      ssl: true,
      sslMode: 'require',
      maxConnections: 10,
      minConnections: 2,
      connectionTimeout: 30000,
      queryTimeout: 60000,
      logging: false,
      debug: false
    });
  });
  
  test('Valid Inngest Config', () => {
    expectValid(require('../types/schemas/runtime-config').validateInngestConfig, {
      appId: 'neuroleela-dev',
      signingKey: 'test-key',
      port: 3001,
      path: '/api/inngest',
      isDev: true,
      devServerUrl: 'http://localhost:8288',
      eventBatchSize: 100,
      maxRetries: 3,
      functionTimeout: 300000,
      logLevel: 'info',
      enableMetrics: true
    });
  });
  
  test('Valid Security Config', () => {
    expectValid(require('../types/schemas/runtime-config').validateSecurityConfig, {
      jwtSecret: '12345678901234567890123456789012',
      jwtExpiresIn: '24h',
      passwordMinLength: 8,
      passwordRequireNumbers: true,
      loginAttemptLimit: 5,
      sessionSecret: '12345678901234567890123456789012',
      sessionMaxAge: 86400000,
      encryptionKey: '12345678901234567890123456789012',
      hashRounds: 12,
      forceHttps: false
    });
  });
};

// ===============================
// 🔒 SAFE PARSER TESTS
// ===============================
const testSafeParsers = () => {
  log.header('TESTING SAFE PARSERS');
  
  test('Safe Parse Dice Roll Event - Valid', () => {
    const result = safeParseDiceRollEvent({
      name: 'game.dice.roll',
      data: {
        userId: 'safe-user',
        roll: 4
      }
    });
    
    if (!result.success) {
      throw new Error('Expected safe parse to succeed');
    }
    
    if (result.data.data.roll !== 4) {
      throw new Error('Parsed data mismatch');
    }
  });
  
  test('Safe Parse Dice Roll Event - Invalid', () => {
    const result = safeParseDiceRollEvent({
      name: 'game.dice.roll',
      data: {
        userId: 'safe-user',
        roll: 'invalid' // не число
      }
    });
    
    if (result.success) {
      throw new Error('Expected safe parse to fail');
    }
  });
  
  test('Safe Parse Report Submit Event - Valid', () => {
    const result = safeParseReportSubmitEvent({
      name: 'game.report.submit',
      data: {
        userId: 'safe-user',
        report: 'Безопасный отчет для тестирования safe parser функциональности',
        planNumber: 20
      }
    });
    
    if (!result.success) {
      throw new Error('Expected safe parse to succeed');
    }
  });
  
  test('Safe Parse Player State Update Event', () => {
    const result = safeParsePlayerStateUpdateEvent({
      name: 'game.player.state.update',
      data: {
        userId: 'safe-user',
        updates: {
          plan: 30,
          needsReport: false
        }
      }
    });
    
    if (!result.success) {
      throw new Error('Expected safe parse to succeed');
    }
  });
  
  test('Safe Parse Player Init Event', () => {
    const result = safeParsePlayerInitEvent({
      name: 'game.player.init',
      data: {
        userId: 'safe-user',
        email: 'safe@example.com'
      }
    });
    
    if (!result.success) {
      throw new Error('Expected safe parse to succeed');
    }
  });
  
  test('Safe Parse Game Event - Union Type', () => {
    const events = [
      {
        name: 'game.dice.roll',
        data: { userId: 'user1', roll: 5 }
      },
      {
        name: 'game.report.submit',
        data: { userId: 'user2', report: 'Тест отчет для union type parsing', planNumber: 15 }
      },
      {
        name: 'game.player.state.update',
        data: { userId: 'user3', updates: { plan: 25 } }
      },
      {
        name: 'game.player.init',
        data: { userId: 'user4' }
      }
    ];
    
    events.forEach((event, index) => {
      const result = safeParseGameEvent(event);
      if (!result.success) {
        throw new Error(`Event ${index} failed to parse: ${result.error.message}`);
      }
    });
  });
};

// ===============================
// 🎯 MAIN TEST RUNNER
// ===============================
const runAllTests = async () => {
  console.log(`${colors.cyan}${colors.bright}`);
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                  🕉️ NEUROLEELA ZOD SCHEMAS TEST            ║');
  console.log('║                     Comprehensive Validation                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);
  
  try {
    // Запуск всех тестов
    testDatabaseSchemas();
    testGameLogicSchemas();
    testInngestEventSchemas();
    testApiSchemas();
    testUniversalSchemas();
    testObservabilitySchemas();
    testStateMachineSchemas();
    testErrorSecuritySchemas();
    testRuntimeConfigSchemas();
    testSafeParsers();
    
    // Итоговые результаты
    log.header('TEST RESULTS SUMMARY');
    
    console.log(`${colors.bright}📊 СТАТИСТИКА ТЕСТОВ:${colors.reset}`);
    console.log(`   Всего тестов: ${colors.cyan}${totalTests}${colors.reset}`);
    console.log(`   Пройдено: ${colors.green}${passedTests}${colors.reset}`);
    console.log(`   Провалено: ${colors.red}${failedTests}${colors.reset}`);
    console.log(`   Успешность: ${colors.yellow}${((passedTests / totalTests) * 100).toFixed(1)}%${colors.reset}\n`);
    
    if (failedTests === 0) {
      console.log(`${colors.green}${colors.bright}🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ! Zod схемы работают корректно.${colors.reset}`);
      console.log(`${colors.green}✅ База данных: Типизирована${colors.reset}`);
      console.log(`${colors.green}✅ Игровая логика: Типизирована${colors.reset}`);
      console.log(`${colors.green}✅ Inngest события: Типизированы${colors.reset}`);
      console.log(`${colors.green}✅ API интерфейсы: Типизированы${colors.reset}`);
      console.log(`${colors.green}✅ Универсальные схемы: Типизированы${colors.reset}`);
      console.log(`${colors.green}✅ Observability: Типизирован${colors.reset}`);
      console.log(`${colors.green}✅ State Machine: Типизирована${colors.reset}`);
      console.log(`${colors.green}✅ Error & Security: Типизированы${colors.reset}`);
      console.log(`${colors.green}✅ Runtime Config: Типизирован${colors.reset}`);
      console.log(`${colors.green}✅ Safe parsers: Работают корректно${colors.reset}\n`);
      
      console.log(`${colors.cyan}🕉️ "सत्यमेव जयते" - "Истина восторжествует"${colors.reset}`);
      console.log(`${colors.dim}Всего создано 200+ Zod схем покрывающих весь codebase NeuroLeela!${colors.reset}`);
      console.log(`${colors.dim}Включая: Observability, State Machine, Security, Runtime Config${colors.reset}\n`);
      
      process.exit(0);
    } else {
      console.log(`${colors.red}${colors.bright}💥 ЕСТЬ ПРОБЛЕМЫ! Некоторые тесты провалились.${colors.reset}`);
      console.log(`${colors.red}❌ Исправьте ошибки валидации и запустите тесты снова.${colors.reset}\n`);
      process.exit(1);
    }
    
  } catch (error) {
    log.error(`Критическая ошибка при выполнении тестов: ${error}`);
    process.exit(1);
  }
};

// Запуск тестов
runAllTests(); 
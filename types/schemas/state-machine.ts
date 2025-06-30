import { z } from 'zod';

// ===============================
// 🎯 STATE MACHINE SCHEMAS (ZOD)
// ===============================

// 🎮 Game State Types
export const GameStateTypeSchema = z.enum([
  'uninitialized',     // Игрок не создан
  'waiting_to_start',  // Игрок создан, ждет первый бросок 6
  'playing',           // Активная игра
  'needs_report',      // Требуется отчет для продолжения
  'completed',         // Игра завершена (достиг 68)
  'paused',           // Игра приостановлена
  'error'             // Ошибочное состояние
]);

// 🔄 State Transition Schema
export const StateTransitionSchema = z.object({
  from: GameStateTypeSchema,
  to: GameStateTypeSchema,
  trigger: z.enum([
    'player_init',
    'dice_roll',
    'report_submit',
    'game_complete',
    'pause_game',
    'resume_game',
    'error_occurred',
    'state_reset'
  ]),
  condition: z.function()
    .args(z.object({
      currentPlan: z.number(),
      diceRoll: z.number().optional(),
      hasReport: z.boolean().optional(),
      consecutiveSixes: z.number().optional()
    }))
    .returns(z.boolean())
    .optional(),
  timestamp: z.date()
});

// 🎲 Dice Roll State Schema
export const DiceRollStateSchema = z.enum([
  'ready',       // Готов к броску
  'rolling',     // Процесс броска
  'processing',  // Обработка результата
  'completed',   // Обработка завершена
  'blocked'      // Заблокирован (требуется отчет)
]);

// 📝 Report State Schema  
export const ReportStateSchema = z.enum([
  'not_required',   // Отчет не нужен
  'required',       // Отчет обязателен
  'in_progress',    // Отчет создается
  'submitted',      // Отчет отправлен
  'processing',     // Отчет обрабатывается
  'accepted',       // Отчет принят
  'rejected'        // Отчет отклонен
]);

// 🔢 Plan State Schema (для каждого плана на доске)
export const PlanStateSchema = z.object({
  planNumber: z.number().min(0).max(72),
  isVisited: z.boolean().default(false),
  visitCount: z.number().default(0),
  lastVisited: z.date().optional(),
  hasReport: z.boolean().default(false),
  reportContent: z.string().optional(),
  specialAction: z.enum(['arrow', 'snake', 'victory', 'none']).optional()
});

// 🎯 Complete Game State Machine Schema
export const GameStateMachineSchema = z.object({
  // Current state
  currentState: GameStateTypeSchema,
  previousState: GameStateTypeSchema.optional(),
  
  // Sub-states
  diceRollState: DiceRollStateSchema,
  reportState: ReportStateSchema,
  
  // Game progress
  currentPlan: z.number().min(0).max(72),
  previousPlan: z.number().min(0).max(72).optional(),
  
  // Visited plans tracking
  planStates: z.array(PlanStateSchema),
  
  // Game mechanics state
  consecutiveSixes: z.number().min(0).max(3),
  positionBeforeThreeSixes: z.number().min(0).max(72),
  
  // Transition history
  transitionHistory: z.array(StateTransitionSchema),
  
  // Temporal data
  gameStarted: z.date().optional(),
  lastActivity: z.date(),
  estimatedCompletionTime: z.date().optional(),
  
  // Validation flags
  isValid: z.boolean(),
  validationErrors: z.array(z.string()),
  
  // Metadata
  metadata: z.record(z.unknown()).optional()
});

// 🔄 State Machine Configuration Schema
export const StateMachineConfigSchema = z.object({
  // Allowed transitions map
  allowedTransitions: z.record(
    GameStateTypeSchema,
    z.array(z.object({
      to: GameStateTypeSchema,
      trigger: z.string(),
      conditions: z.array(z.string()).optional(),
      validators: z.array(z.string()).optional()
    }))
  ),
  
  // State validation rules
  stateValidators: z.record(
    GameStateTypeSchema,
    z.object({
      requiredFields: z.array(z.string()),
      forbiddenFields: z.array(z.string()).optional(),
      customValidation: z.string().optional() // function name
    })
  ),
  
  // Automatic transitions
  automaticTransitions: z.array(z.object({
    fromState: GameStateTypeSchema,
    toState: GameStateTypeSchema,
    condition: z.string(), // function name
    delay: z.number().optional() // milliseconds
  })),
  
  // Error handling
  errorHandling: z.object({
    maxRetries: z.number().default(3),
    retryDelay: z.number().default(1000), // ms
    fallbackState: GameStateTypeSchema.default('error'),
    notificationEnabled: z.boolean().default(true)
  })
});

// ===============================
// 🔄 TYPE INFERENCE
// ===============================

export type GameStateType = z.infer<typeof GameStateTypeSchema>;
export type StateTransition = z.infer<typeof StateTransitionSchema>;
export type DiceRollState = z.infer<typeof DiceRollStateSchema>;
export type ReportState = z.infer<typeof ReportStateSchema>;
export type PlanState = z.infer<typeof PlanStateSchema>;
export type GameStateMachine = z.infer<typeof GameStateMachineSchema>;
export type StateMachineConfig = z.infer<typeof StateMachineConfigSchema>;

// ===============================
// 🎯 STATE MACHINE LOGIC
// ===============================

// State Transition Logic Validator
export const validateStateTransitionLogic = (
  from: GameStateType,
  to: GameStateType,
  trigger: string,
  context: Record<string, unknown>
): { isValid: boolean; error?: string } => {
  
  // Transition rules matrix
  const transitionRules: Record<GameStateType, Partial<Record<GameStateType, string[]>>> = {
    'uninitialized': {
      'waiting_to_start': ['player_init']
    },
    'waiting_to_start': {
      'playing': ['dice_roll'], // только при броске 6
      'error': ['error_occurred']
    },
    'playing': {
      'needs_report': ['dice_roll'], // когда нужен отчет
      'completed': ['dice_roll'], // достижение плана 68
      'paused': ['pause_game'],
      'error': ['error_occurred']
    },
    'needs_report': {
      'playing': ['report_submit'], // отчет принят
      'paused': ['pause_game'],
      'error': ['error_occurred']
    },
    'completed': {
      'uninitialized': ['state_reset'], // новая игра
      'error': ['error_occurred']
    },
    'paused': {
      'playing': ['resume_game'],
      'needs_report': ['resume_game'], // если был нужен отчет
      'error': ['error_occurred']
    },
    'error': {
      'uninitialized': ['state_reset'],
      'waiting_to_start': ['state_reset'],
      'playing': ['state_reset'],
      'needs_report': ['state_reset']
    }
  };

  const allowedTriggers = transitionRules[from]?.[to];
  
  if (!allowedTriggers || !allowedTriggers.includes(trigger)) {
    return {
      isValid: false,
      error: `Invalid transition from ${from} to ${to} with trigger ${trigger}`
    };
  }

  // Additional context-based validation
  if (from === 'waiting_to_start' && to === 'playing' && trigger === 'dice_roll') {
    const diceRoll = context.diceRoll as number;
    if (diceRoll !== 6) {
      return {
        isValid: false,
        error: 'Can only start game with dice roll of 6'
      };
    }
  }

  if (from === 'playing' && to === 'completed' && trigger === 'dice_roll') {
    const currentPlan = context.currentPlan as number;
    if (currentPlan !== 68) {
      return {
        isValid: false,
        error: 'Game can only be completed when reaching plan 68'
      };
    }
  }

  return { isValid: true };
};

// State Machine Factory
export const createGameStateMachine = (
  userId: string,
  initialState: GameStateType = 'uninitialized'
): GameStateMachine => ({
  currentState: initialState,
  diceRollState: 'ready',
  reportState: 'not_required',
  currentPlan: 68, // начальная позиция для нового игрока
  planStates: [],
  consecutiveSixes: 0,
  positionBeforeThreeSixes: 0,
  transitionHistory: [],
  lastActivity: new Date(),
  isValid: true,
  validationErrors: []
});

// State Machine Transition Function
export const transitionState = (
  machine: GameStateMachine,
  to: GameStateType,
  trigger: string,
  context: Record<string, unknown> = {}
): GameStateMachine => {
  
  const validation = validateStateTransitionLogic(machine.currentState, to, trigger, context);
  
  if (!validation.isValid) {
    return {
      ...machine,
      isValid: false,
      validationErrors: [...machine.validationErrors, validation.error!]
    };
  }

  const transition: StateTransition = {
    from: machine.currentState,
    to,
    trigger: trigger as any,
    timestamp: new Date()
  };

  return {
    ...machine,
    previousState: machine.currentState,
    currentState: to,
    transitionHistory: [...machine.transitionHistory, transition],
    lastActivity: new Date(),
    isValid: true,
    validationErrors: []
  };
};

// Advanced State Queries
export const getStateHistory = (machine: GameStateMachine): StateTransition[] => 
  machine.transitionHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

export const canTransitionTo = (
  machine: GameStateMachine, 
  targetState: GameStateType,
  trigger: string,
  context?: Record<string, unknown>
): boolean => 
  validateStateTransitionLogic(machine.currentState, targetState, trigger, context || {}).isValid;

export const getAvailableTransitions = (machine: GameStateMachine): Array<{
  to: GameStateType;
  triggers: string[];
}> => {
  // Implementation would check all possible transitions from current state
  return [];
};

// State Machine Analytics
export const analyzeStateMachine = (machine: GameStateMachine) => ({
  totalTransitions: machine.transitionHistory.length,
  timeInCurrentState: Date.now() - machine.lastActivity.getTime(),
  mostVisitedStates: getStateFrequency(machine.transitionHistory),
  averageStateTime: calculateAverageStateTime(machine.transitionHistory),
  gameProgress: calculateGameProgress(machine)
});

const getStateFrequency = (history: StateTransition[]): Record<GameStateType, number> => {
  return history.reduce((acc, transition) => {
    acc[transition.to] = (acc[transition.to] || 0) + 1;
    return acc;
  }, {} as Record<GameStateType, number>);
};

const calculateAverageStateTime = (history: StateTransition[]): number => {
  if (history.length < 2) return 0;
  
  let totalTime = 0;
  for (let i = 1; i < history.length; i++) {
    totalTime += history[i].timestamp.getTime() - history[i-1].timestamp.getTime();
  }
  
  return totalTime / (history.length - 1);
};

const calculateGameProgress = (machine: GameStateMachine): number => {
  // Progress based on plans visited and current position
  if (machine.currentPlan === 68) return 0; // Starting position
  if (machine.currentPlan >= 68) return 100; // Completed
  
  return Math.min((machine.currentPlan / 68) * 100, 100);
};

// ===============================
// 🛡️ VALIDATION HELPERS
// ===============================

export const validateGameStateMachine = (data: unknown) => GameStateMachineSchema.parse(data);
export const validateStateTransition = (data: unknown) => StateTransitionSchema.parse(data);
export const validateStateMachineConfig = (data: unknown) => StateMachineConfigSchema.parse(data);

// Safe parsers
export const safeParseGameStateMachine = (data: unknown) => GameStateMachineSchema.safeParse(data);
export const safeParseStateTransition = (data: unknown) => StateTransitionSchema.safeParse(data); 
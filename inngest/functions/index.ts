// Экспорт всех Inngest функций
export { processDiceRoll } from './processDiceRoll';
export { processReport } from './processReport';
export { updatePlayerState, initializePlayer } from './playerStateHandler';

// Массив всех функций для удобного импорта
import { processDiceRoll } from './processDiceRoll';
import { processReport } from './processReport';
import { updatePlayerState, initializePlayer } from './playerStateHandler';

export const functions = [
  processDiceRoll,
  processReport,
  updatePlayerState,
  initializePlayer
]; 
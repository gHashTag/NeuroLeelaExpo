import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InngestTestEngine } from '@inngest/test';
import { processReport } from '../../inngest/functions/processReport';
import './setup';

describe('processReport Inngest Function', () => {
  let testEngine: InngestTestEngine;

  beforeEach(() => {
    testEngine = new InngestTestEngine({
      function: processReport,
    });
    vi.clearAllMocks();
  });

  it('should process report successfully and unlock dice', async () => {
    const mockEvent = {
      name: 'game.report.submit',
      data: {
        userId: 'test-user-1',
        report: 'Мой отчет о прохождении плана 15. Узнал много нового о себе.',
        planNumber: 15
      }
    };

    const { result } = await testEngine.execute({
      events: [mockEvent],
      steps: [
        {
          id: 'save-report',
          handler: () => ({
            user_id: 'test-user-1',
            plan_number: 15,
            report_text: 'Мой отчет о прохождении плана 15. Узнал много нового о себе.',
            created_at: '2024-01-01T00:00:00.000Z',
            ai_response: null
          })
        },
        {
          id: 'unlock-dice',
          handler: () => ({
            needsReport: false,
            message: 'Отчет принят! Теперь можете продолжить игру.'
          })
        }
      ]
    });

    expect(result).toBeDefined();
    expect((result as any).success).toBe(true);
    expect((result as any).userId).toBe('test-user-1');
    expect((result as any).planNumber).toBe(15);
    expect((result as any).reportSaved).toBe(true);
    expect((result as any).diceUnlocked).toBe(true);
  });

  it('should verify sendEvent is called for state update', async () => {
    const mockEvent = {
      name: 'game.report.submit',
      data: {
        userId: 'test-user-2',
        report: 'Краткий отчет о плане 22',
        planNumber: 22
      }
    };

    const { ctx } = await testEngine.execute({
      events: [mockEvent],
      steps: [
        {
          id: 'save-report',
          handler: () => ({ success: true })
        },
        {
          id: 'unlock-dice',
          handler: () => ({ success: true })
        }
      ]
    });

    expect(ctx.step.sendEvent).toHaveBeenCalledWith(
      'send-state-update',
      expect.objectContaining({
        name: 'game.player.state.update',
        data: expect.objectContaining({
          userId: 'test-user-2',
          updates: expect.objectContaining({
            needsReport: false
          })
        })
      })
    );
  });

  it('should handle save report errors', async () => {
    const mockEvent = {
      name: 'game.report.submit',
      data: {
        userId: 'error-user',
        report: 'Test report',
        planNumber: 5
      }
    };

    await expect(testEngine.execute({
      events: [mockEvent],
      steps: [
        {
          id: 'save-report',
          handler: () => {
            throw new Error('Database save failed');
          }
        }
      ]
    })).rejects.toThrow('Database save failed');
  });
}); 
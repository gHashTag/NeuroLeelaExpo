import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InngestTestEngine } from '@inngest/test';
import { updatePlayerState, initializePlayer } from '../../inngest/functions/playerStateHandler';
import './setup';

describe('PlayerStateHandler Functions', () => {
  describe('updatePlayerState', () => {
    let testEngine: InngestTestEngine;

    beforeEach(() => {
      testEngine = new InngestTestEngine({
        function: updatePlayerState,
      });
      vi.clearAllMocks();
    });

    it('should update Apollo state successfully', async () => {
      const mockEvent = {
        name: 'game.player.state.update',
        data: {
          userId: 'test-user-1',
          updates: {
            plan: 25,
            needsReport: false,
            message: 'Updated successfully'
          }
        }
      };

      const { result } = await testEngine.execute({
        events: [mockEvent],
        steps: [
          {
            id: 'update-apollo-state',
            handler: () => ({ success: true })
          }
        ]
      });

      expect((result as any).success).toBe(true);
      expect((result as any).userId).toBe('test-user-1');
    });
  });

  describe('initializePlayer', () => {
    let testEngine: InngestTestEngine;

    beforeEach(() => {
      testEngine = new InngestTestEngine({
        function: initializePlayer,
      });
      vi.clearAllMocks();
    });

    it('should create new player', async () => {
      const mockEvent = {
        name: 'game.player.create',
        data: {
          userId: 'new-user',
          email: 'new@example.com'
        }
      };

      const { result } = await testEngine.execute({
        events: [mockEvent],
        steps: [
          {
            id: 'check-existing-player',
            handler: () => null
          },
          {
            id: 'create-new-player',
            handler: () => ({
              id: 'new-user',
              plan: 68,
              isFinished: true
            })
          }
        ]
      });

      expect((result as any).success).toBe(true);
      expect((result as any).playerCreated).toBe(true);
    });
  });
}); 
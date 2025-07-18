import { inngest } from '@/inngest/client';

/**
 * Сервис для отправки игровых событий в Inngest
 * Заменяет прямые вызовы GameService из UI компонентов
 */
export class InngestEventService {
  
  /**
   * Отправка события броска кубика
   */
  static async sendDiceRoll(userId: string, roll: number) {
    console.log(`[InngestEventService] Отправка события броска кубика: userId=${userId}, roll=${roll}`);
    
    try {
      const result = await inngest.send({
        name: 'game.dice.roll',
        data: {
          userId,
          roll,
          timestamp: Date.now()
        }
      });
      
      console.log(`[InngestEventService] Событие броска кубика отправлено:`, result);
      return { success: true, eventId: result.ids[0] };
    } catch (error) {
      console.error(`[InngestEventService] Ошибка отправки события броска кубика:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Отправка события отчета игрока
   */
  static async sendPlayerReport(userId: string, report: string, planNumber: number) {
    console.log(`[InngestEventService] Отправка отчета: userId=${userId}, planNumber=${planNumber}`);
    
    try {
      const result = await inngest.send({
        name: 'game.report.submit',
        data: {
          userId,
          report,
          planNumber,
          timestamp: Date.now()
        }
      });
      
      console.log(`[InngestEventService] Событие отчета отправлено:`, result);
      return { success: true, eventId: result.ids[0] };
    } catch (error) {
      console.error(`[InngestEventService] Ошибка отправки отчета:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Отправка события инициализации игрока
   */
  static async sendPlayerInit(userId: string, email?: string) {
    console.log(`[InngestEventService] Инициализация игрока: userId=${userId}, email=${email}`);
    
    try {
      const result = await inngest.send({
        name: 'game.player.init',
        data: {
          userId,
          email,
          timestamp: Date.now()
        }
      });
      
      console.log(`[InngestEventService] Событие инициализации игрока отправлено:`, result);
      return { success: true, eventId: result.ids[0] };
    } catch (error) {
      console.error(`[InngestEventService] Ошибка инициализации игрока:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Отправка события обновления состояния игрока
   */
  static async sendPlayerStateUpdate(userId: string, updates: any) {
    console.log(`[InngestEventService] Обновление состояния игрока: userId=${userId}`);
    
    try {
      const result = await inngest.send({
        name: 'game.player.state.update',
        data: {
          userId,
          updates,
          timestamp: Date.now()
        }
      });
      
      console.log(`[InngestEventService] Событие обновления состояния отправлено:`, result);
      return { success: true, eventId: result.ids[0] };
    } catch (error) {
      console.error(`[InngestEventService] Ошибка обновления состояния:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Батчевая отправка нескольких событий
   */
  static async sendEvents(events: Array<{
    name: string;
    data: any;
  }>) {
    console.log(`[InngestEventService] Отправка ${events.length} событий батчем`);
    
    try {
      const eventsWithTimestamp = events.map(event => ({
        ...event,
        data: {
          ...event.data,
          timestamp: Date.now()
        }
      }));

      const result = await inngest.send(eventsWithTimestamp);
      
      console.log(`[InngestEventService] Батч событий отправлен:`, result);
      return { success: true, eventIds: result.ids };
    } catch (error) {
      console.error(`[InngestEventService] Ошибка отправки батча событий:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
} 
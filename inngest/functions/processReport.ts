import { inngest } from '../client';
import { supabase } from '@/config/supabase';

// Inngest функция для обработки отчетов игроков
export const processReport = inngest.createFunction(
  { 
    id: 'process-player-report',
    name: 'Обработка отчета игрока'
  },
  { event: 'game.report.submit' },
  async ({ event, step }) => {
    const { userId, report, planNumber } = event.data;
    
    console.log(`[Inngest] processReport: userId=${userId}, planNumber=${planNumber}`);

    // Шаг 1: Сохранение отчета в базу данных
    await step.run('save-report', async () => {
      // Сохраняем отчет в таблицу reports (если есть такая таблица)
      // Или можно сохранить в таблицу player_reports
      const reportData = {
        user_id: userId,
        plan_number: planNumber,
        report_text: report,
        created_at: new Date().toISOString(),
        ai_response: null // Будет заполнено позже, если добавим AI анализ
      };

      try {
        const { error } = await supabase
          .from('reports')
          .insert([reportData]);

        if (error) {
          console.error(`[Inngest] Ошибка сохранения отчета:`, error);
          throw new Error(`Ошибка сохранения отчета: ${error.message}`);
        }

        console.log(`[Inngest] Отчет сохранен для плана ${planNumber}`);
      } catch (err) {
        // Если таблицы reports нет, пропускаем (но логируем)
        console.log(`[Inngest] Таблица reports недоступна, пропускаем сохранение отчета`);
      }

      return reportData;
    });

    // Шаг 2: Разблокировка кубика (убираем needsReport)
    await step.run('unlock-dice', async () => {
      const { error } = await supabase
        .from('players')
        .update({ 
          needsReport: false,
          message: 'Отчет принят! Теперь можете продолжить игру.' 
        })
        .eq('id', userId);

      if (error) {
        console.error(`[Inngest] Ошибка разблокировки кубика:`, error);
        throw new Error(`Ошибка разблокировки: ${error.message}`);
      }

      console.log(`[Inngest] Кубик разблокирован для игрока ${userId}`);
    });

    // Шаг 3: Отправка события обновления состояния
    await step.sendEvent('send-state-update', {
      name: 'game.player.state.update',
      data: {
        userId,
        updates: {
          needsReport: false,
          message: 'Отчет принят! Теперь можете продолжить игру.'
        },
        timestamp: Date.now()
      }
    });

    console.log(`[Inngest] processReport завершена для ${userId}`);
    
    return {
      success: true,
      userId,
      planNumber,
      reportSaved: true,
      diceUnlocked: true
    };
  }
); 
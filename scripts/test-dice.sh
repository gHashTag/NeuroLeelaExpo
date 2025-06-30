#!/bin/bash

# 🎲 Скрипт тестирования кубика NeuroLeela

echo "🎲🎲🎲 ДИАГНОСТИКА КУБИКА NEUROLEELA 🎲🎲🎲"
echo "================================================"

# Проверяем состояние серверов
echo "📊 Проверка состояния серверов..."

echo -n "📱 Expo/Metro сервер (8081): "
if lsof -i :8081 >/dev/null 2>&1; then
    echo "✅ ЗАПУЩЕН"
else
    echo "❌ НЕ ЗАПУЩЕН"
fi

echo -n "🔮 Inngest сервер (8288): "  
if lsof -i :8288 >/dev/null 2>&1; then
    echo "✅ ЗАПУЩЕН"
else
    echo "❌ НЕ ЗАПУЩЕН"
fi

echo -n "🚀 Node.js/Bun сервер (3001): "
if lsof -i :3001 >/dev/null 2>&1; then
    echo "✅ ЗАПУЩЕН" 
else
    echo "❌ НЕ ЗАПУЩЕН"
fi

echo ""
echo "🔍 ИНСТРУКЦИИ ПО ТЕСТИРОВАНИЮ:"
echo "1. Откройте http://localhost:8081 в браузере"
echo "2. Перейдите на экран игры"
echo "3. Откройте консоль разработчика (F12)"
echo "4. Нажмите на кубик"
echo "5. Ищите логи с префиксом: 🎲🎲🎲"

echo ""
echo "📋 ОЖИДАЕМЫЕ ЛОГИ ПРИ НАЖАТИИ КУБИКА:"
echo "🎲🎲🎲 [DiceButton-ДИАГНОСТИКА] TouchableOpacity onPress СРАБОТАЛ!!!"
echo "🎲🎲🎲 [DiceButton-ДИАГНОСТИКА] handleRoll: КНОПКА КУБИКА НАЖАТА!!!"
echo "🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: Функция вызвана!"

echo ""
echo "🛠️ ДИАГНОСТИЧЕСКИЕ КОМАНДЫ:"
echo "- Мониторинг Inngest логов: tail -f inngest-cli.log"
echo "- Перезапуск серверов: bun dev"
echo "- Проверка TypeScript: bun exec tsc --noEmit"

echo ""
echo "📖 Подробный план: см. DICE_DIAGNOSTIC_PLAN.md"
echo "================================================" 
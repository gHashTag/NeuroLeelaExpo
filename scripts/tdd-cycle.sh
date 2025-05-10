#!/bin/bash

# 🕉️ TDD-цикл: проверка типов + тесты (Vitest)
# Использование: bash scripts/tdd-cycle.sh [путь_к_тесту]

set -e

TEST_PATH=${1:-}

echo "🧘‍♂️ Шаг 1: Проверка типов..."
bun exec tsc --noEmit

echo "🧘‍♂️ Шаг 2: Запуск тестов (Vitest)..."
if [ -z "$TEST_PATH" ]; then
  bunx vitest run
else
  bunx vitest run "$TEST_PATH"
fi

echo "✅ Всё чисто: типы и тесты зелёные!" 
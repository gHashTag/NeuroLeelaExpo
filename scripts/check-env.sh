#!/bin/bash

ENV_FILE="/Users/playom/NeuroLeelaExpo/.env"

echo "###################################################"
echo "# 🕉️  Диагностика файла .env для ключей Supabase  🕉️ #"
echo "###################################################"
echo ""
echo "ℹ️  Путь к проверяемому файлу: $ENV_FILE"
echo ""

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ КРИТИЧЕСКАЯ ОШИБКА: Файл .env НЕ НАЙДЕН по пути $ENV_FILE"
  echo "   Пожалуйста, убедитесь, что файл .env существует в корне проекта."
  exit 1
fi

echo "🔍 Проверка EXPO_PUBLIC_SUPABASE_URL..."
URL_LINE=$(grep "^EXPO_PUBLIC_SUPABASE_URL=" "$ENV_FILE")

if [ -n "$URL_LINE" ]; then
  echo "  ✅ Найдена строка: $URL_LINE"
  URL_VALUE=$(echo "$URL_LINE" | cut -d'=' -f2-)
  if [ -z "$URL_VALUE" ]; then
    echo "  ⚠️  ПРЕДУПРЕЖДЕНИЕ: EXPO_PUBLIC_SUPABASE_URL найдена, но ее ЗНАЧЕНИЕ ПУСТОЕ!"
  else
    echo "  👍 Значение EXPO_PUBLIC_SUPABASE_URL присутствует."
  fi
else
  echo "  ❌ ОШИВКА: Строка EXPO_PUBLIC_SUPABASE_URL= НЕ НАЙДЕНА в файле $ENV_FILE!"
  echo "     Убедитесь, что переменная названа корректно (с префиксом EXPO_PUBLIC_)."
fi
echo ""

echo "🔍 Проверка EXPO_PUBLIC_SUPABASE_ANON_KEY..."
KEY_LINE=$(grep "^EXPO_PUBLIC_SUPABASE_ANON_KEY=" "$ENV_FILE")

if [ -n "$KEY_LINE" ]; then
  echo "  ✅ Найдена строка: $KEY_LINE"
  KEY_VALUE=$(echo "$KEY_LINE" | cut -d'=' -f2-)
  if [ -z "$KEY_VALUE" ]; then
    echo "  ⚠️  ПРЕДУПРЕЖДЕНИЕ: EXPO_PUBLIC_SUPABASE_ANON_KEY найдена, но ее ЗНАЧЕНИЕ ПУСТОЕ!"
  else
    echo "  👍 Значение EXPO_PUBLIC_SUPABASE_ANON_KEY присутствует."
  fi
else
  echo "  ❌ ОШИВКА: Строка EXPO_PUBLIC_SUPABASE_ANON_KEY= НЕ НАЙДЕНА в файле $ENV_FILE!"
  echo "     Убедитесь, что переменная названа корректно (с префиксом EXPO_PUBLIC_)."
fi
echo ""
echo "✨ Диагностика .env завершена." 
#!/bin/bash

# Список папок с JSON файлами
folders=("ar" "de" "es" "hi" "jv" "mr" "pa" "ru" "te" "uk" "vi" "bn" "en" "fr" "ja" "ko" "ms" "pt" "ta" "tr" "ur" "zh")

# Перебор папок
for folder in "${folders[@]}"; do
  echo "Checking JSON files in folder: $folder"
  
  # Перебор JSON файлов в папке
  for file in "$folder"/*.json; do
    echo "Checking file: $file"
    
    # Проверка файла с использованием python
    python3 -m json.tool "$PWD/$file"

    
    # Если python сообщает об ошибке, можно также попробовать jq
    # cat "$file" | jq .
  done
  
  echo "Finished checking files in folder: $folder"
done

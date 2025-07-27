#!/bin/bash

# Скрипт для сборки и упаковки расширения

# Имя выходного файла (без .zip)
OUTPUT_NAME="api_key_hunter"

# Директория для сборки
DIST_DIR="dist"

# Временная директория для сборки
BUILD_DIR="$DIST_DIR/build"

# Файл архива
ZIP_FILE="$DIST_DIR/$OUTPUT_NAME.zip"

# Создаем директорию для сборки, если ее нет
mkdir -p $BUILD_DIR

# Копируем все необходимые файлы
cp manifest.json background.js content.js injected.js options.css options.html options.js popup.css popup.html popup.js README.md $BUILD_DIR

# Переходим в директорию сборки
cd $BUILD_DIR

# Упаковываем в zip-архив
zip -r ../$OUTPUT_NAME.zip .

# Возвращаемся обратно
cd ../..

# Очищаем временную директорию
rm -rf $BUILD_DIR

echo "Расширение успешно упаковано в $ZIP_FILE"
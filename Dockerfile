# Stage 1: Install Node.js and build frontend
FROM node:14 as frontend-builder

# Установите рабочую директорию
WORKDIR /app/frontend

# Копируйте package.json и package-lock.json для установки зависимостей Node.js
COPY frontend/package*.json ./

# Установите зависимости для Node.js
RUN npm install

# Копируйте и постройте исходный код фронтенда
COPY frontend/ .
RUN npm run build

# Stage 2: Install Python and set up backend
FROM python:3.10-slim

# Установите рабочую директорию в контейнере
WORKDIR /app

# Копируйте файлы зависимостей для Python
COPY backend/requirements.txt ./backend/requirements.txt

# Обновите pip и установите зависимости для Python
RUN pip install --upgrade pip && pip install --no-cache-dir -r ./backend/requirements.txt

# Копируйте исходный код приложения в рабочую директорию
COPY backend/ ./backend/

# Копируйте собранный фронтенд из первого этапа
COPY --from=frontend-builder /app/frontend/build ./frontend/build

# Сделайте порт доступным снаружи контейнера
EXPOSE 5001

# Запуск приложения
CMD ["flask", "run", "--host=0.0.0.0", "--port=5001"]

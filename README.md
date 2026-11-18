# VK Audience Hunter

Веб-приложение для поиска и аналитики открытых сообществ VK и подготовки community-аудиторий для VK Ads.

## Текущий состав
- Frontend: React + TypeScript + Vite (файлы в корне репозитория).
- Backend: Python + FastAPI (main.py, vk_client.py, config.py).
- VK API: серверный адаптер для метода groups.search.
- Database: SQL-заготовка PostgreSQL в schema.sql; подключение к БД ещё не реализовано.
- Deployment: GitHub Pages для frontend; Docker + Render Blueprint для backend.

## Локальный запуск

### Backend
Требуется Python 3.11+.
```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API: http://127.0.0.1:8000
Проверка: http://127.0.0.1:8000/api/health
Swagger: http://127.0.0.1:8000/docs

### Frontend
В другом терминале:
```bash
npm install
npm run dev
```
Frontend: http://localhost:5173

Для production задайте переменную сборки VITE_API_BASE_URL с URL опубликованного backend. Без неё интерфейс на GitHub Pages сообщит, что API ещё не подключён.

## Публикация backend через Render
В Render можно создать Blueprint из этого репозитория — конфигурация находится в render.yaml. Сборка Docker описана в Dockerfile.
После публикации добавьте GitHub Actions repository variable VITE_API_BASE_URL со значением URL backend. Добавьте домен backend в CORS allowlist в main.py и запустите новую сборку Pages.
Для реального поиска VK задайте серверную переменную окружения VK_ACCESS_TOKEN. Не помещайте токен в frontend, исходники, GitHub или публичные файлы.

## Данные и безопасность
Приложение работает с открытыми данными сообществ и не собирает списки участников, персональные ID или персональные профили. Для таргетинга используйте разрешённые инструменты VK Ads.

## Статус
Frontend собирается через GitHub Actions. Backend подготовлен к Docker-развёртыванию, но ещё не опубликован. PostgreSQL пока представлен схемой, без подключения приложения к базе.
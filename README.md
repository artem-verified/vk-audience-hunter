# VK Audience Hunter

Веб-проект для поиска и аналитики публичных сообществ VK и подготовки community-аудиторий для VK Ads.

## Стек
- Frontend: React + TypeScript + Vite
- Backend: Python + FastAPI
- Database: PostgreSQL (схема в `backend/schema.sql`)
- VK API: серверная интеграция, токен хранится только на backend

## Важно
Проект не выгружает списки участников чужих сообществ, не собирает персональные ID и не строит персональные профили. Он работает с данными сообществ и разрешёнными агрегированными показателями. Для рекламного таргетинга используйте штатный community targeting в VK Ads.

## Запуск

### Backend
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API: http://127.0.0.1:8000  
Swagger: http://127.0.0.1:8000/docs

### Frontend
В отдельном терминале:
```bash
cd frontend
npm install
npm run dev
```
Frontend: http://localhost:5173

## Подключение VK API
1. Создайте приложение/получите токен в официальном кабинете VK для подходящего сценария.
2. Скопируйте `backend/.env.example` в `backend/.env`.
3. Укажите `VK_ACCESS_TOKEN` и актуальную `VK_API_VERSION`.
4. Никогда не помещайте токен в frontend, GitHub или публичные репозитории.

В текущей заготовке поиск демонстрационный. Backend уже содержит серверный адаптер `groups.search`; после добавления токена можно включить реальные запросы.

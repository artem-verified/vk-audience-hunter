@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo       VK AUDIENCE HUNTER - LOCAL
echo ==========================================

where python >nul 2>nul
if errorlevel 1 (
  echo Python was not found. Install Python 3.11+ and try again.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js and npm were not found. Install Node.js LTS and try again.
  pause
  exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
  echo Creating Python environment...
  python -m venv .venv
  if errorlevel 1 pause & exit /b 1
)

call ".venv\Scripts\activate.bat"
echo Installing/checking backend packages...
python -m pip install -r requirements.txt
if errorlevel 1 pause & exit /b 1

if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo Created .env. Add your VK token there to enable live search.
)

if not exist "node_modules" (
  echo Installing frontend packages...
  call npm install
  if errorlevel 1 pause & exit /b 1
)

start "VK Audience Hunter API" cmd /k "cd /d ""%~dp0"" && call .venv\Scripts\activate.bat && uvicorn main:app --reload"
start "VK Audience Hunter Frontend" cmd /k "cd /d ""%~dp0"" && npm run dev"

timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"
echo.
echo The app should open at http://localhost:5173
echo Keep both terminal windows open while using it.
echo Search history is saved in the local data folder.
endlocal

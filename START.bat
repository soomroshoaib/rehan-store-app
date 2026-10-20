@echo off
cd /d "%~dp0"
echo ===== Rehan Store =====
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install the LTS version from nodejs.org, then run this file again.
  pause
  exit /b
)

if not exist "server\node_modules" (
  echo Installing backend packages...
  pushd server
  call npm install
  popd
)
if not exist "client\node_modules" (
  echo Installing frontend packages...
  pushd client
  call npm install
  popd
)

start "Rehan Store - BACKEND (do not close)" cmd /k "cd /d %~dp0server && npm run dev"
start "Rehan Store - FRONTEND (do not close)" cmd /k "cd /d %~dp0client && npm run dev"

echo The browser will open in 15 seconds...
timeout /t 15 >nul
start http://localhost:5173

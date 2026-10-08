@echo off
setlocal
cd /d "%~dp0"

set "NPM=%ProgramFiles%\nodejs\npm.cmd"
set "PATH=%ProgramFiles%\nodejs;%PATH%"
if not exist "%NPM%" (
  echo Node.js was not found at "%NPM%".
  echo Install Node.js LTS, reopen VS Code, and run this file again.
  exit /b 1
)

if not exist "node_modules" (
  echo Installing workspace dependencies...
  call "%NPM%" install
  if errorlevel 1 exit /b %errorlevel%
)

echo Generating Prisma client...
call "%NPM%" run db:generate
if errorlevel 1 exit /b %errorlevel%

echo Starting ContentRewards web and API...
call "%NPM%" run dev

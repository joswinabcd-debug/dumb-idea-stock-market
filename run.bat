@echo off
setlocal enableextensions enabledelayedexpansion
title Next.js Project Runner - my-website

:menu
cls
echo ===================================================
echo               Next.js Project Menu                 
echo ===================================================
echo.
echo   1. Start Development Server (npm run dev)
echo   2. Build for Production     (npm run build)
echo   3. Start Production Server  (npm run start)
echo   4. Run Linter               (npm run lint)
echo   5. Install Dependencies     (npm install)
echo   6. Exit
echo.
echo ===================================================
set /p choice="Select an option (1-6): "

if "%choice%"=="1" goto dev
if "%choice%"=="2" goto build
if "%choice%"=="3" goto start
if "%choice%"=="4" goto lint
if "%choice%"=="5" goto install
if "%choice%"=="6" goto end

echo Invalid option, please try again.
timeout /t 2 >nul
goto menu

:dev
cls
echo Starting Development Server...
echo Press Ctrl+C in terminal to stop server.
echo.
call npm run dev
echo.
pause
goto menu

:build
cls
echo Building Next.js Project...
echo.
call npm run build
echo.
pause
goto menu

:start
cls
echo Starting Production Server...
echo Press Ctrl+C in terminal to stop server.
echo.
call npm run start
echo.
pause
goto menu

:lint
cls
echo Running Linter...
echo.
call npm run lint
echo.
pause
goto menu

:install
cls
echo Installing Dependencies...
echo.
call npm install
echo.
pause
goto menu

:end
echo Goodbye!
exit /b 0

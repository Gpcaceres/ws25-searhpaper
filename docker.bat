@echo off
REM Script para gestionar la aplicación SearchPaper con Docker en Windows

setlocal enabledelayedexpansion

REM Colores no disponibles en cmd, usar texto simple
set "GREEN=[OK]"
set "BLUE=[INFO]"
set "RED=[ERROR]"

REM Detectar versión de Docker Compose
where docker-compose >nul 2>&1
if %errorlevel% == 0 (
    set DOCKER_COMPOSE=docker-compose
    echo %BLUE% Usando Docker Compose V1
) else (
    docker compose version >nul 2>&1
    if !errorlevel! == 0 (
        set DOCKER_COMPOSE=docker compose
        echo %BLUE% Usando Docker Compose V2
    ) else (
        echo %RED% Docker Compose no está instalado
        exit /b 1
    )
)

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="status" goto status
if "%1"=="clean" goto clean
if "%1"=="build" goto build
goto help

:help
echo %GREEN% SearchPaper - Gestión con Docker
echo.
echo Uso: docker.bat [comando]
echo.
echo Comandos disponibles:
echo   start      - Construir e iniciar los contenedores
echo   stop       - Detener los contenedores
echo   restart    - Reiniciar los contenedores
echo   logs       - Ver logs en tiempo real
echo   status     - Ver estado de los contenedores
echo   clean      - Detener y eliminar contenedores, volúmenes e imágenes
echo   build      - Reconstruir las imágenes
echo   help       - Mostrar esta ayuda
echo.
goto end

:start
echo %GREEN% Iniciando SearchPaper...
%DOCKER_COMPOSE% up --build -d
echo %GREEN% Aplicación iniciada
echo %BLUE% Frontend: http://localhost:8080
echo %BLUE% Backend API: http://localhost:3000
goto end

:stop
echo %GREEN% Deteniendo SearchPaper...
%DOCKER_COMPOSE% down
echo %GREEN% Aplicación detenida
goto end

:restart
echo %GREEN% Reiniciando SearchPaper...
%DOCKER_COMPOSE% restart
echo %GREEN% Aplicación reiniciada
goto end

:logs
echo %GREEN% Mostrando logs... (Ctrl+C para salir)
%DOCKER_COMPOSE% logs -f
goto end

:status
echo %GREEN% Estado de los contenedores:
%DOCKER_COMPOSE% ps
goto end

:clean
echo %RED% ¿Está seguro de eliminar todos los contenedores, volúmenes e imágenes? (S/N)
set /p response=
if /i "%response%"=="S" (
    echo %GREEN% Limpiando...
    %DOCKER_COMPOSE% down -v --rmi all
    echo %GREEN% Limpieza completada
) else (
    echo %BLUE% Operación cancelada
)
goto end

:build
echo %GREEN% Reconstruyendo imágenes...
%DOCKER_COMPOSE% build --no-cache
echo %GREEN% Imágenes reconstruidas
goto end

:end
endlocal

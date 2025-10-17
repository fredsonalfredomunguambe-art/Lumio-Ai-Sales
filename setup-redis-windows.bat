@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    LUMIO - Redis Setup for Windows
echo ========================================
echo.

:: Verificar se Redis já está rodando
echo Checking if Redis is already running...
netstat -an | findstr :6379 >nul
if %errorlevel% == 0 (
    echo ✅ Redis is already running on port 6379
    echo You can skip this setup
    pause
    exit /b 0
)

echo ❌ Redis is not running. Let's install it!
echo.

:: Verificar se Chocolatey está instalado
echo Checking for Chocolatey package manager...
choco --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Chocolatey...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Chocolatey. Please install manually.
        echo Go to: https://chocolatey.org/install
        pause
        exit /b 1
    )
    echo ✅ Chocolatey installed successfully!
    echo Please restart your terminal and run this script again.
    pause
    exit /b 0
)

echo ✅ Chocolatey is already installed

:: Instalar Redis
echo.
echo Installing Redis...
choco install redis-64 -y
if %errorlevel% neq 0 (
    echo ❌ Failed to install Redis via Chocolatey
    echo Trying alternative installation method...
    goto :manual_install
)

echo ✅ Redis installed successfully via Chocolatey

:: Configurar Redis como serviço
echo.
echo Configuring Redis as Windows Service...
sc create Redis binPath= "\"C:\Program Files\Redis\redis-server.exe\" --service-run --service-name Redis" start= auto
if %errorlevel% neq 0 (
    echo ⚠️  Could not create service, but Redis should still work
)

:: Iniciar Redis
echo.
echo Starting Redis service...
sc start Redis
if %errorlevel% neq 0 (
    echo ⚠️  Could not start service, trying to start manually...
    start "" "C:\Program Files\Redis\redis-server.exe"
)

:: Aguardar Redis inicializar
echo.
echo Waiting for Redis to start...
timeout /t 3 /nobreak >nul

:: Testar conexão
echo.
echo Testing Redis connection...
"C:\Program Files\Redis\redis-cli.exe" ping >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Redis is running successfully!
    echo.
    echo Redis Configuration:
    echo - Host: localhost
    echo - Port: 6379
    echo - No password required
    echo.
    echo Your env.local file is already configured correctly.
    echo You can now start your application!
) else (
    echo ❌ Redis connection test failed
    echo Please check the installation manually
)

goto :end

:manual_install
echo.
echo Manual Installation Instructions:
echo =================================
echo.
echo 1. Download Redis for Windows from:
echo    https://github.com/microsoftarchive/redis/releases
echo.
echo 2. Extract the files to C:\Redis\
echo.
echo 3. Add C:\Redis\ to your PATH environment variable
echo.
echo 4. Run: redis-server.exe
echo.
echo 5. Test with: redis-cli.exe ping
echo.
echo Alternative: Use Docker (Recommended)
echo =====================================
echo.
echo 1. Install Docker Desktop from:
echo    https://www.docker.com/products/docker-desktop/
echo.
echo 2. Run: docker compose up redis -d
echo.
echo This will start Redis in a container using your docker-compose.yml file.

:end
echo.
echo Installation complete! Press any key to exit...
pause >nul

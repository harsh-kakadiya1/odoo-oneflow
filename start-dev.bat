@echo off
echo.
echo ======================================
echo  Starting OneFlow Development Servers
echo ======================================
echo.

REM Check if node_modules exists in server
if not exist "server\node_modules\" (
    echo Installing server dependencies...
    cd server
    call npm install
    cd ..
)

REM Check if node_modules exists in client
if not exist "client\node_modules\" (
    echo Installing client dependencies...
    cd client
    call npm install
    cd ..
)

echo.
echo Starting backend server on port 5000...
start "OneFlow Backend" cmd /k "cd server && npm run dev"

timeout /t 5 /nobreak >nul

echo Starting frontend server on port 3000...
start "OneFlow Frontend" cmd /k "cd client && npm start"

echo.
echo ======================================
echo  OneFlow servers starting...
echo ======================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul


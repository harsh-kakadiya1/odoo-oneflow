#!/bin/bash

echo ""
echo "======================================"
echo " Starting OneFlow Development Servers"
echo "======================================"
echo ""

# Check if node_modules exists in server
if [ ! -d "server/node_modules" ]; then
    echo "Installing server dependencies..."
    cd server
    npm install
    cd ..
fi

# Check if node_modules exists in client
if [ ! -d "client/node_modules" ]; then
    echo "Installing client dependencies..."
    cd client
    npm install
    cd ..
fi

echo ""
echo "Starting servers in new terminal windows..."
echo ""

# Detect OS and open terminals accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/server\" && npm run dev"'
    sleep 3
    osascript -e 'tell app "Terminal" to do script "cd \"'$PWD'/client\" && npm start"'
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    gnome-terminal -- bash -c "cd server && npm run dev; exec bash" &
    sleep 3
    gnome-terminal -- bash -c "cd client && npm start; exec bash" &
else
    # Fallback - run in background
    cd server && npm run dev &
    sleep 3
    cd client && npm start &
fi

echo "======================================"
echo " OneFlow servers starting..."
echo "======================================"
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""


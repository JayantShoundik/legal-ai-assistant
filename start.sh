#!/bin/bash

# ============================================
# Vidhan.ai — One-Click Starter
# ============================================

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/python-backend"
FRONTEND="$ROOT/frontend"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}⚖️  Starting Vidhan.ai...${NC}"
echo "----------------------------------------"

# --- Kill any old processes on ports 9000 and 5173 ---
echo -e "${YELLOW}🧹 Cleaning up old processes...${NC}"
lsof -ti:9000 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
sleep 1

# --- Check Python ---
if ! command -v python3 &>/dev/null; then
  echo -e "${RED}❌ python3 not found. Install it first.${NC}"
  exit 1
fi

# --- Check Node ---
if ! command -v node &>/dev/null; then
  echo -e "${RED}❌ node not found. Install it first.${NC}"
  exit 1
fi

# --- Check ffmpeg ---
if ! command -v ffmpeg &>/dev/null && ! [ -f /opt/homebrew/bin/ffmpeg ]; then
  echo -e "${RED}❌ ffmpeg not found. Run: brew install ffmpeg${NC}"
  exit 1
fi

# --- Install Python deps if needed ---
echo -e "${YELLOW}📦 Checking Python dependencies...${NC}"
cd "$BACKEND"
pip3 install -q fastapi uvicorn google-generativeai chromadb pypdf \
  sentence-transformers python-dotenv python-multipart requests 2>/dev/null

# --- Install Node deps if needed ---
echo -e "${YELLOW}📦 Checking Node dependencies...${NC}"
cd "$FRONTEND"
npm install --silent 2>/dev/null

# --- Start Backend ---
echo -e "${GREEN}🚀 Starting Python Backend on port 9000...${NC}"
cd "$BACKEND"
uvicorn main:app --reload --port 9000 > "$ROOT/backend.log" 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo -n "   Waiting for backend"
for i in {1..20}; do
  sleep 1
  echo -n "."
  if curl -s http://localhost:9000/ > /dev/null 2>&1; then
    echo -e " ${GREEN}Ready!${NC}"
    break
  fi
  if [ $i -eq 20 ]; then
    echo -e " ${RED}Timeout! Check backend.log for errors.${NC}"
    cat "$ROOT/backend.log" | tail -20
    exit 1
  fi
done

# --- Start Frontend ---
echo -e "${GREEN}🌐 Starting React Frontend on port 5173...${NC}"
cd "$FRONTEND"
npm run dev > "$ROOT/frontend.log" 2>&1 &
FRONTEND_PID=$!

sleep 2
echo ""
echo "========================================"
echo -e "${GREEN}✅ Vidhan.ai is LIVE!${NC}"
echo ""
echo -e "   🌐 App:     ${GREEN}http://localhost:5173${NC}"
echo -e "   🔧 API:     ${GREEN}http://localhost:9000${NC}"
echo -e "   📋 API Docs:${GREEN}http://localhost:9000/docs${NC}"
echo ""
echo -e "   Backend log:  tail -f $ROOT/backend.log"
echo -e "   Frontend log: tail -f $ROOT/frontend.log"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop everything.${NC}"
echo "========================================"

# --- Open browser ---
sleep 2
open "http://localhost:5173" 2>/dev/null

# --- Wait and cleanup on Ctrl+C ---
trap "echo ''; echo -e '${RED}🛑 Shutting down Vidhan.ai...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; lsof -ti:9000 | xargs kill -9 2>/dev/null; lsof -ti:5173 | xargs kill -9 2>/dev/null; echo 'Done.'; exit 0" SIGINT SIGTERM

wait

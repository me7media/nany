#!/bin/bash

export OPENAI_API_KEY="sk-proj-"

echo "▶️ Запуск TTS (Python 3.11)..."
python3.11 -m uvicorn tts_server:app --host 0.0.0.0 --port 5001 &

sleep 2

echo "▶️ Запуск Nanny (Node.js)..."
npm start
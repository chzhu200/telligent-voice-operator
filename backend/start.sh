#!/bin/bash
set -e
pip install -r requirements.txt -q
echo "Starting Telligent backend on http://localhost:8000"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

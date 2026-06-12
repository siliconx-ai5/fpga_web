#!/usr/bin/env bash
set -euo pipefail

echo "Setting up frontend dev environment..."
cd frontend
if [ -f package.json ]; then
  echo "Installing npm dependencies (this may take a moment)..."
  npm install
  echo "Starting dev server..."
  npm run dev
else
  echo "package.json not found in frontend/"
  exit 1
fi

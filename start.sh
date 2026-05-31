#!/usr/bin/env bash
# Launches the Task Dashboard (Next.js) dev server using the project-local Node.
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="/Users/nihalreddygurrala/Workspace/.tools/node-v22.14.0-darwin-arm64/bin:$PATH"
cd "$SCRIPT_DIR"

if [ ! -f .env.local ] && [ ! -f .env ]; then
  echo "⚠️  No .env.local found. Copy .env.example to .env.local and set DATABASE_URL + APP_SECRET first."
fi

echo "Starting TaskFlow at http://localhost:3000 …"
npm run dev

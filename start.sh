#!/usr/bin/env bash
# Launches the Task Dashboard dev server using the project-local Node runtime.
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="/Users/nihalreddygurrala/Workspace/.tools/node-v22.14.0-darwin-arm64/bin:$PATH"
cd "$SCRIPT_DIR"
echo "Starting Task Dashboard at http://localhost:5173 …"
npm run dev

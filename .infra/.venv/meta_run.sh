#!/bin/bash
set -e
venvDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Load env variables if they exist
envFile="$venvDir/../../.env"
if [ -f "$envFile" ]; then
    # Parse .env file ignoring comments and empty lines
    export $(grep -v '^#' "$envFile" | xargs)
fi

# Ensure python executable exists
pythonExec="$venvDir/bin/python"
if [ ! -f "$pythonExec" ]; then
    echo "[!] Virtual environment not found at $venvDir"
    echo "    Please run the setup/build scripts to initialize the .venv"
    exit 1
fi

# Run python using virtual environment interpreter
export PYTHONIOENCODING="utf-8"
exec "$pythonExec" "$@"

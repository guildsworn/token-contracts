#!/usr/bin/env bash

set -euo pipefail

if [ "${SKIP_COMPILE:-}" == true ]; then
  exit
fi

yarn run clean
env COMPILE_MODE=production yarn run compile
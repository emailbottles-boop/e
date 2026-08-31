#!/usr/bin/env bash
# Thin wrapper — the real implementation is scripts/deploy.js, so macOS,
# Linux and Windows all run the identical code path.
exec node "$(dirname "$0")/scripts/deploy.js" "$@"

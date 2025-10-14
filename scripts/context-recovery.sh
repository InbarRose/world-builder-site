#!/usr/bin/env bash
set -e
echo "🚀 world-builder-site: Context Recovery"
echo "====================================="
echo "Project root: $(pwd)"
echo ""
echo "PROJECT_CONTEXT.md (top 40 lines):"
sed -n '1,120p' PROJECT_CONTEXT.md || true
echo ""
echo "Current session state:"
sed -n '1,200p' docs/SESSION_STATE.md || true
echo ""
echo "Phase 0 spec:"
sed -n '1,200p' docs/phase-0-specifications.md || true
echo ""
echo "To continue, open the above files and run the next task from SESSION_STATE.md"

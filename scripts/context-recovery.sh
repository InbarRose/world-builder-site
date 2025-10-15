#!/usr/bin/env bash
set -e

echo "🚀 world-builder-site: Enhanced Context Recovery"
echo "================================================"
echo "Project root: $(pwd)"
echo "Timestamp: $(date)"
echo ""

# Generate structured context
echo "📊 Generating structured context..."
python3 scripts/context-serialize.py

echo ""
echo "📋 Quick Status Summary:"
echo "------------------------"

# Check current phase
if [ -f "docs/SESSION_STATE.md" ]; then
    CURRENT_PHASE=$(grep -E "Current Phase|status:" docs/SESSION_STATE.md | head -1 | sed 's/.*: *//' | sed 's/—.*//' | xargs)
    echo "Current Phase: $CURRENT_PHASE"
else
    echo "Current Phase: Unknown (missing SESSION_STATE.md)"
fi

# Check progress
if [ -f "docs/SESSION_STATE.md" ]; then
    PROGRESS=$(grep "Progress:" docs/SESSION_STATE.md | sed 's/.*Progress: *//' | sed 's/%.*//' | xargs)
    echo "Progress: ${PROGRESS}%"
fi

# Check dependencies
echo ""
echo "🔧 Environment Status:"
if command -v poetry &> /dev/null; then
    echo "  Poetry: ✅ Available"
    if poetry check &> /dev/null; then
        echo "  Dependencies: ✅ Installed"
    else
        echo "  Dependencies: ❌ Not installed"
    fi
else
    echo "  Poetry: ❌ Not available"
fi

if [ -f ".env" ]; then
    echo "  Environment: ✅ .env file exists"
else
    echo "  Environment: ❌ .env file missing"
fi

# Check critical files
echo ""
echo "📁 Critical Files Status:"
CRITICAL_FILES=("src/app/main.py" "pyproject.toml" "tests/conftest.py")
for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  $file: ✅"
    else
        echo "  $file: ❌ Missing"
    fi
done

# Show next steps
echo ""
echo "🎯 Immediate Next Steps:"
if [ -f "docs/SESSION_STATE.md" ]; then
    echo "From SESSION_STATE.md:"
    grep -A 5 "Immediate Next Steps" docs/SESSION_STATE.md | tail -n +2 | sed 's/^/  /'
fi

echo ""
echo "📖 For detailed context, check:"
echo "  - docs/agent-context.json (structured data)"
echo "  - docs/SESSION_STATE.md (current phase)"
echo "  - docs/PROGRESS.md (task tracking)"
echo ""
echo "🛠️  Available Commands:"
echo "  - ./scripts/setup-dev.sh (setup environment)"
echo "  - ./scripts/quality-gate.py (run quality checks)"
echo "  - ./scripts/agent-workflow.sh (complete agent workflow)"

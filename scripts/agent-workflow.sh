#!/usr/bin/env bash
set -e

echo "🤖 world-builder-site: Agent Workflow"
echo "====================================="
echo "Session: $(date '+%Y%m%d_%H%M%S')"
echo ""

# Load context
echo "📊 Loading project context..."
./scripts/context-recovery.sh

echo ""
echo "🔍 Validating environment..."

# Check if we're in the right directory
if [ ! -f "pyproject.toml" ]; then
    echo "❌ Not in project root directory"
    exit 1
fi

# Check Python and Poetry
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not available"
    exit 1
fi

if ! command -v poetry &> /dev/null; then
    echo "❌ Poetry not available"
    exit 1
fi

# Check dependencies
if ! poetry check &> /dev/null; then
    echo "⚠️  Dependencies not installed. Running setup..."
    poetry install
fi

echo "✅ Environment validated"

# Parse command line arguments
COMMAND=${1:-"help"}
TASK_ID=${2:-""}

case $COMMAND in
    "help")
        echo ""
        echo "🛠️  Available Commands:"
        echo "  ./scripts/agent-workflow.sh validate <task_id>  - Validate task prerequisites"
        echo "  ./scripts/agent-workflow.sh execute <task_id>  - Execute task workflow"
        echo "  ./scripts/agent-workflow.sh quality-gate       - Run quality gate validation"
        echo "  ./scripts/agent-workflow.sh status            - Show current status"
        echo "  ./scripts/agent-workflow.sh setup             - Setup development environment"
        echo ""
        echo "📋 Current Phase Tasks:"
        if [ -f "docs/tasks/phase-0-tasks.yaml" ]; then
            echo "  Phase 0 tasks available"
        fi
        if [ -f "docs/tasks/phase-1-tasks.yaml" ]; then
            echo "  Phase 1 tasks available"
        fi
        ;;
    
    "validate")
        if [ -z "$TASK_ID" ]; then
            echo "❌ Task ID required for validate command"
            exit 1
        fi
        echo "🔍 Validating task: $TASK_ID"
        python3 scripts/agent-workflow-manager.py validate "$TASK_ID"
        ;;
    
    "execute")
        if [ -z "$TASK_ID" ]; then
            echo "❌ Task ID required for execute command"
            exit 1
        fi
        echo "🚀 Executing task: $TASK_ID"
        python3 scripts/agent-workflow-manager.py execute "$TASK_ID"
        ;;
    
    "quality-gate")
        echo "🚪 Running quality gate validation..."
        python3 scripts/agent-workflow-manager.py quality-gate
        ;;
    
    "status")
        echo "📊 Current Status:"
        echo "=================="
        
        # Show current phase
        if [ -f "docs/SESSION_STATE.md" ]; then
            CURRENT_PHASE=$(grep -E "Current Phase|status:" docs/SESSION_STATE.md | head -1 | sed 's/.*: *//' | sed 's/—.*//' | xargs)
            echo "Current Phase: $CURRENT_PHASE"
        fi
        
        # Show progress
        if [ -f "docs/SESSION_STATE.md" ]; then
            PROGRESS=$(grep "Progress:" docs/SESSION_STATE.md | sed 's/.*Progress: *//' | sed 's/%.*//' | xargs)
            echo "Progress: ${PROGRESS}%"
        fi
        
        # Show recent worklog entries
        if [ -f "docs/agent-worklog.json" ]; then
            echo ""
            echo "Recent Activity:"
            python3 -c "
import json
try:
    with open('docs/agent-worklog.json', 'r') as f:
        log = json.load(f)
    for entry in log[-3:]:  # Show last 3 entries
        print(f'  {entry[\"timestamp\"][:19]} - {entry[\"task_id\"]} ({entry[\"status\"]})')
except:
    print('  No activity log found')
"
        fi
        ;;
    
    "setup")
        echo "🔧 Setting up development environment..."
        ./scripts/setup-dev.sh
        ;;
    
    *)
        echo "❌ Unknown command: $COMMAND"
        echo "Run './scripts/agent-workflow.sh help' for available commands"
        exit 1
        ;;
esac

echo ""
echo "✅ Agent workflow completed"


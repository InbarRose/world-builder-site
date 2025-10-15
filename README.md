# world-builder-site

Static + interactive site for a card-driven collaborative world-building game.

This repository contains scaffolding, documentation, automation scripts, and an initial Phase 0/1 plan so agentic coding tools (Copilot, LLMs) can iterate safely and with validation.

See `PROJECT_CONTEXT.md` first.

## 🚀 Quick Start

### Option 1: Dev Container (Recommended)
1. **Prerequisites**: Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) and [VS Code](https://code.visualstudio.com/)
2. **Install Extension**: Install the "Dev Containers" extension in VS Code
3. **Open Project**: Clone repository and open in VS Code
4. **Start Container**: Press `Ctrl+Shift+P` → "Dev Containers: Reopen in Container"
5. **Verify Setup**: Run `wb-status` in the terminal

### Option 2: Local Development
1. Install Python 3.12 and Poetry
2. Clone repository
3. Run `./scripts/setup-dev.sh` (automated setup)
4. Implement Supabase connection (see `docs/technical-architecture.md`)
5. Frontend: `cd frontend` and follow `frontend/README.md`

## 🛠️ Development Commands

### Quick Aliases (Dev Container)
```bash
wb-status      # Show current project status
wb-context     # Load project context
wb-setup       # Setup development environment
wb-quality     # Run quality gates
wb-test        # Run tests
wb-lint        # Run linting
wb-format      # Format code
wb-execute <task>  # Execute agent task
```

### Agent Workflow
```bash
./scripts/agent-workflow.sh status        # Check current state
./scripts/agent-workflow.sh execute <task_id>  # Execute tasks
./scripts/agent-workflow.sh quality-gate # Run quality validation
```

## 📁 Project Structure

```
world-builder-site/
├── .devcontainer/          # Dev container configuration
├── config/                 # Environment configurations
├── docs/                   # Documentation and specifications
├── scripts/                # Automation and utility scripts
├── src/                    # Python FastAPI backend
├── frontend/               # React TypeScript frontend
├── tests/                  # Test suites
└── templates/              # Code generation templates
```

## 🎯 Current Status

- **Phase**: Phase 0 (Foundation) - In Progress
- **Progress**: ~10%
- **Next Steps**: Complete FastAPI setup and CI pipeline validation

## 📚 Documentation

- [Project Context](PROJECT_CONTEXT.md) - Project overview and goals
- [Dev Container Setup](docs/DEV_CONTAINER_SETUP.md) - Complete dev container guide
- [Agent Development Guide](docs/agent-guides/agent-development-guide.md) - Agent-specific instructions
- [API Documentation](docs/api/api-documentation.md) - API endpoints and usage
- [Repository Improvements](docs/REPO_IMPROVEMENTS_SUMMARY.md) - Summary of optimizations

## 🔧 Features

- **Agentic Development**: Optimized for AI-assisted coding
- **Quality Gates**: Automated testing, linting, and validation
- **Error Recovery**: Automatic error recovery and rollback capabilities
- **Template System**: Consistent code generation patterns
- **Configuration Management**: Environment-specific configurations
- **Comprehensive Testing**: Unit, integration, and E2E test support

## 📋 License

MIT. See `LICENSE`.

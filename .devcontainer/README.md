# World Builder Site Dev Container Setup

This directory contains the configuration for the World Builder Site development container.

## What's Included

### Dev Container Configuration (`.devcontainer/devcontainer.json`)
- **Base Image**: Python 3.12 on Debian Bullseye
- **Features**: Git, GitHub CLI, Node.js 18
- **VS Code Extensions**: Python, TypeScript, Tailwind CSS, Copilot, Testing tools
- **Settings**: Optimized for Python development with Ruff, Black, MyPy, and Pytest

### Bash Configuration (`.devcontainer/bashrc`)
- **Custom Aliases**: Quick commands for common tasks
- **Environment Variables**: Python path and project-specific settings
- **Helper Functions**: Agent workflow commands and utilities

## Getting Started

1. **Open in Dev Container**:
   - Install the "Dev Containers" extension in VS Code
   - Open this project in VS Code
   - Press `Ctrl+Shift+P` and select "Dev Containers: Reopen in Container"

2. **Automatic Setup**:
   - The container will automatically run `./scripts/setup-dev.sh`
   - Dependencies will be installed via Poetry
   - Environment will be configured

3. **Quick Commands**:
   ```bash
   wb-status      # Show current project status
   wb-context     # Load project context
   wb-execute <task>  # Execute agent task
   wb-quality     # Run quality gates
   ```

## Available Extensions

- **Python Development**: Python, Pylint, Black Formatter, MyPy, Ruff
- **Frontend Development**: TypeScript, Tailwind CSS, Prettier
- **AI Assistance**: GitHub Copilot, Copilot Chat
- **Testing**: Test Explorer, Test Adapter Converter
- **Utilities**: JSON, YAML, Git, GitHub CLI

## Environment Features

- **Python 3.12**: Latest Python with all development tools
- **Poetry**: Dependency management and virtual environment
- **Node.js 18**: For frontend development
- **Git & GitHub CLI**: Version control and GitHub integration
- **Pre-configured Settings**: Optimized for the project workflow

## Troubleshooting

### Container Won't Start
- Ensure Docker is running
- Check that the Dev Containers extension is installed
- Try rebuilding the container: `Ctrl+Shift+P` → "Dev Containers: Rebuild Container"

### Dependencies Issues
- Run `wb-setup` to reinstall dependencies
- Check Poetry installation: `poetry --version`
- Verify Python path: `which python`

### VS Code Extensions Not Working
- Ensure extensions are installed in the container
- Check the extensions panel for any errors
- Try reloading the window: `Ctrl+Shift+P` → "Developer: Reload Window"

## Development Workflow

1. **Start Container**: Open project in dev container
2. **Check Status**: Run `wb-status` to see current state
3. **Load Context**: Run `wb-context` to load project context
4. **Execute Tasks**: Use `wb-execute <task_id>` for agent tasks
5. **Quality Gates**: Run `wb-quality` to validate changes
6. **Commit Changes**: Use conventional commit messages

## Tasks

- [x] Create dev container configuration
- [x] Set up VS Code extensions and settings
- [x] Configure bash environment with aliases
- [x] Document dev container usage
- [ ] Test dev container setup
- [ ] Optimize container performance


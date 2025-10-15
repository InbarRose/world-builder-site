---
id: DEV_CONTAINER_SETUP
title: Dev Container Setup Guide
version: 1.0.0
status: active
---

# Dev Container Setup Guide

## Overview

This guide explains how to set up and use the development container environment for the world-builder-site project. The dev container provides a consistent, isolated development environment with all necessary tools and dependencies pre-configured.

## Prerequisites

### Required Software
- **Docker Desktop**: Install from [docker.com](https://www.docker.com/products/docker-desktop/)
- **Visual Studio Code**: Install from [code.visualstudio.com](https://code.visualstudio.com/)
- **Dev Containers Extension**: Install the "Dev Containers" extension in VS Code

### System Requirements
- **RAM**: Minimum 8GB (16GB recommended)
- **Disk Space**: At least 10GB free space
- **OS**: Windows 10/11, macOS, or Linux

## Quick Start

### 1. Clone and Open Project
```bash
git clone <repository-url>
cd world-builder-site
code .
```

### 2. Open in Dev Container
1. Open VS Code in the project directory
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS)
3. Type "Dev Containers: Reopen in Container"
4. Select the command and wait for the container to build

### 3. Verify Setup
Once the container is ready, open the terminal and run:
```bash
wb-status
```

You should see the project status and available commands.

## Container Features

### Pre-installed Software
- **Python 3.12**: Latest Python with development tools
- **Poetry**: Dependency management
- **Node.js 18**: For frontend development
- **Git**: Version control
- **GitHub CLI**: GitHub integration
- **Docker**: Container management

### VS Code Extensions
- **Python Development**: Python, Pylint, Black, MyPy, Ruff
- **Frontend Development**: TypeScript, Tailwind CSS, Prettier
- **AI Assistance**: GitHub Copilot, Copilot Chat
- **Testing**: Test Explorer, Test Adapter
- **Utilities**: JSON, YAML, Docker

### Port Forwarding
- **8000**: FastAPI Backend
- **3000**: React Frontend
- **5432**: PostgreSQL Database
- **6379**: Redis Cache

## Available Commands

### Quick Aliases
```bash
wb-status      # Show current project status
wb-context     # Load project context
wb-setup       # Setup development environment
wb-quality     # Run quality gates
wb-test        # Run tests
wb-lint        # Run linting
wb-format      # Format code
wb-type        # Type checking
```

### Agent Workflow Commands
```bash
wb-execute <task_id>     # Execute agent task
wb-validate <task_id>    # Validate task prerequisites
wb-backup [name]         # Create backup
wb-analyze               # Analyze error patterns
```

### VS Code Tasks
Access via `Ctrl+Shift+P` → "Tasks: Run Task":
- **Setup Development Environment**
- **Load Project Context**
- **Show Project Status**
- **Run Quality Gates**
- **Run Tests**
- **Run Linting**
- **Format Code**
- **Type Check**
- **Start FastAPI Server**
- **Validate Configuration**
- **Create Backup**
- **Analyze Errors**

## Development Workflow

### 1. Daily Startup
```bash
# Check project status
wb-status

# Load context if needed
wb-context

# Run quality gates
wb-quality
```

### 2. Working on Tasks
```bash
# Validate task prerequisites
wb-validate <task_id>

# Execute task
wb-execute <task_id>

# Run tests after changes
wb-test

# Format code
wb-format
```

### 3. Before Committing
```bash
# Run all quality checks
wb-quality

# Create backup if needed
wb-backup

# Analyze any errors
wb-analyze
```

## Services

### PostgreSQL Database
- **Host**: localhost
- **Port**: 5432
- **Database**: world_builder_dev
- **Username**: dev
- **Password**: dev_password

### Redis Cache
- **Host**: localhost
- **Port**: 6379
- **No authentication required**

## Troubleshooting

### Container Won't Start
1. **Check Docker**: Ensure Docker Desktop is running
2. **Check Resources**: Ensure sufficient RAM/disk space
3. **Rebuild Container**: `Ctrl+Shift+P` → "Dev Containers: Rebuild Container"
4. **Check Logs**: View Docker Desktop logs for errors

### Dependencies Issues
```bash
# Reinstall dependencies
wb-setup

# Check Poetry installation
poetry --version

# Verify Python path
which python
```

### VS Code Extensions Not Working
1. **Check Extensions**: Ensure extensions are installed in container
2. **Reload Window**: `Ctrl+Shift+P` → "Developer: Reload Window"
3. **Check Errors**: Look for extension errors in the Output panel

### Port Conflicts
If ports are already in use:
1. **Stop Conflicting Services**: Stop any services using ports 8000, 3000, 5432, 6379
2. **Change Ports**: Modify `.devcontainer/docker-compose.yml` to use different ports
3. **Restart Container**: Rebuild the container after changes

### Performance Issues
1. **Increase Resources**: Allocate more RAM/CPU to Docker Desktop
2. **Exclude Directories**: Add large directories to `.dockerignore`
3. **Use Volume Mounts**: Ensure proper volume mounting for better performance

## Configuration Files

### Dev Container Configuration
- `.devcontainer/devcontainer.json`: Main container configuration
- `.devcontainer/docker-compose.yml`: Service definitions
- `.devcontainer/Dockerfile`: Custom container image
- `.devcontainer/bashrc`: Bash configuration

### VS Code Configuration
- `.vscode/tasks.json`: Task definitions
- `.vscode/launch.json`: Debug configurations
- `.vscode/settings.json`: Workspace settings

## Customization

### Adding New Services
Edit `.devcontainer/docker-compose.yml` to add new services:
```yaml
services:
  new-service:
    image: service-image
    ports:
      - "8080:8080"
    networks:
      - world-builder-network
```

### Adding VS Code Extensions
Edit `.devcontainer/devcontainer.json` to add extensions:
```json
"extensions": [
  "extension.id"
]
```

### Customizing Bash Environment
Edit `.devcontainer/bashrc` to add aliases or environment variables.

## Best Practices

1. **Always Use Container**: Develop inside the container, not on host
2. **Commit Container Changes**: Include dev container configs in version control
3. **Use Tasks**: Leverage VS Code tasks for common operations
4. **Monitor Resources**: Keep an eye on Docker resource usage
5. **Backup Regularly**: Use the backup system before major changes
6. **Test in Container**: Ensure all tests pass in the container environment

## Security Considerations

- **Container Isolation**: The dev container provides isolation from host system
- **Network Security**: Services are only accessible from within the container network
- **Volume Mounts**: Only project directory is mounted, not entire host filesystem
- **User Permissions**: Container runs as non-root user for security

## Performance Tips

1. **Resource Allocation**: Allocate at least 8GB RAM to Docker Desktop
2. **Volume Optimization**: Use bind mounts for better performance
3. **Extension Management**: Only install necessary VS Code extensions
4. **Container Cleanup**: Regularly clean up unused containers and images

## Tasks

- [x] Create dev container configuration
- [x] Set up Docker Compose services
- [x] Configure VS Code extensions and settings
- [x] Create bash environment with aliases
- [x] Set up VS Code tasks and launch configurations
- [x] Document setup and usage procedures
- [ ] Test dev container setup on different platforms
- [ ] Optimize container performance
- [ ] Add additional development tools as needed


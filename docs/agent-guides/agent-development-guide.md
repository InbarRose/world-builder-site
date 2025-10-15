---
id: AGENT_GUIDE
title: Agent Development Guide
version: 1.0.0
status: active
---

# Agent Development Guide

## Overview

This guide provides comprehensive instructions for AI agents working on the world-builder-site project. It complements the main LLM_OPERATING_GUIDE.md with specific workflows and best practices.

## Quick Start

1. **Load Context**: Run `./scripts/context-recovery.sh`
2. **Check Status**: Run `./scripts/agent-workflow.sh status`
3. **Execute Task**: Run `./scripts/agent-workflow.sh execute <task_id>`
4. **Validate**: Run `./scripts/agent-workflow.sh quality-gate`

## Agent Workflow

### 1. Context Loading
```bash
# Load project context and generate structured data
./scripts/context-recovery.sh

# Check current phase and progress
./scripts/agent-workflow.sh status
```

### 2. Task Execution
```bash
# Validate task prerequisites
./scripts/agent-workflow.sh validate <task_id>

# Execute task workflow
./scripts/agent-workflow.sh execute <task_id>
```

### 3. Quality Validation
```bash
# Run complete quality gate
./scripts/agent-workflow.sh quality-gate

# Run specific checks
poetry run ruff check .
poetry run black --check .
poetry run pytest
```

## Code Generation Templates

### FastAPI Endpoint Template
Use `templates/fastapi-endpoint.py.template` for new API endpoints:
- Replace `{{model_name}}` with your model name
- Replace `{{ModelName}}` with your model class name
- Replace `{{endpoint_prefix}}` with your endpoint prefix

### SQLModel Class Template
Use `templates/sqlmodel-class.py.template` for new database models:
- Replace `{{ModelName}}` with your model class name
- Replace `{{model_description}}` with your model description
- Add your specific fields

### Test File Template
Use `templates/test-file.py.template` for new test files:
- Replace `{{module_path}}` with your module path
- Replace `{{ModelName}}` with your model class name
- Add your specific test cases

## Error Handling

### Automatic Recovery
The system provides automatic recovery for common errors:
- **Dependency errors**: Automatically runs `poetry install`
- **Linting errors**: Automatically runs `ruff check . --fix`
- **Formatting errors**: Automatically runs `black .`
- **Configuration errors**: Automatically validates configuration

### Manual Recovery
For complex errors, use the error recovery system:
```bash
# Create backup before making changes
python3 scripts/error-recovery.py backup

# Analyze error patterns
python3 scripts/error-recovery.py analyze

# Rollback if needed
python3 scripts/error-recovery.py rollback
```

## Configuration Management

### Environment-Specific Configs
- `config/environments/development.yaml` - Development settings
- `config/environments/testing.yaml` - Testing settings
- `config/environments/production.yaml` - Production settings

### Configuration Validation
```bash
# Validate all configurations
python3 scripts/config-validator.py validate

# Validate specific environment
python3 scripts/config-validator.py validate development
```

## Testing Guidelines

### Test Structure
- `tests/unit/` - Pure unit tests
- `tests/integration/` - API integration tests
- `tests/e2e/` - End-to-end tests
- `tests/fixtures/` - Test data fixtures

### Test Execution
```bash
# Run all tests
poetry run pytest

# Run specific test types
poetry run pytest -m unit
poetry run pytest -m integration

# Run with coverage
poetry run pytest --cov=src --cov-fail-under=80
```

## Quality Standards

### Code Quality
- **Linting**: Ruff with no warnings
- **Formatting**: Black compliance
- **Type Checking**: MyPy strict mode
- **Test Coverage**: Minimum 80%

### Commit Standards
- Use conventional commit messages
- Include agent attribution
- Reference task IDs
- Include change summary

## Troubleshooting

### Common Issues

1. **Dependencies not installed**
   ```bash
   poetry install
   ```

2. **Configuration errors**
   ```bash
   python3 scripts/config-validator.py validate
   ```

3. **Test failures**
   ```bash
   poetry run pytest -v --tb=short
   ```

4. **Linting errors**
   ```bash
   poetry run ruff check . --fix
   ```

### Getting Help

1. Check error logs: `docs/error-log.json`
2. Review recovery logs: `docs/recovery-log.json`
3. Analyze error patterns: `python3 scripts/error-recovery.py analyze`
4. Check agent worklog: `docs/agent-worklog.json`

## Best Practices

1. **Always validate prerequisites** before executing tasks
2. **Create backups** before making significant changes
3. **Run quality gates** after each major change
4. **Log all activities** for audit trail
5. **Follow phase discipline** - only work on current phase
6. **Use templates** for consistent code generation
7. **Test thoroughly** before committing changes

## Tasks

- [ ] Keep this guide updated as workflows evolve
- [ ] Add new templates as patterns emerge
- [ ] Update troubleshooting section based on common issues
- [ ] Maintain error recovery procedures


# Tests

See `docs/phase-1-specifications.md` for testing goals.

## Running tests

- Unit: `poetry run pytest -m unit`
- Integration: `poetry run pytest -m integration`
- Full: `poetry run pytest`

## Conventions

- Tests in `tests/unit/` should be pure unit tests.
- Use factories in `tests/factories.py`.

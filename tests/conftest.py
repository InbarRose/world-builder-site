import pytest
from sqlalchemy import create_engine
from sqlmodel import SQLModel, Session

@pytest.fixture(scope="session")
def engine():
    # use sqlite in-memory for unit tests
    return create_engine("sqlite:///:memory:")

@pytest.fixture(scope="function")
def db_session(engine):
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

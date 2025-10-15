"""
Enhanced test configuration and fixtures
"""
import pytest
import asyncio
from sqlalchemy import create_engine
from sqlmodel import SQLModel, Session
from fastapi.testclient import TestClient
from httpx import AsyncClient

# Test database configuration
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
def engine():
    """Create test database engine"""
    engine = create_engine(TEST_DATABASE_URL, echo=False)
    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)

@pytest.fixture(scope="function")
def db_session(engine):
    """Create database session for each test"""
    with Session(engine) as session:
        yield session
        session.rollback()

@pytest.fixture(scope="function")
def client():
    """Create test client"""
    from src.app.main import app
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(scope="function")
async def async_client():
    """Create async test client"""
    from src.app.main import app
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

# Test markers
def pytest_configure(config):
    """Configure pytest markers"""
    config.addinivalue_line("markers", "unit: mark test as unit test")
    config.addinivalue_line("markers", "integration: mark test as integration test")
    config.addinivalue_line("markers", "slow: mark test as slow running")

# Test data fixtures
@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "is_active": True
    }

@pytest.fixture
def sample_session_data():
    """Sample session data for testing"""
    return {
        "name": "Test Session",
        "is_active": True
    }

@pytest.fixture
def sample_timeline_data():
    """Sample timeline data for testing"""
    return {
        "move_id": 1,
        "year": 100,
        "description": "Test event"
    }

# Mock fixtures
@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client for testing"""
    class MockSupabaseClient:
        def __init__(self):
            self.auth = MockAuth()
            self.table = MockTable()
    
    class MockAuth:
        def get_user(self, token):
            return {"user": {"id": "test-user-id"}}
        
        def sign_up(self, email, password):
            return {"user": {"id": "test-user-id"}}
        
        def sign_in_with_password(self, email, password):
            return {"user": {"id": "test-user-id"}}
    
    class MockTable:
        def select(self, *args):
            return self
        
        def insert(self, data):
            return {"data": [data]}
        
        def update(self, data):
            return {"data": [data]}
        
        def delete(self):
            return {"data": []}
        
        def eq(self, column, value):
            return self
        
        def execute(self):
            return {"data": []}
    
    return MockSupabaseClient()

# Test utilities
class TestUtils:
    """Utility functions for tests"""
    
    @staticmethod
    def assert_response_structure(response_data: dict, expected_fields: list):
        """Assert response has expected structure"""
        for field in expected_fields:
            assert field in response_data, f"Missing field: {field}"
    
    @staticmethod
    def assert_datetime_field(field_value: str):
        """Assert field is valid datetime string"""
        from datetime import datetime
        try:
            datetime.fromisoformat(field_value.replace('Z', '+00:00'))
        except ValueError:
            pytest.fail(f"Invalid datetime format: {field_value}")
    
    @staticmethod
    def assert_uuid_field(field_value: str):
        """Assert field is valid UUID string"""
        import uuid
        try:
            uuid.UUID(field_value)
        except ValueError:
            pytest.fail(f"Invalid UUID format: {field_value}")

# Performance testing utilities
@pytest.fixture
def performance_timer():
    """Timer fixture for performance testing"""
    import time
    start_time = time.time()
    yield
    end_time = time.time()
    duration = end_time - start_time
    print(f"Test duration: {duration:.3f} seconds")
    return duration
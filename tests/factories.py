"""
Enhanced test factories for world-builder-site
Provides factory functions for creating test data
"""
import random
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from uuid import uuid4

def make_user(
    username: Optional[str] = None,
    email: Optional[str] = None,
    is_active: bool = True,
    **kwargs
) -> Dict[str, Any]:
    """Create user test data"""
    return {
        "id": str(uuid4()),
        "username": username or f"user{random.randint(1000, 9999)}",
        "email": email or f"user{random.randint(1000, 9999)}@example.com",
        "is_active": is_active,
        "created_at": datetime.utcnow(),
        **kwargs
    }

def make_session(
    user_id: Optional[str] = None,
    name: Optional[str] = None,
    is_active: bool = True,
    **kwargs
) -> Dict[str, Any]:
    """Create session test data"""
    return {
        "id": str(uuid4()),
        "user_id": user_id or str(uuid4()),
        "name": name or f"Session {random.randint(1000, 9999)}",
        "is_active": is_active,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        **kwargs
    }

def make_timeline_event(
    session_id: Optional[str] = None,
    move_id: Optional[int] = None,
    year: Optional[int] = None,
    description: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """Create timeline event test data"""
    return {
        "id": str(uuid4()),
        "session_id": session_id or str(uuid4()),
        "move_id": move_id or random.randint(1, 100),
        "year": year or random.randint(1, 1000),
        "description": description or f"Event {random.randint(1000, 9999)}",
        "created_at": datetime.utcnow(),
        **kwargs
    }

def make_tile(
    session_id: Optional[str] = None,
    x: Optional[int] = None,
    y: Optional[int] = None,
    tile_type: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """Create tile test data"""
    return {
        "id": str(uuid4()),
        "session_id": session_id or str(uuid4()),
        "x": x or random.randint(0, 19),
        "y": y or random.randint(0, 11),
        "tile_type": tile_type or random.choice(["land", "water", "mountain", "forest"]),
        "created_at": datetime.utcnow(),
        **kwargs
    }

def make_entity(
    session_id: Optional[str] = None,
    name: Optional[str] = None,
    entity_type: Optional[str] = None,
    x: Optional[int] = None,
    y: Optional[int] = None,
    **kwargs
) -> Dict[str, Any]:
    """Create entity test data"""
    return {
        "id": str(uuid4()),
        "session_id": session_id or str(uuid4()),
        "name": name or f"Entity {random.randint(1000, 9999)}",
        "entity_type": entity_type or random.choice(["city", "village", "ruin", "landmark"]),
        "x": x or random.randint(0, 19),
        "y": y or random.randint(0, 11),
        "created_at": datetime.utcnow(),
        **kwargs
    }

def make_card_draw(
    session_id: Optional[str] = None,
    card_id: Optional[str] = None,
    move_id: Optional[int] = None,
    **kwargs
) -> Dict[str, Any]:
    """Create card draw test data"""
    return {
        "id": str(uuid4()),
        "session_id": session_id or str(uuid4()),
        "card_id": card_id or f"card_{random.randint(1, 100)}",
        "move_id": move_id or random.randint(1, 100),
        "drawn_at": datetime.utcnow(),
        **kwargs
    }

# Batch creation helpers
def make_multiple_users(count: int = 5) -> list[Dict[str, Any]]:
    """Create multiple user test data"""
    return [make_user() for _ in range(count)]

def make_multiple_sessions(count: int = 3, user_id: Optional[str] = None) -> list[Dict[str, Any]]:
    """Create multiple session test data"""
    return [make_session(user_id=user_id) for _ in range(count)]

def make_multiple_tiles(count: int = 10, session_id: Optional[str] = None) -> list[Dict[str, Any]]:
    """Create multiple tile test data"""
    return [make_tile(session_id=session_id) for _ in range(count)]

# Test data sets
def get_test_rules() -> Dict[str, Any]:
    """Get test rules data"""
    return {
        "version": "2025-01-27",
        "stages": [
            {
                "id": "stage_1",
                "name": "Foundation",
                "description": "Initial world building",
                "cards": [
                    {"id": "card_1", "name": "Land Formation", "probability": 0.3},
                    {"id": "card_2", "name": "Water Source", "probability": 0.2},
                    {"id": "card_3", "name": "Climate", "probability": 0.2},
                    {"id": "card_4", "name": "Resources", "probability": 0.3}
                ]
            }
        ]
    }

def get_test_session_state() -> Dict[str, Any]:
    """Get test session state data"""
    return {
        "current_stage": "stage_1",
        "move_count": 5,
        "current_year": 100,
        "timeline": [
            {"move_id": 1, "year": 20, "description": "Land formation begins"},
            {"move_id": 2, "year": 40, "description": "Water sources emerge"},
            {"move_id": 3, "year": 60, "description": "Climate stabilizes"},
            {"move_id": 4, "year": 80, "description": "Resources discovered"},
            {"move_id": 5, "year": 100, "description": "First settlements"}
        ],
        "map_state": {
            "tiles": [
                {"x": 5, "y": 5, "type": "land"},
                {"x": 6, "y": 5, "type": "water"},
                {"x": 7, "y": 5, "type": "mountain"}
            ],
            "entities": [
                {"x": 5, "y": 5, "type": "city", "name": "First City"}
            ]
        }
    }
---
id: API_DOCS
title: API Documentation
version: 1.0.0
status: draft
---

# API Documentation

## Overview

The World Builder Site API provides endpoints for collaborative world-building functionality including session management, card drawing, timeline management, and map visualization.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.world-builder-site.com`

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-27T00:00:00Z"
}
```

### Authentication

#### POST /auth/register
Register a new user.

**Request:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "is_active": true
  },
  "token": "jwt-token"
}
```

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "is_active": true
  },
  "token": "jwt-token"
}
```

### Sessions

#### GET /sessions
List user sessions.

**Query Parameters:**
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100)

**Response:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "name": "string",
      "is_active": true,
      "created_at": "2025-01-27T00:00:00Z",
      "updated_at": "2025-01-27T00:00:00Z"
    }
  ],
  "total": 10
}
```

#### POST /sessions
Create a new session.

**Request:**
```json
{
  "name": "string",
  "description": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "is_active": true,
  "created_at": "2025-01-27T00:00:00Z"
}
```

#### GET /sessions/{session_id}
Get session details.

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "description": "string",
  "is_active": true,
  "current_stage": "string",
  "move_count": 0,
  "current_year": 0,
  "created_at": "2025-01-27T00:00:00Z",
  "updated_at": "2025-01-27T00:00:00Z"
}
```

### Simulation

#### POST /simulate/draw
Draw a card for simulation.

**Request:**
```json
{
  "session_id": "uuid",
  "stage": "string"
}
```

**Response:**
```json
{
  "card": {
    "id": "string",
    "name": "string",
    "description": "string",
    "probability": 0.3
  },
  "move_id": 1,
  "year": 100,
  "event": {
    "description": "string",
    "effects": ["string"]
  }
}
```

#### POST /simulate/anonymous
Run anonymous simulation.

**Request:**
```json
{
  "stage": "string",
  "moves": 5
}
```

**Response:**
```json
{
  "timeline": [
    {
      "move_id": 1,
      "year": 20,
      "description": "string",
      "card": {
        "id": "string",
        "name": "string"
      }
    }
  ],
  "final_year": 100
}
```

### Timeline

#### GET /sessions/{session_id}/timeline
Get session timeline.

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "move_id": 1,
      "year": 20,
      "description": "string",
      "card_id": "string",
      "created_at": "2025-01-27T00:00:00Z"
    }
  ],
  "total": 10
}
```

#### POST /sessions/{session_id}/timeline
Add timeline event.

**Request:**
```json
{
  "move_id": 1,
  "year": 20,
  "description": "string",
  "card_id": "string"
}
```

**Response:**
```json
{
  "id": "uuid",
  "move_id": 1,
  "year": 20,
  "description": "string",
  "card_id": "string",
  "created_at": "2025-01-27T00:00:00Z"
}
```

### Map

#### GET /sessions/{session_id}/map
Get session map state.

**Response:**
```json
{
  "tiles": [
    {
      "id": "uuid",
      "x": 5,
      "y": 5,
      "tile_type": "land",
      "created_at": "2025-01-27T00:00:00Z"
    }
  ],
  "entities": [
    {
      "id": "uuid",
      "name": "string",
      "entity_type": "city",
      "x": 5,
      "y": 5,
      "created_at": "2025-01-27T00:00:00Z"
    }
  ]
}
```

#### POST /sessions/{session_id}/map/tiles
Add or update map tile.

**Request:**
```json
{
  "x": 5,
  "y": 5,
  "tile_type": "land"
}
```

**Response:**
```json
{
  "id": "uuid",
  "x": 5,
  "y": 5,
  "tile_type": "land",
  "created_at": "2025-01-27T00:00:00Z"
}
```

### Export/Import

#### GET /sessions/{session_id}/export
Export session data.

**Response:**
```json
{
  "session": {
    "id": "uuid",
    "name": "string",
    "description": "string"
  },
  "timeline": [],
  "map": {
    "tiles": [],
    "entities": []
  },
  "exported_at": "2025-01-27T00:00:00Z"
}
```

#### POST /sessions/import
Import session data.

**Request:**
```json
{
  "session": {
    "name": "string",
    "description": "string"
  },
  "timeline": [],
  "map": {
    "tiles": [],
    "entities": []
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "string",
  "imported_at": "2025-01-27T00:00:00Z"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "detail": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 422 Unprocessable Entity
```json
{
  "detail": "Invalid request data"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Rate Limiting

API requests are rate limited:
- **Development**: 1000 requests per minute
- **Production**: 30 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests per minute
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when rate limit resets

## Tasks

- [ ] Add OpenAPI specification generation
- [ ] Include example requests and responses
- [ ] Add authentication flow documentation
- [ ] Document WebSocket endpoints for real-time collaboration
- [ ] Add API versioning strategy


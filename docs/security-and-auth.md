---
id: SECURITY_AUTH
title: Security and Auth
version: 1.0.0
status: draft
---

# Security & Auth

## Principles

- Least privilege for DB access
- Sanitize user input and timeline text on storage and rendering
- Invite tokens random (128-bit), expireable
- HTTPS everywhere
- Rate-limit public simulate endpoints

## Auth model

- Use Supabase Auth for email/password and magic-link
- FastAPI depends on JWT middleware for authenticated endpoints
- Host can override session ownership / permissions

## Tasks

- [ ] Add OWASP checklist for storage of user-provided images
- [ ] Implement input sanitization using Bleach or equivalent on backend render

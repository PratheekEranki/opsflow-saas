# OpsFlow SaaS — Multi-Tenant Workflow & Incident Management Platform

A production-grade, multi-tenant workflow and incident management platform for engineering teams — built with Java/Spring Boot, React/TypeScript, PostgreSQL, Redis, Kafka, and WebSockets.

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Java 11 (local) / 21 (Docker), Spring Boot 2.7, Spring Security, Spring Kafka |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, dnd-kit |
| Database | PostgreSQL 15, Flyway migrations, Redis 7 |
| Messaging | Apache Kafka (audit events, notifications, ticket events) |
| Real-Time | WebSockets (STOMP over SockJS) |
| DevOps | Docker Compose, GitHub Actions CI/CD |

## Features

- ✅ Multi-tenant org registration with slug-based isolation
- ✅ JWT authentication with role-based access (Admin / Manager / Member)
- ✅ Projects, tickets, comments, assignments with full CRUD
- ✅ Kanban board with drag-and-drop (dnd-kit)
- ✅ Real-time ticket updates via WebSockets
- ✅ In-app notifications (WebSocket push)
- ✅ Redis caching for board state
- ✅ Kafka audit/activity event stream
- ✅ Full-text ticket search with pagination
- ✅ OpenAPI/Swagger documentation at `/swagger-ui.html`
- ✅ GitHub Actions CI/CD (Java 11 tests → Docker build with Java 21)

## Quick Start

### 1. Prerequisites

- Java 11+ (local dev) — download from https://adoptium.net
- Node.js 22+ — `node -v` to verify
- Docker Desktop — for PostgreSQL, Redis, Kafka, MailHog

### 2. Start infrastructure

```bash
docker compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- Kafka on port 9092
- MailHog web UI at http://localhost:8025

### 3. Start backend

```bash
cd backend
./mvnw spring-boot:run
```

API available at: http://localhost:8080
Swagger UI: http://localhost:8080/swagger-ui.html

### 4. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend at: http://localhost:5173

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

| Variable | Default | Description |
|---|---|---|
| POSTGRES_DB | opsflow | Database name |
| POSTGRES_USER | opsflow | DB username |
| POSTGRES_PASSWORD | opsflow123 | DB password |
| REDIS_PASSWORD | redis123 | Redis auth password |
| JWT_SECRET | (set in .env) | 256-bit JWT signing key |
| JWT_EXPIRATION_MS | 86400000 | Access token TTL (24h) |
| MAIL_HOST | localhost | SMTP host (MailHog locally) |

## Project Structure

```
opsflow-saas/
├── backend/                  # Spring Boot API
│   ├── src/main/java/com/opsflow/
│   │   ├── config/           # Security, Redis, Kafka, WebSocket config
│   │   ├── controller/       # REST controllers
│   │   ├── entity/           # JPA entities
│   │   ├── repository/       # Spring Data repositories
│   │   ├── service/          # Business logic
│   │   ├── security/         # JWT filter, UserDetailsService
│   │   ├── kafka/            # Producers and consumers
│   │   ├── websocket/        # WebSocket broadcast service
│   │   ├── dto/              # Request/Response DTOs
│   │   └── exception/        # Global error handler
│   ├── src/main/resources/
│   │   └── db/migration/     # Flyway SQL migrations
│   └── Dockerfile            # Java 21 image for Docker
├── frontend/                 # React + TypeScript
│   └── src/
│       ├── components/       # Kanban, Layout, common UI
│       ├── pages/            # Login, Register, Dashboard, Kanban
│       ├── services/         # API layer (axios)
│       ├── store/            # Zustand auth store
│       ├── hooks/            # useWebSocket
│       └── types/            # TypeScript interfaces
├── docker-compose.yml        # Full local dev stack
├── .env.example              # Environment template
└── .github/workflows/ci.yml  # CI: test (Java 11) → build (Java 21 Docker)
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/organizations/register | Register new organization + admin |
| POST | /api/auth/login | Login, returns JWT tokens |
| GET | /api/projects/{id}/tickets/board | Get Kanban board by status |
| POST | /api/projects/{id}/tickets | Create ticket |
| PATCH | /api/projects/{id}/tickets/{tid}/status | Move ticket on board |
| GET | /api/search/tickets?q= | Full-text search |
| GET | /api/notifications | Get user notifications |
| POST | /api/notifications/mark-all-read | Mark all read |

## Resume Accomplishments

- **Engineered a multi-tenant SaaS platform** using Java 21/Spring Boot, PostgreSQL, and Redis — supporting org-level data isolation via JWT claims and scoped repository queries across 8 domain entities
- **Built real-time collaborative Kanban board** using WebSockets (STOMP/SockJS) and React/TypeScript with drag-and-drop, broadcasting ticket state changes to all connected team members instantly
- **Designed event-driven audit and notification pipeline** using Apache Kafka with 3 dedicated topics — decoupling ticket lifecycle events from real-time notification delivery and persistent audit history

# OpsFlow SaaS — Multi-Tenant Workflow & Incident Management Platform

A production-grade, multi-tenant workflow and incident management platform for engineering teams — built with Java/Spring Boot, React/TypeScript, PostgreSQL, Redis, Kafka, and WebSockets.

**Live demo:** https://opsflow-saas-two.vercel.app  
**API (Render):** https://opsflow-saas.onrender.com

## Tech Stack

| Layer | Technologies |
|---|---|
| Backend | Java 11 (local) / 21 (Docker), Spring Boot 2.7, Spring Security, Spring Kafka |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, dnd-kit |
| Database | PostgreSQL 15, Flyway migrations, Redis 7 |
| Messaging | Apache Kafka (audit events, notifications, ticket events) |
| Real-Time | WebSockets (STOMP over SockJS) |
| Hosting | Render (backend Docker), Vercel (frontend) |
| DevOps | Docker Compose, GitHub Actions CI/CD |

## Features

- ✅ Multi-tenant org registration with slug-based isolation
- ✅ JWT authentication with role-based access (Admin / Manager / Member)
- ✅ Projects, tickets, comments, assignments with full CRUD
- ✅ Kanban board with drag-and-drop (dnd-kit)
- ✅ Create tickets with type (Task / Bug / Feature / Incident) and priority
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

### Backend (`.env` at project root)

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_DB` | `opsflow` | Database name |
| `POSTGRES_USER` | `opsflow` | DB username |
| `POSTGRES_PASSWORD` | `opsflow123` | DB password |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `redis123` | Redis auth password |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka broker |
| `JWT_SECRET` | *(set in .env)* | 256-bit JWT signing key |
| `JWT_EXPIRATION_MS` | `86400000` | Access token TTL (24h) |
| `JWT_REFRESH_EXPIRATION_MS` | `604800000` | Refresh token TTL (7d) |
| `MAIL_HOST` | `localhost` | SMTP host (MailHog locally) |
| `MAIL_PORT` | `1025` | SMTP port |
| `APP_BASE_URL` | `http://localhost:8080` | Backend public URL |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL (used for CORS) |

### Frontend

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend base URL (e.g. `https://opsflow-saas.onrender.com`) |

## Production Deployment

### Backend → Render

1. Create a **Web Service** on Render, connect this repo, set **Root Directory** to `backend`, use **Docker** runtime
2. Set the following environment variables in Render:

| Variable | Value |
|---|---|
| `SPRING_DATASOURCE_URL` | Render Postgres internal URL |
| `SPRING_DATASOURCE_USERNAME` | Postgres user |
| `SPRING_DATASOURCE_PASSWORD` | Postgres password |
| `JWT_SECRET` | A strong random 256-bit key |
| `FRONTEND_URL` | `https://<your-vercel-app>.vercel.app` |
| `APP_BASE_URL` | `https://<your-render-service>.onrender.com` |

> **Note:** Render's free tier spins down on inactivity — expect a ~50s cold start on first request.

### Frontend → Vercel

1. Import this repo on Vercel, set **Root Directory** to `frontend`
2. Add environment variable:

| Variable | Value |
|---|---|
| `VITE_API_BASE_URL` | `https://<your-render-service>.onrender.com` |

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
│   └── Dockerfile            # Java 21 image for production
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
| POST | `/api/organizations/register` | Register new organization + admin user |
| POST | `/api/auth/login` | Login, returns JWT tokens |
| GET | `/api/projects` | List projects in org |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/{id}/tickets/board` | Get Kanban board grouped by status |
| POST | `/api/projects/{id}/tickets` | Create ticket |
| PATCH | `/api/projects/{id}/tickets/{tid}/status` | Move ticket on board |
| GET | `/api/search/tickets?q=` | Full-text ticket search |
| GET | `/api/notifications` | Get user notifications |
| POST | `/api/notifications/mark-all-read` | Mark all notifications read |

## Resume Accomplishments

- **Engineered a multi-tenant SaaS platform** using Java 21/Spring Boot, PostgreSQL, and Redis — supporting org-level data isolation via JWT claims and scoped repository queries across 8 domain entities
- **Built real-time collaborative Kanban board** using WebSockets (STOMP/SockJS) and React/TypeScript with drag-and-drop, broadcasting ticket state changes to all connected team members instantly
- **Designed event-driven audit and notification pipeline** using Apache Kafka with 3 dedicated topics — decoupling ticket lifecycle events from real-time notification delivery and persistent audit history

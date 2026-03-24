# QueueMaster

## Architecture Overview
A full-stack asynchronous task processing system designed to handle long-running operations without blocking the main API thread.
- **Frontend:** `React` + `TypeScript (Vite)`
- **Backend:** `NestJS`
- **Database:** `PostgreSQL (TypeORM)`
- **Message Broker & Queue:** `Redis` + `BullMQ`
- **Infrastructure:** Fully `Dockerized` multi-stage environment

## Design Decisions & Architectural Choices

#### **1. Background Processing (BullMQ + Redis)** <br>
Long-running tasks (simulating data imports or report generation) cannot be processed inline, as they would block the Node.js event loop and lead to API timeouts. <br><br>
The NestJS server acts strictly as an ingress controller, instantly writing the job to a Redis-backed BullMQ queue and returning a `PENDING` state. A decoupled worker thread picks up the job, simulates the 3-8 second workload, and writes the final resolution to the database.

#### **2. Real-Time UI Updates (Short Polling)**
To satisfy the requirement of automatically updating the UI when a task finishes, **Short Polling** was implemented on the Task Detail view.
* **Justification:** *Given the simulated task duration is extremely short (3-8 seconds), standing up a full bidirectional WebSocket gateway or Server-Sent Events (SSE) stream introduces unnecessary stateful overhead. A clean polling mechanism (fetching every 2 seconds via a custom React hook) is stateless, highly fault-tolerant, and perfectly suited for this specific latency window. The polling interval is strictly cleared on component unmount to prevent memory leaks.*

#### **3. State Synchronization**
PostgreSQL acts as the ultimate source of truth. The React UI never reads from Redis; it only queries the NestJS API. The BullMQ worker is strictly responsible for updating the Postgres task records (`PENDING` -> `COMPLETED` / `FAILED`) so the polling client always receives the synchronized, persistent database state.

## Prerequisites
- **Node.js**: `v22.x LTS` (Required for local development)
- **Docker Desktop**: `v4.x+` (Required for infrastructure containerization)

## Environment Configuration
Strict separation of concerns is enforced to prevent backend secrets from leaking into the static frontend build. You must create two separate environment files before booting the stack.

**1. Backend Environment (`./server/.env`)**
Create this file inside the `server` directory to define secure infrastructure routing and database credentials.

``` env
PORT=3000
JWT_SECRET=super_secret_bro_key_2026
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=taskqueue
DATABASE_URL=postgresql://postgres:password@postgres:5432/taskqueue
REDIS_URL=redis://redis:6379
```

**2. Frontend Environment (`./client/.env`)**
Create this file inside the `client` directory to inject the API routing into the Vite build process.
```env
VITE_API_URL=http://localhost:3000
```

## Local Development Guide

### Booting the Stack
This command spins up the isolated Docker network, boots the databases, executes the NestJS database seed script (`seed.ts`), and serves the Vite frontend.
```bash
docker compose up --build
```

### Service Routing
Once the terminal shows all services are healthy, access the system here:
- **Client UI:** `http://localhost:8080`
- **NestJS API:** `http://localhost:3000`
- **Postgres (Internal Docker Network):** `5432`
- **Redis (Internal Docker Network):** `6379`

### End-to-End Verification Protocol
To verify the distributed queue is fully operational:
1. Open `http://localhost:8080` and log in with the seeded master credentials: `admin@bro.com` / `password123`.
2. Verify the dashboard populates with the 5 initial dummy tasks.
3. Click **"New Task"** and submit a test payload.
4. Watch the UI instantly reflect the `PENDING` state.
5. Without refreshing the page, observe the short-polling hook detect the background BullMQ worker's progress, seamlessly transitioning the task state from `PENDING` -> `PROCESSING` -> `COMPLETED`.

### Wipe DB (Clean Slate)
If the database enters a dirty state or you need to completely wipe the infrastructure volumes and start fresh:
```bash
docker compose down -v
```
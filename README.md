# Full-Stack Calculator (React + Go)

Interview assignment implementation for a full-stack calculator with a React frontend and a Go backend microservice.

## 1. Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Go (net/http)
- Testing:
  - Frontend: Vitest + Testing Library
  - Backend: Go table-driven unit tests

## 2. Project Structure

```text
calculator-tech-test/
├── backend/
│   ├── cmd/server/main.go
│   ├── internal/calculator/service.go
│   ├── internal/calculator/service_test.go
│   ├── internal/httpapi/handler.go
│   ├── internal/httpapi/handler_test.go
│   ├── Makefile
│   └── go.mod
├── frontend/
│   ├── src/App.tsx
│   ├── src/App.test.tsx
│   ├── src/api/calculatorApi.ts
│   ├── src/setupTests.ts
│   ├── .env.example
│   └── package.json
└── README.md
```

## 3. Features Implemented

### Required Operations

- Addition
- Subtraction
- Multiplication
- Division

### Frontend

- Intuitive form UI for two numbers and operation selection
- Validation for empty and invalid numeric inputs
- Error handling and user feedback messages
- Async loading state while API call is in progress
- Basic responsive support for mobile screens

### Backend

- REST endpoint for calculations
- Input validation and JSON parsing safeguards
- Division by zero handling
- Consistent JSON success/error responses

## 4. API Contract

### Endpoint

`POST /api/v1/calculate`

### Request Body

```json
{
  "operation": "add",
  "a": 24,
  "b": 6
}
```

`operation` accepted values:

- `add`
- `subtract`
- `multiply`
- `divide`

### Success Response (200)

```json
{
  "result": 30
}
```

### Error Response (400)

```json
{
  "error": {
    "code": "DIVISION_BY_ZERO",
    "message": "Division by zero is not allowed."
  }
}
```

## 5. Setup Instructions

## Prerequisites

- Node.js 20+ (or a recent LTS)
- npm 10+
- Go 1.22+

## Clone and install

```bash
git clone https://github.com/andreslossada/calculator-tech-test.git
cd calculator-tech-test
npm install
```

This installs the root dev runner dependencies (single-command startup).

### Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
```

Windows PowerShell alternative:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
```

### Backend setup

```bash
cd ../backend
go mod tidy
```

## 6. Run the Application

### Recommended: run everything with one command

From repository root:

```bash
npm run dev
```

This starts:

- Frontend on `http://localhost:5173`
- Backend on `http://localhost:8080`

### Run backend

```bash
cd backend
make run
```

Alternative without Makefile:

```bash
cd backend
PORT=8080 ALLOWED_ORIGIN=http://localhost:5173 go run ./cmd/server
```

### Run frontend

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173` and calls backend at `http://localhost:8080`.

## 7. Test Commands and Coverage

### Frontend

```bash
cd frontend
npm test
npm run test:coverage
```

### Backend

Use the direct Go commands below (cross-platform, including Windows):

```bash
cd backend
go test ./...
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
```

If you have `make` available, you can also run:

```bash
cd backend
make test
make coverage
```

## 8. Optional Docker Setup

Docker is optional in this assignment, but this repository includes a complete container setup.

### What is a Dockerfile (simple explanation)

- A Dockerfile is a recipe to build an image.
- An image is a packaged environment with your app and everything needed to run it.
- A container is a running instance of that image.

In this project:

- `backend/Dockerfile`:
  - Builds the Go binary in a builder stage.
  - Copies only the final binary to a small runtime image.
  - Exposes port `8080`.
- `frontend/Dockerfile`:
  - Builds the React app with Vite.
  - Serves static files with Nginx.
  - Exposes port `80` inside the container (mapped to `5173` on host).

### Why use docker-compose here

- `docker-compose.yml` starts frontend and backend together.
- It defines ports and environment variables in one file.
- One command is enough to run the full stack.

### Run with Docker

From repository root:

```bash
docker compose up --build
```

Then open:

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8080/health`

Stop containers:

```bash
docker compose down
```

## 9. Deploy To The Web (Render + Vercel)

Recommended setup for this project:

- Backend (Go API): Render
- Frontend (React): Vercel

### 1) Deploy backend to Render

This repository includes `render.yaml` and `backend/Dockerfile`.

In Render:

- Create a new Blueprint service from this repository.
- Render will pick `render.yaml` and create `calculator-backend`.
- After deploy, copy your backend URL, for example:
  - `https://calculator-backend.onrender.com`

Quick check:

- `https://<your-backend-domain>/health` should return `{"status":"ok"}`.

### 2) Connect frontend in Vercel

In Vercel project settings for `frontend`, set:

- `VITE_API_BASE_URL=https://<your-backend-domain>`

Redeploy frontend after updating this variable.

### 3) CORS configuration

Backend uses `ALLOWED_ORIGIN` and supports comma-separated origins, for example:

```text
http://localhost:5173,https://frontend-sand-eight-62.vercel.app
```

This allows local development and production frontend at the same time.

## 10. API Usage Examples

### cURL examples

```bash
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"add","a":10,"b":5}'
```

```bash
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"divide","a":10,"b":0}'
```

## 11. Quick Verification Checklist

Run these checks before sharing the repository link:

1. Backend tests pass

```bash
cd backend
go test ./...
```

2. Frontend tests pass

```bash
cd frontend
npm test
```

3. Frontend coverage command works

```bash
cd frontend
npm run test:coverage
```

4. Manual smoke test

- Open the UI and validate add/subtract/multiply/divide end-to-end.
- Validate division by zero returns a readable error.
- Validate mobile-width layout at roughly 560px.

## 12. Design Decisions and Assumptions

- Single calculate endpoint (`POST /api/v1/calculate`) was chosen to keep frontend integration simple and make future operations easy to add.
- Backend separates HTTP handling and math logic:
  - `internal/httpapi`: transport concerns (validation/JSON/status codes)
  - `internal/calculator`: pure business logic and domain errors
- Error responses use stable `code` + `message` fields for predictable UI handling.
- Number type is `float64`/`number` for simplicity in assignment scope.
- Optional operations (exponentiation, square root, percentage) intentionally deferred until required scope is complete.

## 13. Trade-offs

- Kept a single endpoint for clarity and lower integration complexity, instead of multiple operation-specific routes.
- Focused test scope on business and handler behavior rather than full browser E2E automation.
- Prioritized required operations and robust validation over optional advanced operations.

## 14. AI Prompts Used

Prompts used during implementation:

1. "Create a senior-level implementation plan to maximize technical interview score for this React + Go calculator assignment."
2. "Start implementation. Build required files first and postpone extra features."
3. "Implement a maintainable React + TypeScript frontend with validation, API client, responsive UI, and unit tests."
4. "Implement Go backend endpoint with clean validation, JSON error contract, and table-driven unit tests."
5. "Generate README with setup, run instructions, API examples, and design rationale."

## 15. Known Limitations

- Floating-point arithmetic can produce precision artifacts for some decimal values.
- Optional advanced operations were not included in MVP by design.
- Docker setup is provided for local full-stack execution but was kept intentionally simple for interview scope.

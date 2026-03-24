# Full-Stack Calculator (React + Go)

Interview assignment solution with a React frontend and Go backend.

## TL;DR

- Frontend (Vercel): https://frontend-sand-eight-62.vercel.app
- Backend (Render): https://calculator-backend-9law.onrender.com
- Health check: https://calculator-backend-9law.onrender.com/health
- Main endpoint: `POST /api/v1/calculate`

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Go (`net/http`)
- Tests: Vitest + Testing Library (frontend), table-driven tests (backend)

## Features

- Required operations: add, subtract, multiply, divide
- Input validation + error handling in both frontend and backend
- JSON API with stable success/error contract
- Basic responsive UI

## Quick Start

Prerequisites:

- Node.js 20+
- npm 10+
- Go 1.22+

Install:

```bash
git clone https://github.com/andreslossada/calculator-tech-test.git
cd calculator-tech-test
npm install
cd frontend && npm install
cd ../backend && go mod tidy
```

Run both services from project root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8080

## Testing

Frontend:

```bash
cd frontend
npm test
npm run test:coverage
```

Backend:

```bash
cd backend
go test ./...
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
```

## API

Endpoint:

- `POST /api/v1/calculate`

Request:

```json
{
  "operation": "add",
  "a": 24,
  "b": 6
}
```

Supported operations:

- `add`
- `subtract`
- `multiply`
- `divide`

Success (200):

```json
{
  "result": 30
}
```

Error (400):

```json
{
  "error": {
    "code": "DIVISION_BY_ZERO",
    "message": "Division by zero is not allowed."
  }
}
```

cURL examples:

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

## Design Decisions And Assumptions

- Single endpoint (`POST /api/v1/calculate`) to keep integration simple and extensible.
- Layered backend design:
  - `internal/httpapi`: transport, validation, status codes
  - `internal/calculator`: pure business logic
- Error contract uses stable `code` + `message` for predictable frontend behavior.
- Numeric type: `float64` / `number` for assignment scope.
- Optional operations (power, sqrt, percentage) intentionally deferred.

## Web Deployment

- Frontend deployed in Vercel.
- Backend deployed in Render.
- Frontend uses `VITE_API_BASE_URL`.
- Backend uses `ALLOWED_ORIGIN` and supports comma-separated origins.

Optional Docker setup is included with:

- `backend/Dockerfile`
- `frontend/Dockerfile`
- `docker-compose.yml`

## AI Prompts Used

Prompts used during implementation:

1. "Create a senior-level implementation plan to maximize technical interview score for this React + Go calculator assignment."
2. "Start implementation. Build required files first and postpone extra features."
3. "Implement a maintainable React + TypeScript frontend with validation, API client, responsive UI, and unit tests."
4. "Implement Go backend endpoint with clean validation, JSON error contract, and table-driven unit tests."
5. "Generate README with setup, run instructions, API examples, and design rationale."

## Known Limitations

- Floating-point arithmetic can produce precision artifacts for some decimal values.
- Optional advanced operations were not included in MVP by design.
- Docker setup is provided for local full-stack execution but was kept intentionally simple for interview scope.

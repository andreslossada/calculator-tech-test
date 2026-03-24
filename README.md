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
git clone <your-repository-url>
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

```bash
cd backend
make test
make coverage
```

Alternative without Makefile:

```bash
cd backend
go test ./...
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out
```

## 8. API Usage Examples

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

## 9. Design Decisions and Assumptions

- Single calculate endpoint (`POST /api/v1/calculate`) was chosen to keep frontend integration simple and make future operations easy to add.
- Backend separates HTTP handling and math logic:
  - `internal/httpapi`: transport concerns (validation/JSON/status codes)
  - `internal/calculator`: pure business logic and domain errors
- Error responses use stable `code` + `message` fields for predictable UI handling.
- Number type is `float64`/`number` for simplicity in assignment scope.
- Optional operations (exponentiation, square root, percentage) intentionally deferred until required scope is complete.

## 10. AI Prompts Used

Prompts used during implementation:

1. "Create a senior-level implementation plan to maximize technical interview score for this React + Go calculator assignment."
2. "Start implementation. Build required files first and postpone extra features."
3. "Implement a maintainable React + TypeScript frontend with validation, API client, responsive UI, and unit tests."
4. "Implement Go backend endpoint with clean validation, JSON error contract, and table-driven unit tests."
5. "Generate README with setup, run instructions, API examples, and design rationale."

## 11. Known Limitations

- Floating-point arithmetic can produce precision artifacts for some decimal values.
- Optional advanced operations were not included in MVP by design.
- Docker setup intentionally deferred as optional after required scope.

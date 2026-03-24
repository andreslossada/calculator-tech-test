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
- Optional operations implemented: exponent, sqrt, percentage
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

## How To Evaluate In 5 Minutes

1. Start both services from the repository root:

```bash
npm run dev
```

Expected:

- Frontend available at `http://localhost:5173`
- Backend available at `http://localhost:8080`
- Health endpoint returns `{"status":"ok"}`

2. Validate core API behavior:

```bash
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"add","a":10,"b":5}'

curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"divide","a":10,"b":0}'
```

Expected:

- First request returns `{"result":15}`
- Second request returns `400` with error code `DIVISION_BY_ZERO`

3. Run tests:

```bash
cd backend && go test ./...
cd ../frontend && npm test
```

Expected:

- Backend tests pass (service + handler)
- Frontend tests pass (validation, API success/error, keyboard and mode flows)

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
- `exponent`
- `sqrt`
- `percentage`

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

```bash
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"exponent","a":2,"b":3}'
```

```bash
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"sqrt","a":9}'
```

```bash
curl -X POST http://localhost:8080/api/v1/calculate \
  -H "Content-Type: application/json" \
  -d '{"operation":"percentage","a":50,"b":10}'
```

## Design Decisions And Assumptions

- Single endpoint (`POST /api/v1/calculate`) to keep integration simple and extensible.
- Layered backend design:
  - `internal/httpapi`: transport, validation, status codes
  - `internal/calculator`: pure business logic
- Error contract uses stable `code` + `message` for predictable frontend behavior.
- Numeric type: `float64` / `number` for assignment scope.
- Optional operations are implemented on top of the same endpoint contract.

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

1. "Necesito un plan rapido para hacer este challenge React + Go sin perder tiempo en extras."
2. "Arranquemos por lo obligatorio: suma, resta, multiplicacion y division, despues vemos bonus."
3. "Arma el endpoint POST /api/v1/calculate con validaciones decentes y errores claros en JSON."
4. "Separa bien handler y logica de negocio para que el backend no quede mezclado."
5. "Escribe tests table-driven en Go para operaciones normales y casos borde, sobre todo division por cero."
6. "En frontend, crea una UI simple pero prolija, con validacion antes de pegarle al backend."
7. "Haz un cliente API tipado en TS para no meter fetch directo en los componentes."
8. "Agrega estados de loading/success/error y bloquea doble submit mientras responde la API."
9. "Cubre los flujos clave con Vitest + Testing Library: exito, validaciones y error de backend."
10. "Ayudame a dejar el README listo para entrevista: setup, tests, ejemplos de API y decisiones tecnicas."

## Known Limitations

- Floating-point arithmetic can produce precision artifacts for some decimal values.
- Beyond the implemented optional operations (`exponent`, `sqrt`, `percentage`), no additional advanced operations are included.
- Docker setup is provided for local full-stack execution but was kept intentionally simple for interview scope.

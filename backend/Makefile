PORT ?= 8080
ALLOWED_ORIGIN ?= http://localhost:5173

run:
	PORT=$(PORT) ALLOWED_ORIGIN=$(ALLOWED_ORIGIN) go run ./cmd/server

test:
	go test ./...

coverage:
	go test ./... -coverprofile=coverage.out
	go tool cover -func=coverage.out

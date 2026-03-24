FROM golang:1.22-alpine AS builder

WORKDIR /app

COPY go.mod ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/server ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot

WORKDIR /

ENV PORT=8080
ENV ALLOWED_ORIGIN=http://localhost:5173

COPY --from=builder /out/server /server

EXPOSE 8080

ENTRYPOINT ["/server"]

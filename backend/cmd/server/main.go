package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/andres/calculator-tech-test/backend/internal/httpapi"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:5173"
	}
	allowedOrigins := parseAllowedOrigins(allowedOrigin)

	mux := http.NewServeMux()
	httpapi.RegisterRoutes(mux)

	server := &http.Server{
		Addr:    ":" + port,
		Handler: corsMiddleware(allowedOrigins, mux),
	}

	log.Printf("calculator backend listening on :%s", port)
	if err := server.ListenAndServe(); err != nil {
		log.Fatal(err)
	}
}

func parseAllowedOrigins(raw string) map[string]struct{} {
	allowed := make(map[string]struct{})
	for _, origin := range strings.Split(raw, ",") {
		trimmed := strings.TrimSpace(origin)
		if trimmed == "" {
			continue
		}
		allowed[strings.ToLower(trimmed)] = struct{}{}
	}
	return allowed
}

func corsMiddleware(allowedOrigins map[string]struct{}, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			if _, ok := allowedOrigins[strings.ToLower(origin)]; ok {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			}
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

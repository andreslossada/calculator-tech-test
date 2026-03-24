package httpapi

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCalculateHandler_Success(t *testing.T) {
	mux := http.NewServeMux()
	RegisterRoutes(mux)

	body := []byte(`{"operation":"add","a":7,"b":3}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/calculate", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	res := httptest.NewRecorder()
	mux.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}

	var payload map[string]float64
	if err := json.Unmarshal(res.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed parsing response: %v", err)
	}

	if payload["result"] != 10 {
		t.Fatalf("expected result 10, got %v", payload["result"])
	}
}

func TestCalculateHandler_DivisionByZero(t *testing.T) {
	mux := http.NewServeMux()
	RegisterRoutes(mux)

	body := []byte(`{"operation":"divide","a":7,"b":0}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/calculate", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")

	res := httptest.NewRecorder()
	mux.ServeHTTP(res, req)

	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", res.Code)
	}
}

func TestCalculateHandler_InvalidPayload(t *testing.T) {
	mux := http.NewServeMux()
	RegisterRoutes(mux)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/calculate", bytes.NewReader([]byte("not-json")))
	req.Header.Set("Content-Type", "application/json")

	res := httptest.NewRecorder()
	mux.ServeHTTP(res, req)

	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d", res.Code)
	}
}

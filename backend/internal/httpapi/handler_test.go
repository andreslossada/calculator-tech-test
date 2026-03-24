package httpapi

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

type handlerErrorResponse struct {
	Error struct {
		Code    string `json:"code"`
		Message string `json:"message"`
	} `json:"error"`
}

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

func TestHealthHandler_Success(t *testing.T) {
	mux := http.NewServeMux()
	RegisterRoutes(mux)

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	res := httptest.NewRecorder()

	mux.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", res.Code)
	}

	var payload map[string]string
	if err := json.Unmarshal(res.Body.Bytes(), &payload); err != nil {
		t.Fatalf("failed parsing response: %v", err)
	}

	if payload["status"] != "ok" {
		t.Fatalf("expected status ok, got %q", payload["status"])
	}
}

func TestCalculateHandler_ValidationAndContractErrors(t *testing.T) {
	tests := []struct {
		name       string
		body       string
		wantStatus int
		wantCode   string
	}{
		{
			name:       "missing operation",
			body:       `{"a":7,"b":3}`,
			wantStatus: http.StatusBadRequest,
			wantCode:   "OPERATION_REQUIRED",
		},
		{
			name:       "unsupported operation",
			body:       `{"operation":"noop","a":7,"b":3}`,
			wantStatus: http.StatusBadRequest,
			wantCode:   "INVALID_OPERATION",
		},
		{
			name:       "unknown field",
			body:       `{"operation":"add","a":7,"b":3,"extra":true}`,
			wantStatus: http.StatusBadRequest,
			wantCode:   "INVALID_PAYLOAD",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mux := http.NewServeMux()
			RegisterRoutes(mux)

			req := httptest.NewRequest(http.MethodPost, "/api/v1/calculate", bytes.NewReader([]byte(tt.body)))
			req.Header.Set("Content-Type", "application/json")
			res := httptest.NewRecorder()

			mux.ServeHTTP(res, req)

			if res.Code != tt.wantStatus {
				t.Fatalf("expected status %d, got %d", tt.wantStatus, res.Code)
			}

			var payload handlerErrorResponse
			if err := json.Unmarshal(res.Body.Bytes(), &payload); err != nil {
				t.Fatalf("failed parsing response: %v", err)
			}

			if payload.Error.Code != tt.wantCode {
				t.Fatalf("expected error code %q, got %q", tt.wantCode, payload.Error.Code)
			}

			if payload.Error.Message == "" {
				t.Fatal("expected non-empty error message")
			}
		})
	}
}

package httpapi

import (
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"

	"github.com/andres/calculator-tech-test/backend/internal/calculator"
)

type calculateRequest struct {
	Operation string  `json:"operation"`
	A         float64 `json:"a"`
	B         float64 `json:"b"`
}

type calculateResponse struct {
	Result float64 `json:"result"`
}

type errorResponse struct {
	Error apiError `json:"error"`
}

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /health", healthHandler)
	mux.HandleFunc("POST /api/v1/calculate", calculateHandler)
}

func healthHandler(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func calculateHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var payload calculateRequest
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&payload); err != nil {
		writeError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Request body must be valid JSON.")
		return
	}

	if err := validateRequest(payload); err != nil {
		status, code := mapValidationError(err)
		writeError(w, status, code, err.Error())
		return
	}

	result, err := calculator.Compute(calculator.Operation(payload.Operation), payload.A, payload.B)
	if err != nil {
		if errors.Is(err, calculator.ErrDivisionByZero) {
			writeError(w, http.StatusBadRequest, "DIVISION_BY_ZERO", "Division by zero is not allowed.")
			return
		}

		writeError(w, http.StatusBadRequest, "INVALID_OPERATION", "Operation is not supported.")
		return
	}

	writeJSON(w, http.StatusOK, calculateResponse{Result: result})
}

func validateRequest(payload calculateRequest) error {
	if payload.Operation == "" {
		return errors.New("operation is required")
	}

	if math.IsNaN(payload.A) || math.IsInf(payload.A, 0) || math.IsNaN(payload.B) || math.IsInf(payload.B, 0) {
		return errors.New("inputs must be finite numbers")
	}

	return nil
}

func mapValidationError(err error) (int, string) {
	switch err.Error() {
	case "operation is required":
		return http.StatusBadRequest, "OPERATION_REQUIRED"
	case "inputs must be finite numbers":
		return http.StatusBadRequest, "INVALID_INPUT"
	default:
		return http.StatusBadRequest, "VALIDATION_ERROR"
	}
}

func writeError(w http.ResponseWriter, status int, code string, message string) {
	writeJSON(w, status, errorResponse{
		Error: apiError{
			Code:    code,
			Message: message,
		},
	})
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	if err := json.NewEncoder(w).Encode(payload); err != nil {
		http.Error(w, fmt.Sprintf(`{"error":{"code":"INTERNAL_ERROR","message":"%s"}}`, err.Error()), http.StatusInternalServerError)
	}
}

package httpapi

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math"
	"net/http"
	"strings"

	"github.com/andres/calculator-tech-test/backend/internal/calculator"
)

type calculateRequest struct {
	Operation string  `json:"operation"`
	A         float64 `json:"a"`
	B         float64 `json:"b"`
}

func normalizeOperation(operation string) string {
	switch strings.ToLower(strings.TrimSpace(operation)) {
	case "+", "add", "addition":
		return string(calculator.OperationAdd)
	case "-", "subtract", "subtraction":
		return string(calculator.OperationSubtract)
	case "*", "x", "multiply", "multiplication":
		return string(calculator.OperationMultiply)
	case "/", "divide", "division":
		return string(calculator.OperationDivide)
	case "^", "pow", "power", "exponent", "exponentiation":
		return string(calculator.OperationExponent)
	case "sqrt", "square_root", "square root", "√":
		return string(calculator.OperationSqrt)
	case "%", "percent", "percentage":
		return string(calculator.OperationPercent)
	default:
		return strings.ToLower(strings.TrimSpace(operation))
	}
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
		writeDecodeError(w, err)
		return
	}

	var trailing json.RawMessage
	if err := decoder.Decode(&trailing); err != io.EOF {
		writeError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Request body must contain a single JSON object.")
		return
	}

	if err := validateRequest(payload); err != nil {
		status, code := mapValidationError(err)
		writeError(w, status, code, err.Error())
		return
	}

	payload.Operation = normalizeOperation(payload.Operation)

	result, err := calculator.Compute(calculator.Operation(payload.Operation), payload.A, payload.B)
	if err != nil {
		if errors.Is(err, calculator.ErrDivisionByZero) {
			writeError(w, http.StatusBadRequest, "DIVISION_BY_ZERO", "Division by zero is not allowed.")
			return
		}

		if errors.Is(err, calculator.ErrNegativeSqrt) {
			writeError(w, http.StatusBadRequest, "NEGATIVE_SQRT", "Square root of a negative number is not allowed.")
			return
		}

		writeError(w, http.StatusBadRequest, "INVALID_OPERATION", "Operation is not supported.")
		return
	}

	writeJSON(w, http.StatusOK, calculateResponse{Result: result})
}

func writeDecodeError(w http.ResponseWriter, err error) {
	var syntaxErr *json.SyntaxError
	var typeErr *json.UnmarshalTypeError

	switch {
	case errors.Is(err, io.EOF):
		writeError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Request body must not be empty.")
	case errors.As(err, &syntaxErr):
		writeError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Request body must be valid JSON.")
	case errors.As(err, &typeErr):
		writeError(w, http.StatusBadRequest, "INVALID_INPUT", "Inputs must be valid numeric values.")
	case strings.Contains(err.Error(), "unknown field"):
		writeError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Request body contains unknown fields.")
	default:
		writeError(w, http.StatusBadRequest, "INVALID_PAYLOAD", "Request body must be valid JSON.")
	}
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

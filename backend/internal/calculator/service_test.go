package calculator

import "testing"

func TestCompute(t *testing.T) {
	tests := []struct {
		name      string
		op        Operation
		a         float64
		b         float64
		want      float64
		wantError error
	}{
		{name: "add", op: OperationAdd, a: 10, b: 5, want: 15},
		{name: "subtract", op: OperationSubtract, a: 10, b: 5, want: 5},
		{name: "multiply", op: OperationMultiply, a: 10, b: 5, want: 50},
		{name: "divide", op: OperationDivide, a: 10, b: 5, want: 2},
		{name: "exponent", op: OperationExponent, a: 2, b: 3, want: 8},
		{name: "square root", op: OperationSqrt, a: 9, b: 0, want: 3},
		{name: "percentage", op: OperationPercent, a: 50, b: 10, want: 5},
		{name: "division by zero", op: OperationDivide, a: 10, b: 0, wantError: ErrDivisionByZero},
		{name: "sqrt of negative number", op: OperationSqrt, a: -9, b: 0, wantError: ErrNegativeSqrt},
		{name: "invalid operation", op: "noop", a: 10, b: 5, wantError: ErrInvalidOperation},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := Compute(tt.op, tt.a, tt.b)
			if tt.wantError != nil {
				if err != tt.wantError {
					t.Fatalf("expected error %v, got %v", tt.wantError, err)
				}
				return
			}

			if err != nil {
				t.Fatalf("expected no error, got %v", err)
			}

			if got != tt.want {
				t.Fatalf("expected result %v, got %v", tt.want, got)
			}
		})
	}
}

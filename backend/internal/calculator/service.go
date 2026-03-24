package calculator

import (
	"errors"
	"math"
)

type Operation string

const (
	OperationAdd      Operation = "add"
	OperationSubtract Operation = "subtract"
	OperationMultiply Operation = "multiply"
	OperationDivide   Operation = "divide"
	OperationExponent Operation = "exponent"
	OperationSqrt     Operation = "sqrt"
	OperationPercent  Operation = "percentage"
)

var (
	ErrInvalidOperation = errors.New("invalid operation")
	ErrDivisionByZero   = errors.New("division by zero")
	ErrNegativeSqrt     = errors.New("square root of negative number")
)

func Compute(operation Operation, a, b float64) (float64, error) {
	switch operation {
	case OperationAdd:
		return a + b, nil
	case OperationSubtract:
		return a - b, nil
	case OperationMultiply:
		return a * b, nil
	case OperationDivide:
		if b == 0 {
			return 0, ErrDivisionByZero
		}
		return a / b, nil
	case OperationExponent:
		return math.Pow(a, b), nil
	case OperationSqrt:
		if a < 0 {
			return 0, ErrNegativeSqrt
		}
		return math.Sqrt(a), nil
	case OperationPercent:
		return (a * b) / 100, nil
	default:
		return 0, ErrInvalidOperation
	}
}

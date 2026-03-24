package calculator

import "errors"

type Operation string

const (
	OperationAdd      Operation = "add"
	OperationSubtract Operation = "subtract"
	OperationMultiply Operation = "multiply"
	OperationDivide   Operation = "divide"
)

var (
	ErrInvalidOperation = errors.New("invalid operation")
	ErrDivisionByZero   = errors.New("division by zero")
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
	default:
		return 0, ErrInvalidOperation
	}
}

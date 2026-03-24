export type Operation = 'add' | 'subtract' | 'multiply' | 'divide'

export type FormState = {
    a: string
    b: string
    operation: Operation
}

export type CalculationSnapshot = {
    a: number
    b: number
    operation: Operation
    result: number
}

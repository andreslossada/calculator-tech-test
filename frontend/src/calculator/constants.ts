import type { FormState, Operation } from './types'

export const INITIAL_FORM: FormState = {
    a: '',
    b: '',
    operation: 'add',
}

export const OPERATION_OPTIONS: Array<{
    value: Operation
    label: string
    symbol: string
    shortcut: string
}> = [
    { value: 'add', label: 'Addition', symbol: '+', shortcut: '+' },
    { value: 'subtract', label: 'Subtraction', symbol: '-', shortcut: '-' },
    { value: 'multiply', label: 'Multiplication', symbol: 'x', shortcut: '*' },
    { value: 'divide', label: 'Division', symbol: '/', shortcut: '/' },
]

export const OPERATION_META_BY_TYPE: Record<Operation, { label: string; symbol: string }> = {
    add: { label: 'Addition', symbol: '+' },
    subtract: { label: 'Subtraction', symbol: '-' },
    multiply: { label: 'Multiplication', symbol: 'x' },
    divide: { label: 'Division', symbol: '/' },
}

export const AUTO_RECALCULATE_DELAY_MS = 300

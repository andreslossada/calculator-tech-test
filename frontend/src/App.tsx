import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { calculate } from './api/calculatorApi'
import { useCalculatorKeyboard } from './hooks/useCalculatorKeyboard'
import './App.css'

type Operation = 'add' | 'subtract' | 'multiply' | 'divide'

type FormState = {
    a: string
    b: string
    operation: Operation
}

const INITIAL_FORM: FormState = {
    a: '',
    b: '',
    operation: 'add',
}

const OPERATION_OPTIONS: Array<{ value: Operation; label: string; symbol: string; shortcut: string }> = [
    { value: 'add', label: 'Addition', symbol: '+', shortcut: '+' },
    { value: 'subtract', label: 'Subtraction', symbol: '-', shortcut: '-' },
    { value: 'multiply', label: 'Multiplication', symbol: 'x', shortcut: '*' },
    { value: 'divide', label: 'Division', symbol: '/', shortcut: '/' },
]

function App() {
    const [form, setForm] = useState<FormState>(INITIAL_FORM)
    const [result, setResult] = useState<number | null>(null)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [activeField, setActiveField] = useState<'a' | 'b'>('a')
    const firstNumberRef = useRef<HTMLInputElement>(null)
    const secondNumberRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        firstNumberRef.current?.focus()
    }, [])

    const operationLabel = useMemo(() => {
        const labels: Record<Operation, string> = {
            add: 'Addition',
            subtract: 'Subtraction',
            multiply: 'Multiplication',
            divide: 'Division',
        }

        return labels[form.operation]
    }, [form.operation])

    const updateField = (field: 'a' | 'b', value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
        setActiveField(field)
    }

    const focusField = (field: 'a' | 'b') => {
        if (field === 'a') {
            firstNumberRef.current?.focus()
            return
        }

        secondNumberRef.current?.focus()
    }

    const updateOperation = (operation: Operation) => {
        setForm((prev) => ({ ...prev, operation }))
        setActiveField('b')
        secondNumberRef.current?.focus()
    }

    const updateActiveFieldValue = (updater: (value: string) => string) => {
        setForm((prev) => {
            const nextValue = updater(prev[activeField])
            return { ...prev, [activeField]: nextValue }
        })
        setError('')
        setResult(null)
        focusField(activeField)
    }

    const appendDigitToActiveField = (digit: string) => {
        updateActiveFieldValue((currentValue) => {
            if (currentValue === '0') {
                return digit
            }

            if (currentValue === '-0') {
                return `-${digit}`
            }

            return `${currentValue}${digit}`
        })
    }

    const appendDecimalToActiveField = () => {
        updateActiveFieldValue((currentValue) => {
            if (currentValue.includes('.')) {
                return currentValue
            }

            if (currentValue === '') {
                return '0.'
            }

            if (currentValue === '-') {
                return '-0.'
            }

            return `${currentValue}.`
        })
    }

    const backspaceActiveField = () => {
        updateActiveFieldValue((currentValue) => currentValue.slice(0, -1))
    }

    const validateForm = (): string | null => {
        if (form.a.trim() === '' || form.b.trim() === '') {
            return 'Both numbers are required.'
        }

        const parsedA = Number(form.a)
        const parsedB = Number(form.b)

        if (!Number.isFinite(parsedA) || !Number.isFinite(parsedB)) {
            return 'Please enter valid numeric values.'
        }

        return null
    }

    const submitCalculation = async () => {
        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            setResult(null)
            return
        }

        setError('')
        setIsLoading(true)

        try {
            const response = await calculate({
                operation: form.operation,
                a: Number(form.a),
                b: Number(form.b),
            })
            setResult(response.result)
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Unexpected error'
            setError(message)
            setResult(null)
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        await submitCalculation()
    }

    const onReset = () => {
        setForm(INITIAL_FORM)
        setResult(null)
        setError('')
        setActiveField('a')
        firstNumberRef.current?.focus()
    }

    useCalculatorKeyboard({
        onOperationChange: updateOperation,
        onCalculate: () => {
            if (!isLoading) {
                void submitCalculation()
            }
        },
        onReset: () => {
            if (!isLoading) {
                onReset()
            }
        },
        onDigitInput: (digit) => appendDigitToActiveField(digit),
        onDecimalInput: () => appendDecimalToActiveField(),
        onBackspaceInput: () => backspaceActiveField(),
        isDisabled: isLoading,
    })

    return (
        <main className="layout">
            <section className="calculator-panel" aria-labelledby="calculator-title">
                <header className="panel-header">
                    <p className="eyebrow">Technical Test</p>
                    <h1 id="calculator-title">Full-Stack Calculator</h1>
                    <p>Bold UI, clear feedback, and keyboard-ready math flow.</p>
                </header>

                <form className="calculator-form" onSubmit={onSubmit}>
                    <label htmlFor="first-number">First number</label>
                    <input
                        id="first-number"
                        name="first-number"
                        type="number"
                        ref={firstNumberRef}
                        value={form.a}
                        onChange={(event) => updateField('a', event.target.value)}
                        onFocus={() => setActiveField('a')}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.preventDefault()
                                setActiveField('b')
                                secondNumberRef.current?.focus()
                            }
                        }}
                        inputMode="decimal"
                        placeholder="e.g. 24"
                    />

                    <fieldset className="operation-group" aria-label="Operation">
                        <legend>Operation</legend>
                        <div className="operation-grid" role="radiogroup" aria-label="Select operation">
                            {OPERATION_OPTIONS.map((option) => {
                                const isActive = form.operation === option.value

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`operation-button${isActive ? ' active' : ''}`}
                                        aria-pressed={isActive}
                                        aria-label={`${option.label} (${option.shortcut})`}
                                        aria-keyshortcuts={option.shortcut}
                                        onMouseDown={(event) => event.preventDefault()}
                                        onClick={() => updateOperation(option.value)}
                                    >
                                        <span className="operation-symbol">{option.symbol}</span>
                                        <span className="operation-meta">
                                            <span className="operation-label">{option.label}</span>
                                            <span className="operation-shortcut">key {option.shortcut}</span>
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </fieldset>

                    <label htmlFor="second-number">Second number</label>
                    <input
                        id="second-number"
                        name="second-number"
                        type="number"
                        ref={secondNumberRef}
                        value={form.b}
                        onChange={(event) => updateField('b', event.target.value)}
                        onFocus={() => setActiveField('b')}
                        inputMode="decimal"
                        placeholder="e.g. 6"
                    />

                    <div className="button-row">
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? 'Calculating...' : 'Calculate'}
                        </button>
                        <button type="button" className="secondary" onClick={onReset} disabled={isLoading}>
                            Reset
                        </button>
                    </div>

                    <p className="keyboard-help" aria-live="polite">
                        Shortcuts: +, -, *, / to switch operation. Enter to calculate. Esc or c to clear.
                    </p>
                </form>
            </section>

            <section className="result-panel" aria-live="polite">
                <h2>Result</h2>
                <p className="operation-name">Current operation: {operationLabel}</p>

                {error ? (
                    <p className="feedback error" role="alert">
                        {error}
                    </p>
                ) : result === null ? (
                    <p className="feedback hint">Run a calculation to see the output.</p>
                ) : (
                    <p className="feedback success">{result}</p>
                )}
            </section>
        </main>
    )
}

export default App

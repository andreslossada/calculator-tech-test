import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { calculate } from './api/calculatorApi'
import { useCalculatorKeyboard } from './hooks/useCalculatorKeyboard'
import './App.css'

type Operation = 'add' | 'subtract' | 'multiply' | 'divide'
type ViewMode = 'input' | 'calculator'
type ThemeMode = 'light' | 'dark'

type FormState = {
    a: string
    b: string
    operation: Operation
}

type CalculationSnapshot = {
    a: number
    b: number
    operation: Operation
    result: number
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

const KEYPAD_BUTTONS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'backspace'] as const
const THEME_STORAGE_KEY = 'calculator-theme'
const AUTO_RECALCULATE_DELAY_MS = 300
const NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 12,
})

const formatNumberValue = (value: number) => {
    if (!Number.isFinite(value)) {
        return '0'
    }

    return NUMBER_FORMATTER.format(value)
}

const getInitialTheme = (): ThemeMode => {
    if (typeof window === 'undefined') {
        return 'light'
    }

    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme
    }

    if (typeof window.matchMedia !== 'function') {
        return 'light'
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
    const [form, setForm] = useState<FormState>(INITIAL_FORM)
    const [, setResult] = useState<number | null>(null)
    const [lastCalculation, setLastCalculation] = useState<CalculationSnapshot | null>(null)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [viewMode, setViewMode] = useState<ViewMode>('input')
    const [activeField, setActiveField] = useState<'a' | 'b'>('a')
    const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme)
    const [resultAnimationKey, setResultAnimationKey] = useState(0)
    const firstNumberRef = useRef<HTMLInputElement>(null)
    const secondNumberRef = useRef<HTMLInputElement>(null)
    const modeStageRef = useRef<HTMLDivElement>(null)
    const modeContentRef = useRef<HTMLDivElement>(null)
    const autoRecalculateTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
    const [modeStageHeight, setModeStageHeight] = useState<number>()

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', themeMode)
        window.localStorage.setItem(THEME_STORAGE_KEY, themeMode)
    }, [themeMode])

    useEffect(() => {
        if (viewMode === 'input') {
            firstNumberRef.current?.focus()
        }
    }, [viewMode])

    useLayoutEffect(() => {
        const stageElement = modeStageRef.current
        const contentElement = modeContentRef.current

        if (!stageElement || !contentElement) {
            return
        }

        const measureHeight = () => {
            setModeStageHeight(contentElement.getBoundingClientRect().height)
        }

        measureHeight()

        if (typeof ResizeObserver !== 'function') {
            return
        }

        const resizeObserver = new ResizeObserver(() => {
            measureHeight()
        })

        resizeObserver.observe(contentElement)

        return () => {
            resizeObserver.disconnect()
        }
    }, [viewMode])

    const operationMeta = useMemo(() => {
        const byOperation: Record<Operation, { label: string; symbol: string }> = {
            add: { label: 'Addition', symbol: '+' },
            subtract: { label: 'Subtraction', symbol: '-' },
            multiply: { label: 'Multiplication', symbol: 'x' },
            divide: { label: 'Division', symbol: '/' },
        }

        return byOperation[form.operation]
    }, [form.operation])

    const activeOperationMeta = useMemo(() => {
        const operation = lastCalculation?.operation ?? form.operation

        const byOperation: Record<Operation, { label: string; symbol: string }> = {
            add: { label: 'Addition', symbol: '+' },
            subtract: { label: 'Subtraction', symbol: '-' },
            multiply: { label: 'Multiplication', symbol: 'x' },
            divide: { label: 'Division', symbol: '/' },
        }

        return byOperation[operation]
    }, [form.operation, lastCalculation?.operation])

    const resultSummary = useMemo(() => {
        if (!lastCalculation || error) {
            return null
        }

        const expression = `${formatNumberValue(lastCalculation.a)} ${activeOperationMeta.symbol} ${formatNumberValue(lastCalculation.b)} = ${formatNumberValue(lastCalculation.result)}`

        return {
            expression,
            value: formatNumberValue(lastCalculation.result),
        }
    }, [activeOperationMeta.symbol, error, lastCalculation])

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
        if (viewMode === 'input') {
            secondNumberRef.current?.focus()
        }

        if (lastCalculation !== null && !isLoading) {
            void submitCalculation(operation)
        }
    }

    const updateActiveFieldValue = (updater: (value: string) => string) => {
        setForm((prev) => {
            const nextValue = updater(prev[activeField])
            return { ...prev, [activeField]: nextValue }
        })
        setError('')

        if (viewMode === 'input') {
            focusField(activeField)
        }
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

    const focusNextCalculatorField = () => {
        if (viewMode !== 'calculator') {
            return
        }

        setActiveField((prev) => (prev === 'a' ? 'b' : 'a'))
    }

    const focusPreviousCalculatorField = () => {
        if (viewMode !== 'calculator') {
            return
        }

        setActiveField((prev) => (prev === 'a' ? 'b' : 'a'))
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

    const submitCalculation = async (operationOverride?: Operation) => {
        if (autoRecalculateTimeoutRef.current !== null) {
            window.clearTimeout(autoRecalculateTimeoutRef.current)
            autoRecalculateTimeoutRef.current = null
        }

        const operationToUse = operationOverride ?? form.operation
        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            setResult(null)
            setLastCalculation(null)
            return
        }

        setError('')
        setIsLoading(true)

        const parsedA = Number(form.a)
        const parsedB = Number(form.b)

        try {
            const response = await calculate({
                operation: operationToUse,
                a: parsedA,
                b: parsedB,
            })
            setResult(response.result)
            setLastCalculation({
                a: parsedA,
                b: parsedB,
                operation: operationToUse,
                result: response.result,
            })
            setResultAnimationKey((prev) => prev + 1)
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Unexpected error'
            setError(message)
            setResult(null)
            setLastCalculation(null)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!lastCalculation || isLoading) {
            return
        }

        const parsedA = Number(form.a)
        const parsedB = Number(form.b)
        if (!Number.isFinite(parsedA) || !Number.isFinite(parsedB)) {
            return
        }

        const hasChangedSinceLastResult =
            parsedA !== lastCalculation.a || parsedB !== lastCalculation.b || form.operation !== lastCalculation.operation

        if (!hasChangedSinceLastResult) {
            return
        }

        autoRecalculateTimeoutRef.current = window.setTimeout(() => {
            void submitCalculation()
        }, AUTO_RECALCULATE_DELAY_MS)

        return () => {
            if (autoRecalculateTimeoutRef.current !== null) {
                window.clearTimeout(autoRecalculateTimeoutRef.current)
                autoRecalculateTimeoutRef.current = null
            }
        }
    }, [form.a, form.b, form.operation, isLoading, lastCalculation])

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        await submitCalculation()
    }

    const onReset = () => {
        if (autoRecalculateTimeoutRef.current !== null) {
            window.clearTimeout(autoRecalculateTimeoutRef.current)
            autoRecalculateTimeoutRef.current = null
        }

        setForm(INITIAL_FORM)
        setResult(null)
        setLastCalculation(null)
        setError('')
        setActiveField('a')
        if (viewMode === 'input') {
            firstNumberRef.current?.focus()
        }
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
        onFocusNextField: focusNextCalculatorField,
        onFocusPreviousField: focusPreviousCalculatorField,
        isDisabled: isLoading,
    })

    return (
        <main className={`layout${themeMode === 'dark' ? ' dark' : ''}`}>
            <section className="calculator-panel" aria-labelledby="calculator-title">
                <header className="panel-header">
                    <h1 id="calculator-title">Full-Stack Calculator</h1>
                    <div className="view-toggle" role="group" aria-label="View mode" data-mode={viewMode}>
                        <span className="view-toggle-indicator" aria-hidden="true" />
                        <button
                            type="button"
                            className={`view-toggle-button${viewMode === 'input' ? ' active' : ''}`}
                            aria-pressed={viewMode === 'input'}
                            onClick={() => setViewMode('input')}
                        >
                            Input mode
                        </button>
                        <button
                            type="button"
                            className={`view-toggle-button${viewMode === 'calculator' ? ' active' : ''}`}
                            aria-pressed={viewMode === 'calculator'}
                            onClick={() => setViewMode('calculator')}
                        >
                            Calculator mode
                        </button>
                    </div>
                </header>

                <div
                    className="mode-stage"
                    ref={modeStageRef}
                    style={modeStageHeight ? { height: `${modeStageHeight}px` } : undefined}
                >
                    <div className="mode-stage-content" ref={modeContentRef}>
                        {viewMode === 'input' ? (
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
                                <p className="keyboard-help keyboard-help-subtle" aria-label="Keyboard shortcuts available">
                                    Shortcuts: <kbd>0-9</kbd> <kbd>+ - * /</kbd> <kbd>Enter</kbd> calculate <kbd>Esc</kbd> reset.
                                </p>
                            </form>
                        ) : (
                            <section className="calculator-shell" aria-label="Calculator keypad mode">
                                <div className="calculator-display" aria-live="polite">
                                    <button
                                        type="button"
                                        className={`display-line${activeField === 'a' ? ' active' : ''}`}
                                        onClick={() => setActiveField('a')}
                                    >
                                        <span className="display-label">A</span>
                                        <span className="display-value">{form.a || '0'}</span>
                                    </button>
                                    <button
                                        type="button"
                                        className={`display-line${activeField === 'b' ? ' active' : ''}`}
                                        onClick={() => setActiveField('b')}
                                    >
                                        <span className="display-label">B</span>
                                        <span className="display-value">{form.b || '0'}</span>
                                    </button>
                                    <p className="display-operation">{operationMeta.label}</p>
                                </div>

                                <div className="calculator-actions" aria-label="Calculator operations">
                                    {OPERATION_OPTIONS.map((option) => {
                                        const isActive = form.operation === option.value

                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                className={`calculator-op-button${isActive ? ' active' : ''}`}
                                                onClick={() => updateOperation(option.value)}
                                            >
                                                {option.symbol}
                                            </button>
                                        )
                                    })}
                                </div>

                                <div className="calculator-keypad" aria-label="Calculator keypad">
                                    {KEYPAD_BUTTONS.map((key) => (
                                        <button
                                            key={key}
                                            type="button"
                                            className={`keypad-button${key === 'backspace' ? ' key-wide' : ''}`}
                                            onClick={() => {
                                                if (key === 'backspace') {
                                                    backspaceActiveField()
                                                    return
                                                }

                                                if (key === '.') {
                                                    appendDecimalToActiveField()
                                                    return
                                                }

                                                appendDigitToActiveField(key)
                                            }}
                                        >
                                            {key === 'backspace' ? 'DEL' : key}
                                        </button>
                                    ))}
                                </div>

                                <div className="button-row calculator-controls">
                                    <button type="button" className="secondary" onClick={onReset} disabled={isLoading}>
                                        Clear
                                    </button>
                                    <button
                                        type="button"
                                        className="calculator-equals"
                                        onClick={() => void submitCalculation()}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Calculating...' : '='}
                                    </button>
                                </div>

                                <p className="keyboard-help keyboard-help-subtle" aria-label="Keyboard shortcuts available">
                                    Shortcuts: <kbd>0-9</kbd> <kbd>+ - * /</kbd> <kbd>Enter</kbd> calculate <kbd>Esc</kbd> reset.
                                </p>
                            </section>
                        )}
                    </div>
                </div>
            </section>

            <section className="result-panel" aria-live="polite">
                <h2>Result</h2>

                {error ? (
                    <article className="result-card error" role="alert">
                        <p className="result-card-label">Operation failed</p>
                        <p className="result-card-value">{error}</p>
                    </article>
                ) : lastCalculation === null ? (
                        <article className="result-card hint">
                            <p className="result-card-label">Waiting for calculation</p>
                            <p className="result-card-value">Run a calculation to see the output.</p>
                        </article>
                    ) : (
                        <article className={`result-card success${viewMode === 'calculator' ? ' calculator' : ''}`}>
                            {viewMode === 'calculator' ? (
                                <div className="result-live" key={`calculator-${resultAnimationKey}`}>
                                    <p className="result-card-label">Calculator display</p>
                                    <div className="result-display" aria-label="Result display">
                                        <p className="result-expression">{resultSummary?.expression}</p>
                                        <p className="result-value">{resultSummary?.value}</p>
                                    </div>
                                </div>
                            ) : (
                                    <div className="result-live" key={`input-${resultAnimationKey}`}>
                                        <p className="result-card-label">Operation summary</p>
                                        <p className="result-expression">{resultSummary?.expression}</p>
                                        <p className="result-value">{resultSummary?.value}</p>
                                    </div>
                                )}
                            </article>
                )}
            </section>

            <button
                type="button"
                className={`theme-switch${themeMode === 'dark' ? ' dark' : ''}`}
                role="switch"
                aria-checked={themeMode === 'dark'}
                aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                onClick={() => setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            >
                <span className="theme-switch-icon theme-switch-icon-sun" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                        <circle cx="12" cy="12" r="4.2" />
                        <path d="M12 2.4v2.4M12 19.2v2.4M21.6 12h-2.4M4.8 12H2.4M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7M18.8 18.8l-1.7-1.7M6.9 6.9 5.2 5.2" />
                    </svg>
                </span>
                <span className="theme-switch-track" aria-hidden="true">
                    <span className="theme-switch-thumb" />
                </span>
                <span className="theme-switch-icon theme-switch-icon-moon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                        <path d="M16.8 3.2a9.5 9.5 0 1 0 4 17.7 8.5 8.5 0 1 1-4-17.7z" />
                    </svg>
                </span>
            </button>
        </main>
    )
}

export default App

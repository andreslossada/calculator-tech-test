import { OPERATION_OPTIONS } from '../calculator/constants'
import type { FormState, Operation } from '../calculator/types'
import type { OperandField } from '../view/models'

const KEYPAD_BUTTONS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0', 'backspace'] as const

type CalculatorModePanelProps = {
    form: FormState
    activeField: OperandField
    operationLabel: string
    isLoading: boolean
    onSetActiveField: (field: OperandField) => void
    onUpdateOperation: (operation: Operation) => void
    onAppendDigit: (digit: string) => void
    onAppendDecimal: () => void
    onBackspace: () => void
    onReset: () => void
    onCalculate: () => void
}

export const CalculatorModePanel = ({
    form,
    activeField,
    operationLabel,
    isLoading,
    onSetActiveField,
    onUpdateOperation,
    onAppendDigit,
    onAppendDecimal,
    onBackspace,
    onReset,
    onCalculate,
}: CalculatorModePanelProps) => {
    const isUnaryOperation = form.operation === 'sqrt'

    return (
        <section className="calculator-shell" aria-label="Calculator keypad mode">
            <div className="calculator-display" aria-live="polite">
                <button
                    type="button"
                    className={`display-line${activeField === 'a' ? ' active' : ''}`}
                    onClick={() => onSetActiveField('a')}
                >
                    <span className="display-label">A</span>
                    <span className="display-value">{form.a || '0'}</span>
                </button>
                <button
                    type="button"
                    className={`display-line${activeField === 'b' ? ' active' : ''}`}
                    onClick={() => onSetActiveField('b')}
                    disabled={isUnaryOperation}
                >
                    <span className="display-label">B</span>
                    <span className="display-value">{isUnaryOperation ? '--' : form.b || '0'}</span>
                </button>
                <p className="display-operation">{operationLabel}</p>
            </div>

            <div className="calculator-actions" aria-label="Calculator operations">
                {OPERATION_OPTIONS.map((option) => {
                    const isActive = form.operation === option.value

                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={`calculator-op-button${isActive ? ' active' : ''}`}
                            onClick={() => onUpdateOperation(option.value)}
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
                                onBackspace()
                                return
                            }

                            if (key === '.') {
                                onAppendDecimal()
                                return
                            }

                            onAppendDigit(key)
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
                <button type="button" className="calculator-equals" onClick={onCalculate} disabled={isLoading}>
                    {isLoading ? 'Calculating...' : '='}
                </button>
            </div>

            <p className="keyboard-help keyboard-help-subtle" aria-label="Keyboard shortcuts available">
                Shortcuts: <kbd>0-9</kbd> <kbd>+ - * / ^ % R</kbd> <kbd>Enter</kbd> calculate <kbd>Esc</kbd> reset.
            </p>
        </section>
    )
}

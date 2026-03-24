import type { FormEvent, RefObject } from 'react'
import { OPERATION_OPTIONS } from '../calculator/constants'
import type { FormState, Operation } from '../calculator/types'

type InputModeFormProps = {
    form: FormState
    isLoading: boolean
    firstNumberRef: RefObject<HTMLInputElement | null>
    secondNumberRef: RefObject<HTMLInputElement | null>
    onUpdateField: (field: 'a' | 'b', value: string) => void
    onSetActiveField: (field: 'a' | 'b') => void
    onMoveFocusToSecondField: () => void
    onUpdateOperation: (operation: Operation) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
    onReset: () => void
}

export const InputModeForm = ({
    form,
    isLoading,
    firstNumberRef,
    secondNumberRef,
    onUpdateField,
    onSetActiveField,
    onMoveFocusToSecondField,
    onUpdateOperation,
    onSubmit,
    onReset,
}: InputModeFormProps) => {
    return (
        <form className="calculator-form" onSubmit={onSubmit}>
            <label htmlFor="first-number">First number</label>
            <input
                id="first-number"
                name="first-number"
                type="number"
                ref={firstNumberRef}
                value={form.a}
                onChange={(event) => onUpdateField('a', event.target.value)}
                onFocus={() => onSetActiveField('a')}
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault()
                        onMoveFocusToSecondField()
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
                                onClick={() => onUpdateOperation(option.value)}
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
                onChange={(event) => onUpdateField('b', event.target.value)}
                onFocus={() => onSetActiveField('b')}
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
    )
}

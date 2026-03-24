import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { OPERATION_META_BY_TYPE } from './calculator/constants'
import { formatNumberValue } from './calculator/formatters'
import type { Operation } from './calculator/types'
import { CalculatorModePanel } from './components/CalculatorModePanel'
import { InputModeForm } from './components/InputModeForm'
import { ResultPanel } from './components/ResultPanel'
import { ThemeSwitch } from './components/ThemeSwitch'
import { ViewModeToggle } from './components/ViewModeToggle'
import { useCalculatorKeyboard } from './hooks/useCalculatorKeyboard'
import { useCalculator } from './hooks/useCalculator'
import { useModeStageHeight } from './hooks/useModeStageHeight'
import { useOperandInputController } from './hooks/useOperandInputController'
import { useThemeMode } from './hooks/useThemeMode'
import type { ViewMode } from './view/types'
import './App.css'

const THEME_STORAGE_KEY = 'calculator-theme'

function App() {
    const { form, setForm, lastCalculation, error, setError, isLoading, resultAnimationKey, submitCalculation, resetCalculationState } =
        useCalculator()
    const [viewMode, setViewMode] = useState<ViewMode>('input')
    const { themeMode, setThemeMode } = useThemeMode(THEME_STORAGE_KEY)
    const firstNumberRef = useRef<HTMLInputElement>(null)
    const secondNumberRef = useRef<HTMLInputElement>(null)
    const modeStageRef = useRef<HTMLDivElement>(null)
    const modeContentRef = useRef<HTMLDivElement>(null)
    const modeStageHeight = useModeStageHeight({
        stageRef: modeStageRef,
        contentRef: modeContentRef,
        dependency: viewMode,
    })
    const {
        activeField,
        setActiveField,
        updateField,
        appendDigitToActiveField,
        appendDecimalToActiveField,
        backspaceActiveField,
        focusNextCalculatorField,
        focusPreviousCalculatorField,
        focusSecondInputField,
        resetToFirstField,
    } = useOperandInputController({
        setForm,
        setError,
        viewMode,
        firstNumberRef,
        secondNumberRef,
    })

    useEffect(() => {
        if (viewMode === 'input') {
            firstNumberRef.current?.focus()
        }
    }, [viewMode])

    const operationMeta = useMemo(() => {
        return OPERATION_META_BY_TYPE[form.operation]
    }, [form.operation])

    const activeOperationMeta = useMemo(() => {
        const operation = lastCalculation?.operation ?? form.operation

        return OPERATION_META_BY_TYPE[operation]
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

    const updateOperation = (operation: Operation) => {
        setForm((prev) => ({ ...prev, operation }))
        setActiveField('b')
        if (viewMode === 'input') {
            focusSecondInputField()
        }

        if (lastCalculation !== null && !isLoading) {
            void submitCalculation(operation)
        }
    }

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        await submitCalculation()
    }

    const onReset = () => {
        resetCalculationState()
        resetToFirstField()
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
                    <ViewModeToggle viewMode={viewMode} onChangeViewMode={setViewMode} />
                </header>

                <div
                    className="mode-stage"
                    ref={modeStageRef}
                    style={modeStageHeight ? { height: `${modeStageHeight}px` } : undefined}
                >
                    <div className="mode-stage-content" ref={modeContentRef}>
                        {viewMode === 'input' ? (
                            <InputModeForm
                                form={form}
                                isLoading={isLoading}
                                firstNumberRef={firstNumberRef}
                                secondNumberRef={secondNumberRef}
                                onUpdateField={updateField}
                                onSetActiveField={setActiveField}
                                onMoveFocusToSecondField={focusSecondInputField}
                                onUpdateOperation={updateOperation}
                                onSubmit={onSubmit}
                                onReset={onReset}
                            />
                        ) : (
                                <CalculatorModePanel
                                    form={form}
                                    activeField={activeField}
                                    operationLabel={operationMeta.label}
                                    isLoading={isLoading}
                                    onSetActiveField={setActiveField}
                                    onUpdateOperation={updateOperation}
                                    onAppendDigit={appendDigitToActiveField}
                                    onAppendDecimal={appendDecimalToActiveField}
                                    onBackspace={backspaceActiveField}
                                    onReset={onReset}
                                    onCalculate={() => void submitCalculation()}
                                />
                        )}
                    </div>
                </div>
            </section>

            <ResultPanel
                error={error}
                lastCalculation={lastCalculation}
                viewMode={viewMode}
                resultAnimationKey={resultAnimationKey}
                resultSummary={resultSummary}
            />

            <ThemeSwitch
                themeMode={themeMode}
                onToggle={() => setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            />
        </main>
    )
}

export default App

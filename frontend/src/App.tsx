import { CalculatorModePanel } from './components/CalculatorModePanel'
import { InputModeForm } from './components/InputModeForm'
import { ResultPanel } from './components/ResultPanel'
import { ThemeSwitch } from './components/ThemeSwitch'
import { ViewModeToggle } from './components/ViewModeToggle'
import { useAppCalculatorController } from './hooks/useAppCalculatorController'
import './App.css'

function App() {
    const {
        viewMode,
        setViewMode,
        themeMode,
        toggleThemeMode,
        modeStageRef,
        modeContentRef,
        modeStageHeight,
        form,
        isLoading,
        firstNumberRef,
        secondNumberRef,
        updateField,
        setActiveField,
        focusSecondInputField,
        updateOperation,
        onSubmit,
        onReset,
        activeField,
        operationLabel,
        appendDigitToActiveField,
        appendDecimalToActiveField,
        backspaceActiveField,
        onCalculate,
        error,
        lastCalculation,
        resultAnimationKey,
        resultSummary,
    } = useAppCalculatorController()

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
                                    operationLabel={operationLabel}
                                    isLoading={isLoading}
                                    onSetActiveField={setActiveField}
                                    onUpdateOperation={updateOperation}
                                    onAppendDigit={appendDigitToActiveField}
                                    onAppendDecimal={appendDecimalToActiveField}
                                    onBackspace={backspaceActiveField}
                                    onReset={onReset}
                                    onCalculate={onCalculate}
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
                onToggle={toggleThemeMode}
            />
        </main>
    )
}

export default App

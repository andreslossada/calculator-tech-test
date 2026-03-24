import type { CalculationSnapshot } from '../calculator/types'
import type { ViewMode } from '../view/types'

type ResultSummary = {
    expression: string
    value: string
}

type ResultPanelProps = {
    error: string
    lastCalculation: CalculationSnapshot | null
    viewMode: ViewMode
    resultAnimationKey: number
    resultSummary: ResultSummary | null
}

export const ResultPanel = ({ error, lastCalculation, viewMode, resultAnimationKey, resultSummary }: ResultPanelProps) => {
    return (
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
    )
}

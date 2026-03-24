import type { ViewMode } from '../view/types'

type ViewModeToggleProps = {
    viewMode: ViewMode
    onChangeViewMode: (mode: ViewMode) => void
}

export const ViewModeToggle = ({ viewMode, onChangeViewMode }: ViewModeToggleProps) => {
    return (
        <div className="view-toggle" role="group" aria-label="View mode" data-mode={viewMode}>
            <span className="view-toggle-indicator" aria-hidden="true" />
            <button
                type="button"
                className={`view-toggle-button${viewMode === 'input' ? ' active' : ''}`}
                aria-pressed={viewMode === 'input'}
                onClick={() => onChangeViewMode('input')}
            >
                Input mode
            </button>
            <button
                type="button"
                className={`view-toggle-button${viewMode === 'calculator' ? ' active' : ''}`}
                aria-pressed={viewMode === 'calculator'}
                onClick={() => onChangeViewMode('calculator')}
            >
                Calculator mode
            </button>
        </div>
    )
}

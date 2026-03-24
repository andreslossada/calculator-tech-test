import type { ThemeMode } from '../view/types'

type ThemeSwitchProps = {
    themeMode: ThemeMode
    onToggle: () => void
}

export const ThemeSwitch = ({ themeMode, onToggle }: ThemeSwitchProps) => {
    return (
        <button
            type="button"
            className={`theme-switch${themeMode === 'dark' ? ' dark' : ''}`}
            role="switch"
            aria-checked={themeMode === 'dark'}
            aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={onToggle}
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
    )
}

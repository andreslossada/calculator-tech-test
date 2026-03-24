import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FormState } from '../calculator/types'
import { useOperandInputController } from './useOperandInputController'

describe('useOperandInputController', () => {
    let formState: FormState
    let setErrorMock: ReturnType<typeof vi.fn>
    let firstFocusMock: ReturnType<typeof vi.fn>
    let secondFocusMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
        formState = { a: '', b: '', operation: 'add' }
        setErrorMock = vi.fn()
        firstFocusMock = vi.fn()
        secondFocusMock = vi.fn()
    })

    const setup = (viewMode: 'input' | 'calculator' = 'input') => {
        const setFormMock = vi.fn((update: FormState | ((prev: FormState) => FormState)) => {
            formState = typeof update === 'function' ? update(formState) : update
        })

        const firstNumberRef = { current: { focus: firstFocusMock } as unknown as HTMLInputElement }
        const secondNumberRef = { current: { focus: secondFocusMock } as unknown as HTMLInputElement }

        const hook = renderHook(() =>
            useOperandInputController({
                setForm: setFormMock,
                setError: setErrorMock as unknown as (value: string) => void,
                viewMode,
                firstNumberRef,
                secondNumberRef,
            }),
        )

        return {
            ...hook,
            setFormMock,
        }
    }

    it('updates requested field and sets it as active', () => {
        const { result } = setup()

        act(() => {
            result.current.updateField('b', '42')
        })

        expect(formState.b).toBe('42')
        expect(result.current.activeField).toBe('b')
    })

    it('appends digits and clears errors in input mode', () => {
        const { result } = setup('input')

        act(() => {
            result.current.updateField('a', '0')
            result.current.appendDigitToActiveField('7')
        })

        expect(formState.a).toBe('7')
        expect(setErrorMock).toHaveBeenCalledWith('')
        expect(firstFocusMock).toHaveBeenCalled()
    })

    it('appends decimal only once per operand', () => {
        const { result } = setup('input')

        act(() => {
            result.current.updateField('a', '')
            result.current.appendDecimalToActiveField()
            result.current.appendDecimalToActiveField()
        })

        expect(formState.a).toBe('0.')
    })

    it('backspace removes the last character from active operand', () => {
        const { result } = setup('input')

        act(() => {
            result.current.updateField('b', '123')
        })

        act(() => {
            result.current.backspaceActiveField()
        })

        expect(formState.b).toBe('12')
    })

    it('switches active field with calculator tab helpers only in calculator mode', () => {
        const { result } = setup('calculator')

        expect(result.current.activeField).toBe('a')

        act(() => {
            result.current.focusNextCalculatorField()
        })
        expect(result.current.activeField).toBe('b')

        act(() => {
            result.current.focusPreviousCalculatorField()
        })
        expect(result.current.activeField).toBe('a')
    })

    it('focuses second input and sets active field to b', () => {
        const { result } = setup('input')

        act(() => {
            result.current.focusSecondInputField()
        })

        expect(result.current.activeField).toBe('b')
        expect(secondFocusMock).toHaveBeenCalled()
    })

    it('resets to first field and focuses first input in input mode', () => {
        const { result } = setup('input')

        act(() => {
            result.current.updateField('b', '50')
            result.current.resetToFirstField()
        })

        expect(result.current.activeField).toBe('a')
        expect(firstFocusMock).toHaveBeenCalled()
    })
})

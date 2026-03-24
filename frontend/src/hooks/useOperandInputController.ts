import { useState } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import type { FormState } from '../calculator/types'
import type { OperandField } from '../view/models'
import type { ViewMode } from '../view/types'

type UseOperandInputControllerParams = {
    setForm: Dispatch<SetStateAction<FormState>>
    setError: (value: string) => void
    viewMode: ViewMode
    firstNumberRef: RefObject<HTMLInputElement | null>
    secondNumberRef: RefObject<HTMLInputElement | null>
}

export const useOperandInputController = ({
    setForm,
    setError,
    viewMode,
    firstNumberRef,
    secondNumberRef,
}: UseOperandInputControllerParams) => {
    const [activeField, setActiveField] = useState<OperandField>('a')

    const focusField = (field: OperandField) => {
        if (field === 'a') {
            firstNumberRef.current?.focus()
            return
        }

        secondNumberRef.current?.focus()
    }

    const focusSecondInputField = () => {
        setActiveField('b')
        secondNumberRef.current?.focus()
    }

    const resetToFirstField = () => {
        setActiveField('a')

        if (viewMode === 'input') {
            firstNumberRef.current?.focus()
        }
    }

    const updateField = (field: OperandField, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
        setActiveField(field)
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

    return {
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
    }
}

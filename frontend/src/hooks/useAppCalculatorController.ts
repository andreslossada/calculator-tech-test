import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import { OPERATION_META_BY_TYPE } from '../calculator/constants'
import { formatNumberValue } from '../calculator/formatters'
import type { CalculationSnapshot, FormState, Operation } from '../calculator/types'
import type { OperandField, ResultSummary } from '../view/models'
import type { ThemeMode, ViewMode } from '../view/types'
import { useCalculatorKeyboard } from './useCalculatorKeyboard'
import { useCalculator } from './useCalculator'
import { useModeStageHeight } from './useModeStageHeight'
import { useOperandInputController } from './useOperandInputController'
import { useThemeMode } from './useThemeMode'

const THEME_STORAGE_KEY = 'calculator-theme'

export type UseAppCalculatorControllerResult = {
    viewMode: ViewMode
    setViewMode: Dispatch<SetStateAction<ViewMode>>
    themeMode: ThemeMode
    toggleThemeMode: () => void
    modeStageRef: RefObject<HTMLDivElement | null>
    modeContentRef: RefObject<HTMLDivElement | null>
    modeStageHeight: number | undefined
    form: FormState
    isLoading: boolean
    firstNumberRef: RefObject<HTMLInputElement | null>
    secondNumberRef: RefObject<HTMLInputElement | null>
    updateField: (field: OperandField, value: string) => void
    setActiveField: Dispatch<SetStateAction<OperandField>>
    focusSecondInputField: () => void
    updateOperation: (operation: Operation) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
    onReset: () => void
    activeField: OperandField
    operationLabel: string
    appendDigitToActiveField: (digit: string) => void
    appendDecimalToActiveField: () => void
    backspaceActiveField: () => void
    onCalculate: () => void
    error: string
    lastCalculation: CalculationSnapshot | null
    resultAnimationKey: number
    resultSummary: ResultSummary | null
}

export const useAppCalculatorController = (): UseAppCalculatorControllerResult => {
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

    const resultSummary = useMemo<ResultSummary | null>(() => {
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

    return {
        viewMode,
        setViewMode,
        themeMode,
        toggleThemeMode: () => setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark')),
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
        operationLabel: operationMeta.label,
        appendDigitToActiveField,
        appendDecimalToActiveField,
        backspaceActiveField,
        onCalculate: () => void submitCalculation(),
        error,
        lastCalculation,
        resultAnimationKey,
        resultSummary,
    }
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { calculate } from '../api/calculatorApi'
import { AUTO_RECALCULATE_DELAY_MS, INITIAL_FORM } from '../calculator/constants'
import type { CalculationSnapshot, FormState, Operation } from '../calculator/types'

type UseCalculatorParams = {
    onSuccessfulCalculation?: () => void
}

const validateForm = (form: FormState): string | null => {
    if (form.a.trim() === '' || form.b.trim() === '') {
        return 'Both numbers are required.'
    }

    const parsedA = Number(form.a)
    const parsedB = Number(form.b)

    if (!Number.isFinite(parsedA) || !Number.isFinite(parsedB)) {
        return 'Please enter valid numeric values.'
    }

    return null
}

export const useCalculator = ({ onSuccessfulCalculation }: UseCalculatorParams = {}) => {
    const [form, setForm] = useState<FormState>(INITIAL_FORM)
    const [lastCalculation, setLastCalculation] = useState<CalculationSnapshot | null>(null)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [resultAnimationKey, setResultAnimationKey] = useState(0)
    const autoRecalculateTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)

    const clearPendingRecalculation = useCallback(() => {
        if (autoRecalculateTimeoutRef.current !== null) {
            window.clearTimeout(autoRecalculateTimeoutRef.current)
            autoRecalculateTimeoutRef.current = null
        }
    }, [])

    const submitCalculation = useCallback(async (operationOverride?: Operation) => {
        clearPendingRecalculation()

        const operationToUse = operationOverride ?? form.operation
        const validationError = validateForm(form)
        if (validationError) {
            setError(validationError)
            setLastCalculation(null)
            return
        }

        setError('')
        setIsLoading(true)

        const parsedA = Number(form.a)
        const parsedB = Number(form.b)

        try {
            const response = await calculate({
                operation: operationToUse,
                a: parsedA,
                b: parsedB,
            })

            setLastCalculation({
                a: parsedA,
                b: parsedB,
                operation: operationToUse,
                result: response.result,
            })
            setResultAnimationKey((prev) => prev + 1)
            onSuccessfulCalculation?.()
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Unexpected error'
            setError(message)
            setLastCalculation(null)
        } finally {
            setIsLoading(false)
        }
    }, [clearPendingRecalculation, form, onSuccessfulCalculation])

    const resetCalculationState = () => {
        clearPendingRecalculation()
        setForm(INITIAL_FORM)
        setLastCalculation(null)
        setError('')
    }

    useEffect(() => {
        if (!lastCalculation || isLoading) {
            return
        }

        const parsedA = Number(form.a)
        const parsedB = Number(form.b)
        if (!Number.isFinite(parsedA) || !Number.isFinite(parsedB)) {
            return
        }

        const hasChangedSinceLastResult =
            parsedA !== lastCalculation.a ||
            parsedB !== lastCalculation.b ||
            form.operation !== lastCalculation.operation

        if (!hasChangedSinceLastResult) {
            return
        }

        autoRecalculateTimeoutRef.current = window.setTimeout(() => {
            void submitCalculation()
        }, AUTO_RECALCULATE_DELAY_MS)

        return clearPendingRecalculation
    }, [clearPendingRecalculation, form.a, form.b, form.operation, isLoading, lastCalculation, submitCalculation])

    useEffect(() => clearPendingRecalculation, [clearPendingRecalculation])

    return {
        form,
        setForm,
        lastCalculation,
        error,
        setError,
        isLoading,
        resultAnimationKey,
        submitCalculation,
        resetCalculationState,
    }
}

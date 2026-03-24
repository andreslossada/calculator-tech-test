import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useCalculator } from './useCalculator'
import { calculate } from '../api/calculatorApi'

vi.mock('../api/calculatorApi', () => ({
    calculate: vi.fn(),
}))

const calculateMock = vi.mocked(calculate)

describe('useCalculator', () => {
    beforeEach(() => {
        calculateMock.mockReset()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('returns validation error when submitting empty values', async () => {
        const { result } = renderHook(() => useCalculator())

        await act(async () => {
            await result.current.submitCalculation()
        })

        expect(result.current.error).toBe('Both numbers are required.')
        expect(result.current.lastCalculation).toBeNull()
        expect(calculateMock).not.toHaveBeenCalled()
    })

    it('submits and stores successful calculation snapshot', async () => {
        calculateMock.mockResolvedValue({ result: 30 })
        const onSuccessfulCalculation = vi.fn()

        const { result } = renderHook(() => useCalculator({ onSuccessfulCalculation }))

        act(() => {
            result.current.setForm({ a: '24', b: '6', operation: 'add' })
        })

        await act(async () => {
            await result.current.submitCalculation()
        })

        await waitFor(() => {
            expect(result.current.lastCalculation).toEqual({
                a: 24,
                b: 6,
                operation: 'add',
                result: 30,
            })
        })

        expect(result.current.error).toBe('')
        expect(result.current.resultAnimationKey).toBe(1)
        expect(onSuccessfulCalculation).toHaveBeenCalledTimes(1)
    })

    it('stores API error when calculation request fails', async () => {
        calculateMock.mockRejectedValue(new Error('Division by zero is not allowed.'))
        const { result } = renderHook(() => useCalculator())

        act(() => {
            result.current.setForm({ a: '4', b: '0', operation: 'divide' })
        })

        await act(async () => {
            await result.current.submitCalculation()
        })

        expect(result.current.error).toBe('Division by zero is not allowed.')
        expect(result.current.lastCalculation).toBeNull()
    })

    it('resets form and clears feedback', async () => {
        calculateMock.mockResolvedValue({ result: 30 })
        const { result } = renderHook(() => useCalculator())

        act(() => {
            result.current.setForm({ a: '24', b: '6', operation: 'add' })
        })

        await act(async () => {
            await result.current.submitCalculation()
        })

        act(() => {
            result.current.resetCalculationState()
        })

        expect(result.current.form).toEqual({ a: '', b: '', operation: 'add' })
        expect(result.current.error).toBe('')
        expect(result.current.lastCalculation).toBeNull()
    })

    it('auto recalculates after operand changes with debounce', async () => {
        vi.useFakeTimers()
        calculateMock
            .mockResolvedValueOnce({ result: 30 })
            .mockResolvedValueOnce({ result: 32 })

        const { result } = renderHook(() => useCalculator())

        act(() => {
            result.current.setForm({ a: '24', b: '6', operation: 'add' })
        })

        await act(async () => {
            await result.current.submitCalculation()
        })

        act(() => {
            result.current.setForm((prev) => ({ ...prev, b: '8' }))
        })

        await act(async () => {
            await vi.advanceTimersByTimeAsync(301)
        })

        expect(calculateMock).toHaveBeenCalledTimes(2)
        expect(result.current.lastCalculation?.result).toBe(32)
        expect(result.current.lastCalculation?.b).toBe(8)
    })
})

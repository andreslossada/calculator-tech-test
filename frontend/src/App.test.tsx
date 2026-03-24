import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('renders validation error when inputs are empty', async () => {
        render(<App />)

        await userEvent.click(screen.getByRole('button', { name: 'Calculate' }))

        expect(screen.getByRole('alert')).toHaveTextContent('First number is required.')
    })

    it('submits values and renders result from API', async () => {
        vi.spyOn(window, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ result: 30 }),
        } as Response)

        render(<App />)

        await userEvent.type(screen.getByLabelText('First number'), '24')
        await userEvent.click(screen.getByRole('button', { name: 'Addition (+)' }))
        await userEvent.type(screen.getByLabelText('Second number'), '6')
        await userEvent.click(screen.getByRole('button', { name: 'Calculate' }))

        await waitFor(() => {
            expect(screen.getByText('30')).toBeInTheDocument()
        })
    })

    it('renders API error message', async () => {
        vi.spyOn(window, 'fetch').mockResolvedValue({
            ok: false,
            json: async () => ({
                error: {
                    code: 'DIVISION_BY_ZERO',
                    message: 'Division by zero is not allowed.',
                },
            }),
        } as Response)

        render(<App />)

        await userEvent.type(screen.getByLabelText('First number'), '4')
        await userEvent.click(screen.getByRole('button', { name: 'Division (/)' }))
        await userEvent.type(screen.getByLabelText('Second number'), '0')
        await userEvent.click(screen.getByRole('button', { name: 'Calculate' }))

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Division by zero is not allowed.')
        })
    })

    it('renders fallback error on network failure', async () => {
        vi.spyOn(window, 'fetch').mockRejectedValue(new Error('Network down'))

        render(<App />)

        await userEvent.type(screen.getByLabelText('First number'), '4')
        await userEvent.type(screen.getByLabelText('Second number'), '2')
        await userEvent.click(screen.getByRole('button', { name: 'Calculate' }))

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Network down')
        })
    })

    it('supports switching operation and calculating with keyboard shortcuts', async () => {
        const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ result: 10 }),
        } as Response)

        render(<App />)

        await userEvent.type(screen.getByLabelText('First number'), '30')
        await userEvent.type(screen.getByLabelText('Second number'), '3')
        await userEvent.click(screen.getByRole('heading', { name: 'Result' }))
        await userEvent.keyboard('/')
        await userEvent.keyboard('{Enter}')

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/calculate'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ operation: 'divide', a: 30, b: 3 }),
                }),
            )
        })
    })

    it('clears form and feedback using Escape shortcut', async () => {
        vi.spyOn(window, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ result: 16 }),
        } as Response)

        render(<App />)

        await userEvent.type(screen.getByLabelText('First number'), '12')
        await userEvent.type(screen.getByLabelText('Second number'), '4')
        await userEvent.click(screen.getByRole('button', { name: 'Calculate' }))

        await waitFor(() => {
            expect(screen.getByText('16')).toBeInTheDocument()
        })

        await userEvent.click(screen.getByLabelText('Second number'))
        await userEvent.keyboard('{Escape}')

        expect(screen.getByLabelText('First number')).toHaveValue(null)
        expect(screen.getByLabelText('Second number')).toHaveValue(null)
        expect(screen.getByText('Run a calculation to see the output.')).toBeInTheDocument()
    })

    it('accepts full keyboard flow from default focus state', async () => {
        const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ result: 30 }),
        } as Response)

        render(<App />)

        await userEvent.keyboard('24+6{Enter}')

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/calculate'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ operation: 'add', a: 24, b: 6 }),
                }),
            )
        })

        expect(screen.getByText('30')).toBeInTheDocument()
    })

    it('allows switching to calculator mode and calculating from keypad', async () => {
        const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ result: 9 }),
        } as Response)

        render(<App />)

        await userEvent.click(screen.getByRole('button', { name: 'Calculator mode' }))
        await userEvent.click(screen.getByRole('button', { name: '7' }))
        await userEvent.click(screen.getByRole('button', { name: '+' }))
        await userEvent.click(screen.getByRole('button', { name: '2' }))
        await userEvent.click(screen.getByRole('button', { name: '=' }))

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/calculate'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ operation: 'add', a: 7, b: 2 }),
                }),
            )
        })

        expect(screen.getByText('9', { selector: '.result-value' })).toBeInTheDocument()
    })

    it('switches active operand with Tab and Shift+Tab in calculator mode', async () => {
        const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ result: 15 }),
        } as Response)

        render(<App />)

        await userEvent.click(screen.getByRole('button', { name: 'Calculator mode' }))
        await userEvent.keyboard('1')
        await userEvent.keyboard('{Tab}')
        await userEvent.keyboard('2')
        await userEvent.keyboard('{Shift>}{Tab}{/Shift}')
        await userEvent.keyboard('3')
        await userEvent.keyboard('{Enter}')

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/calculate'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ operation: 'add', a: 13, b: 2 }),
                }),
            )
        })

        expect(screen.getByText('15', { selector: '.result-value' })).toBeInTheDocument()
    })

    it('formats large results with thousands separators', async () => {
        vi.spyOn(window, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ result: 12345.67 }),
        } as Response)

        render(<App />)

        await userEvent.type(screen.getByLabelText('First number'), '12000.67')
        await userEvent.type(screen.getByLabelText('Second number'), '345')
        await userEvent.click(screen.getByRole('button', { name: 'Calculate' }))

        await waitFor(() => {
            expect(screen.getByText('12,345.67', { selector: '.result-value' })).toBeInTheDocument()
            expect(screen.getByText('12,000.67 + 345 = 12,345.67')).toBeInTheDocument()
        })
    })

    it('calculates square root with first operand only', async () => {
        const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ result: 3 }),
        } as Response)

        render(<App />)

        await userEvent.type(screen.getByLabelText('First number'), '9')
        await userEvent.click(screen.getByRole('button', { name: 'Square Root (R)' }))
        await userEvent.click(screen.getByRole('button', { name: 'Calculate' }))

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/calculate'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ operation: 'sqrt', a: 9, b: 0 }),
                }),
            )
            expect(screen.getByText('3', { selector: '.result-value' })).toBeInTheDocument()
            expect(screen.getByText('sqrt(9) = 3')).toBeInTheDocument()
        })
    })

    it('calculates exponentiation in calculator mode', async () => {
        const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue({
            ok: true,
            json: async () => ({ result: 8 }),
        } as Response)

        render(<App />)

        await userEvent.click(screen.getByRole('button', { name: 'Calculator mode' }))
        await userEvent.click(screen.getByRole('button', { name: '2' }))
        await userEvent.click(screen.getByRole('button', { name: '^' }))
        await userEvent.click(screen.getByRole('button', { name: '3' }))
        await userEvent.click(screen.getByRole('button', { name: '=' }))

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenCalledWith(
                expect.stringContaining('/api/v1/calculate'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ operation: 'exponent', a: 2, b: 3 }),
                }),
            )
            expect(screen.getByText('8', { selector: '.result-value' })).toBeInTheDocument()
        })
    })

    it('recalculates the final result when operation changes after a successful calculation', async () => {
        const fetchSpy = vi
            .spyOn(window, 'fetch')
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ result: 30 }),
            } as Response)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ result: 4 }),
            } as Response)

        render(<App />)

        await userEvent.type(screen.getByLabelText('First number'), '24')
        await userEvent.type(screen.getByLabelText('Second number'), '6')
        await userEvent.click(screen.getByRole('button', { name: 'Calculate' }))

        await waitFor(() => {
            expect(screen.getByText('30', { selector: '.result-value' })).toBeInTheDocument()
        })

        await userEvent.click(screen.getByRole('button', { name: 'Division (/)' }))

        await waitFor(() => {
            expect(fetchSpy).toHaveBeenLastCalledWith(
                expect.stringContaining('/api/v1/calculate'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ operation: 'divide', a: 24, b: 6 }),
                }),
            )
            expect(screen.getByText('4', { selector: '.result-value' })).toBeInTheDocument()
            expect(screen.getByText('24 / 6 = 4')).toBeInTheDocument()
        })
    })

    it('auto recalculates after operand changes with debounce', async () => {
        const fetchSpy = vi
            .spyOn(window, 'fetch')
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ result: 30 }),
            } as Response)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ result: 32 }),
            } as Response)

        render(<App />)

        await userEvent.type(screen.getByLabelText('First number'), '24')
        await userEvent.type(screen.getByLabelText('Second number'), '6')
        await userEvent.click(screen.getByRole('button', { name: 'Calculate' }))

        await waitFor(() => {
            expect(screen.getByText('30', { selector: '.result-value' })).toBeInTheDocument()
        })

        await userEvent.clear(screen.getByLabelText('Second number'))
        await userEvent.type(screen.getByLabelText('Second number'), '8')

        await waitFor(
            () => {
                expect(fetchSpy).toHaveBeenLastCalledWith(
                    expect.stringContaining('/api/v1/calculate'),
                    expect.objectContaining({
                        method: 'POST',
                        body: JSON.stringify({ operation: 'add', a: 24, b: 8 }),
                    }),
                )
                expect(screen.getByText('32', { selector: '.result-value' })).toBeInTheDocument()
                expect(screen.getByText('24 + 8 = 32')).toBeInTheDocument()
            },
            { timeout: 1800 },
        )
    })
})

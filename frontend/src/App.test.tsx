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

        expect(screen.getByRole('alert')).toHaveTextContent('Both numbers are required.')
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

        await userEvent.click(screen.getByRole('heading', { name: 'Result' }))
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
})

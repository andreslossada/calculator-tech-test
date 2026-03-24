const NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 12,
})

export const formatNumberValue = (value: number) => {
    if (!Number.isFinite(value)) {
        return '0'
    }

    return NUMBER_FORMATTER.format(value)
}

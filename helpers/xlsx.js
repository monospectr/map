export const getCells = row => {
    const cells = []

    row.eachCell({ includeEmpty: true }, cell => {
        cells.push(cell)
    })

    return cells
}

export const sliceCells = (row, start, end) => {
    const cells = []

    row.eachCell((cell, i) => {
        if (i >= start && i < end) {
            cells.push(cell)
        }
    })

    return cells
}

export const parseNumber = /** string | number */value => {
    switch (typeof value) {
        case 'string':
            return Number(value.replace(/,/g, '.'))
        case 'number':
            return value
        default:
            throw new Error(`«${value}» должно быть число или строка`)
    }
}

export const parseNumberCell = cell => Number(String(cell.value).replace(/,/g, '.'))

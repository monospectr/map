import { parseNumber } from './xlsx.js'
import { convertCoords } from './convert-coords.js'

/**
 * Разбивает массив на массивы размера size
 * @param arr
 * @param size
 * @returns {*[]}
 */
const chunks = (arr, size) => {
    const chunkLength = Math.ceil(arr.length / size);
    const result = [];

    for (let i = 0; i < chunkLength; i++) {
        result.push(arr.slice(i * size, (i + 1) * size));
    }

    return result;
}

const sliceUntilValue = (arr, fn) => {
    const firstMatchedValue = arr.findIndex(fn)
    return arr.slice(0, firstMatchedValue !== -1 ? firstMatchedValue : Infinity)
}

export const convertCellCoordinate = cells => {
    if (cells.length !== 6) {
        throw new Error('Неверное количество значений координаты')
    }

    const parsedCells = cells.map(cell => {
        return parseNumber(cell.value)
    })

    const lat = parsedCells.slice(0, 3)
    const long = parsedCells.slice(3, 6)

    try {
        return convertCoords(lat, long)
    } catch (e) {
        throw new Error(`Неверный формат координат в диапазоне ${cells[0].address}—${cells[5].address}`)
    }
}

/**
 *
 * @param cells
 * @returns {number[][]}
 */
export const convertCellCoords = cells => {
    const nonEmptyCells = sliceUntilValue(cells, cell => cell.value === null)
    return chunks(nonEmptyCells, 6).map(convertCellCoordinate)
}

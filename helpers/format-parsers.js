import { parseNumber } from './xlsx.js'
import { convertCoords } from './convert-coords.js'

const chunks = (arr, size) => {
    const chunkLength = Math.ceil(arr.length / size);
    const result = [];

    for (let i = 0; i < chunkLength; i++) {
        result.push(arr.slice(i * size, (i + 1) * size));
    }

    return result;
}

export const pointCols = 6 // Количество ячеек для одной координаты

// const convertCellCoords = (coords) => {
//     try {
//         return convertCoords(
//             ...coords.map(
//                 coordinate => coordinate.map(parseNumberCell)
//             )
//         )
//     } catch (e) {
//         throw new Error(coords.map(coordinate => coordinate.map(cell => `${cell.address}: ${cell.value}`).join(', ')).join(', '))
//     }
// }

const sliceUntilValue = (arr, fn) => {
    const firstMatchedValue = arr.findIndex(fn)
    return arr.slice(0, firstMatchedValue !== -1 ? firstMatchedValue : Infinity)
}

export const convertCellCoordinate = cells => {
    if (cells.length !== 6) {
        throw new Error('Неверное количество значений координаты')
    }

    const parsedCells = cells.map(cell => {
        // console.log(cell._address)
        return parseNumber(cell.value)
    })

    const lat = parsedCells.slice(0, 3)
    const long = parsedCells.slice(3, 6)

    return convertCoords(lat, long)
}

export const convertCellCoords = cells => {
    const nonEmptyCells = sliceUntilValue(cells, cell => cell.value === null)
    return chunks(nonEmptyCells, 6).map(convertCellCoordinate)
}

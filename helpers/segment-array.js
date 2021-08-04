/**
 * @desc Создаёт массив из частей входного, обрезая их по длиннам segmentLengths
 * @example
 * segmentArray([1, 2, 3, 4, 5, 6, 7], [1, 2, 3]) => [[1], [2, 3], [4, 5, 6]]
 * segmentArray([1, 2, 3, 4, 5, 6, 7], [1, Infinity]) => [[1], [2, 3, 4, 5, 6, 7]]
 * @param arr {any[]}
 * @param segmentLengths {number[]}
 * @returns {any[]}
 */
export const segmentArray = (arr, segmentLengths) => {
    const segments = []

    let position = 0

    segmentLengths.forEach(segmentLength => {
        segments.push(arr.slice(position, position + segmentLength))
        position += segmentLength
    })

    return segments
}

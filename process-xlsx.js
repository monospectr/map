import { getCells } from './helpers/xlsx.js'
import { segmentArray } from './helpers/segment-array.js'
import { flipLngLatDeep, closePath } from './helpers/geo-utils.js'
import { convertCellCoords } from './helpers/format-parsers.js'
import { pipe } from './helpers/pipe.js'

const genId = (() => {
    let i = 0
    return () => i++
})()

export const processXlsx = async (buffer) => {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.worksheets.find(worksheet => worksheet.state === 'visible')
    const rows = worksheet.getRows(4, worksheet.rowCount)

    // console.log('rows', rows)

    let combinedPath
    // Индекс ячейки, которую нужно вырезать
    let lastPathIndex = -1
    let cutPath = null
    const paths = []

    rows.forEach((row, i) => {
        const [idCell, nameCell, lvl1Cell, lvl2Cell, lvl3OrCutMarkerCell, radiusCell, pathCells] = segmentArray(
            getCells(row),
            [1, 1, 1, 1, 1, 1, Infinity]
        )

        const name = nameCell[0] ? nameCell[0].value : null

        if (!name) {
            return
        }

        const lvl1 = lvl1Cell[0] ? lvl1Cell[0].value : null
        const lvl2 = lvl2Cell[0] ? lvl2Cell[0].value : null
        const lvl3OrCutMarker = lvl3OrCutMarkerCell[0] ? lvl3OrCutMarkerCell[0].value : null
        const isCut = Boolean(lvl3OrCutMarker && lvl3OrCutMarker.trim() === 'Вырез')

        const lvl3 = !isCut ? lvl3OrCutMarker : null

        const radius = radiusCell.length && radiusCell[0].value || null

        let feature
        if (radius) {
            const center = flipLngLatDeep(convertCellCoords(pathCells)[0])
            feature = turf.circle(center, radius, { steps: 60, })
        } else {
            const outerPath = pipe(pathCells, convertCellCoords, flipLngLatDeep, closePath)
            feature = pathCells.length ? turf.polygon([outerPath]) : []
        }

        if (isCut) {
            cutPath = cutPath ? turf.union(cutPath, feature) : feature
            const lastPath = paths.find(path => path.index === lastPathIndex)
            lastPath.feature = turf.mask(cutPath, lastPath.feature)
            return
        }

        cutPath = null
        lastPathIndex = i
        combinedPath = combinedPath ? turf.union(combinedPath, feature) : feature

        paths.push({
            index: i,
            name,
            fullName: [name, lvl1, lvl2, lvl3].filter(Boolean).join('. '),
            lvl2Cell: lvl2Cell[0].value,
            feature
        })
    })

    return {
        combinedPath: flipLngLatDeep(combinedPath.geometry.coordinates),
        boundingBox: flipLngLatDeep(turf.bboxPolygon(turf.bbox(combinedPath)).geometry.coordinates),
        paths: paths.map(({ feature, ...pathInfo }) => ({
            ...pathInfo,
            id: genId(),
            polygon: flipLngLatDeep(feature.geometry.coordinates)
        }))
    }
}

import { getCells } from './helpers/xlsx.js'
import { segmentArray } from './helpers/segment-array.js'
import { closePath } from './helpers/geo-utils.js'
import { convertCellCoords } from './helpers/format-parsers.js'
import { pipe } from './helpers/pipe.js'

/*const genId = (() => {
    let i = 0
    return () => i++
})()*/

const getRowInfo = row => {
    const [idCell, nameCell, lvl1Cell, lvl2Cell, lvl3OrCutMarkerCell, radiusCell, pathCells] = segmentArray(
        getCells(row),
        [1, 1, 1, 1, 1, 1, Infinity]
    )

    const name = nameCell[0] ? nameCell[0].value : null

    if (!name) {
        return null
    }

    const radius = radiusCell[0] ? radiusCell[0].value : null

    const feature = radius
        ? pipe(
            pathCells.slice(0, 6),
            convertCellCoords,
            coords => coords[0],
            turf.point,
            turf.flip,
            point => turf.circle(point, radius, { steps: 60 })
        )
        : pipe(
            pathCells,
            convertCellCoords,
            closePath,
            path => turf.polygon([path]),
            turf.flip
        )

    const lvl1 = lvl1Cell[0] ? lvl1Cell[0].value : null
    const lvl2 = lvl2Cell[0] ? lvl2Cell[0].value : null
    const lvl3OrCutMarker = lvl3OrCutMarkerCell[0] ? lvl3OrCutMarkerCell[0].value : null
    const isCut = Boolean(lvl3OrCutMarker && lvl3OrCutMarker.trim() === 'Вырез')
    const lvl3 = !isCut ? lvl3OrCutMarker : null

    return {
        objectName: name,
        name: [lvl1, lvl2, lvl3].filter(Boolean).join('. '),
        isCut,
        feature,
    }
}

export const processXlsx = async buffer => {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.worksheets.find(worksheet => worksheet.state === 'visible')
    const rows = worksheet.getRows(4, worksheet.rowCount)

    const zones = []

    let rowIndex = 0

    while (rowIndex < rows.length) {
        const rowInfo = getRowInfo(rows[rowIndex])

        if (!rowInfo) {
            rowIndex ++
            continue
        }

        rowIndex ++

        let cutCombinedFeature

        while (rowIndex < rows.length) {
            if (!rows[rowIndex]) {
                break
            }

            const cutRowInfo = getRowInfo(rows[rowIndex])

            if (!cutRowInfo || !cutRowInfo.isCut) {
                break
            }

            cutCombinedFeature = cutCombinedFeature
                ? turf.union(cutCombinedFeature, cutRowInfo.feature)
                : cutRowInfo.feature

            rowIndex ++
        }

        if (cutCombinedFeature) {
            rowInfo.feature = turf.mask(cutCombinedFeature, rowInfo.feature)
        }

        zones.push({
            name: rowInfo.name,
            objectName: rowInfo.objectName,
            feature: rowInfo.feature
        })
    }

    const resultZones = zones.map(({ feature, ...pathInfo }) => ({
        ...pathInfo,
        polygon: turf.flip(feature).geometry.coordinates
    }))

    try {
        const combinedFeature = zones.reduce((acc, zone) => (
            acc ? turf.union(acc, zone.feature) : zone.feature
        ), undefined)

        return {
            combinedPath: turf.flip(combinedFeature).geometry.coordinates,
            boundingBox: turf.flip(turf.bboxPolygon(turf.bbox(combinedFeature))).geometry.coordinates,
            zones: resultZones
        }
    } catch (e) {
        return {
            combinedPath: [],
            boundingBox: null,
            zones: resultZones
        }
    }
}

const flipLngLat = coordinate => [coordinate[1], coordinate[0]]

export const flipLngLatDeep = (coordinates) => {
    if (!Array.isArray(coordinates)) {
        throw new Error(`Должен быть массивом: «${coordinates}»`)
    }

    if (coordinates.every(Array.isArray)) {
        return coordinates.map(flipLngLatDeep)
    } else if (typeof coordinates[0] === 'number' && typeof coordinates[1] === 'number') {
        return flipLngLat(coordinates)
    } else {
        console.log(coordinates)
        throw new Error(`Неверный формат: «${coordinates}»`)
    }
}

/**
 * @typedef {[number, number]} Coordinate
 */

/**
 *
 * @param latLng {Coordinate}
 * @param radius {number}
 * @return {Coordinate[]}
 */
export const circleToPath = (latLng, radius) => {
    return turf.circle(
        flipLngLat(latLng),
        radius,
        { steps: 50, }
    ).geometry.coordinates[0].map(flipLngLat)
}

export const intersect = (...paths) => {
    return Boolean(turf.intersect(
        ...paths.map(
            path => turf.polygon([path.map(flipLngLat)])
        )
    ))
}

export const createPolygon = (path, holePaths) => {
    return [path, ...holePaths]
}

export const multiPolygon = (polygons) => turf.polygon(polygons)

export const union = (...paths) => {
    return turf.union(
        ...paths.map(
            path => turf.polygon([path.map(flipLngLat)])
        )
    ).geometry.coordinates[0].map(flipLngLat)
}

export const union2 = (...polygons) => {
    // console.log(inspect(polygons))

    const turfPolygons = polygons.map(
        polygon => turf.polygon(
            polygon.map(path => path.map(flipLngLat))
        )
    )

    return turf.union(...turfPolygons).geometry.coordinates.map(
        polygon => polygon.map(path => path.map(flipLngLat))
    )
}

export const simplify = (figure) => {
    return turf.simplify(turf.multiPolygon(figure), {
        tolerance: 0.2
    }).geometry.coordinates
}

export const closePath = (path) => {
    return path.length && path[0] !== path[path.length - 1]
        ? [...path, path[0]]
        : path
}

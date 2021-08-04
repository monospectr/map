export const closePath = (path) => {
    if (path.length < 3) {
        throw new Error('Путь должен содержать более 3 точек')
    }

    return path[0] !== path[path.length - 1]
        ? [...path, path[0]]
        : path
}

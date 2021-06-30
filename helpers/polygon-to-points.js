export const polygonToPoints = polygon => {
    const list = []

    const fn = (arr) => {
        if (!Array.isArray(arr)) {
            throw new Error(`Должен быть массивом: «${arr}»`)
        }

        if (arr.every(Array.isArray)) {
            arr.forEach(fn)
        } else if (typeof arr[0] === 'number' && typeof arr[1] === 'number') {
            list.push(arr)
        } else {
            throw new Error(`Неверный формат: «${arr}»`)
        }
    }

    fn(polygon)

    return list
}

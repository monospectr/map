/**
 * Группирует массив по ключу, который возвращает keyGetter, в виде Map
 * @param list {any[]}
 * @param keyGetter {function (key: any): any}
 * @returns {Map<any, any>}
 */
export const groupMapBy = (list, keyGetter) => {
    const map = new Map()

    list.forEach(item => {
        const key = keyGetter(item)
        const collection = map.get(key)

        if (!collection) {
            map.set(key, [item])
        } else {
            collection.push(item)
        }
    })

    return map
}

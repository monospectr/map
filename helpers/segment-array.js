export const segmentArray = (arr, segmentLengths) => {
    const segments = []

    let position = 0

    segmentLengths.forEach(segmentLength => {
        segments.push(arr.slice(position, position + segmentLength))
        position += segmentLength
    })

    return segments
}

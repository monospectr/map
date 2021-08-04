// from https://github.com/stevage/epsg/blob/master/crs-defs.json
proj4.defs('EPSG:4740', '+proj=longlat +a=6378136 +b=6356751.361745712 +towgs84=0,0,1.5,0,0,0.076,0 +no_defs')
proj4.defs('WGS84', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees');

const dmsToDecDegrees = (degrees, minutes, seconds) => degrees + minutes / 60 + seconds / 3600

/**
 * Конвертирует координаты вида [градусы, минуты, секунды] в численные значения
 * @param lat {[number, number, number]} Широта
 * @param long {[number, number, number]} Долгота
 * @returns {[number, number]} [Широта, Долгота]
 */
export const convertCoords = (lat, long) => {
    const [newLong, newLat] = proj4('EPSG:4740', 'EPSG:4326', [dmsToDecDegrees(...long), dmsToDecDegrees(...lat)])
    return [newLat, newLong]
}

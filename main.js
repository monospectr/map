import { processXlsx } from './process-xlsx.js'
import { polygonToPoints } from './helpers/polygon-to-points.js'
import { groupMapBy } from './helpers/group-map-by.js'
import { EventEmitter } from './helpers/event-emitter.js'

const fileEl = document.getElementById('file')
const errorsEl = document.getElementById('errors');
const mapCoverEl = document.getElementById('map')
const filtersEl = document.getElementById('filters')

let data
let mainLayer

const eventEmitter = new EventEmitter()

const zonesSelected = new Set()

const renderMap = () => {
    mainLayer.clearLayers()

    for (const zone of zonesSelected) {
        L.polygon(zone.polygon, {
            color: `rgba(255, 255, 255, .5)`,
            fillColor: `rgba(255, 255, 0, 1)`,
            weight: 1,
            // fillColor: 'none'
        }).addTo(mainLayer)

        polygonToPoints(zone.polygon).forEach((point, i) => {
            L.circleMarker(point, {
                radius: 2,
                color: 'rgb(255, 255, 255)'
            }).bindTooltip([zone.objectName, zone.name, `Точка ${i}`].join('<br />')).addTo(mainLayer);
        })
    }
}

eventEmitter.on('updateZones', renderMap)

const createCheckboxEl = (name, clickHandler) => {
    const labelEl = document.createElement('label')
    labelEl.className = 'filters-object-checkbox-label'

    const checkboxEl = document.createElement('input')
    checkboxEl.setAttribute('type', 'checkbox')
    checkboxEl.addEventListener('click', e => {
        e.preventDefault()
        const checked = e.currentTarget.checked

        setTimeout(() => {
            clickHandler(checked)
        }, 0)
    })

    const nameEl = document.createElement('span')
    nameEl.textContent = name

    labelEl.append(checkboxEl, nameEl)

    return labelEl
}

const renderFilters = () => {
    for (const [objectName, zones] of groupMapBy(data.zones, zone => zone.objectName)) {
        const objectEl = document.createElement('div')
        objectEl.style.marginBottom = '10px'

        const objectCheckboxEl = createCheckboxEl(objectName, checked => {
            if (checked) {
                zones.forEach(zone => zonesSelected.add(zone))
            } else {
                zones.forEach(zone => zonesSelected.delete(zone))
            }

            eventEmitter.emit('updateZones')
        })

        eventEmitter.on('updateZones', () => {
            objectCheckboxEl.querySelector('input').checked = zones.every(zone => zonesSelected.has(zone))
        })

        const zoneEl = document.createElement('div')

        for (const zone of zones) {
            const polygonCheckboxEl = createCheckboxEl(zone.name || '—', checked => {
                if (checked) {
                    zonesSelected.add(zone)
                } else {
                    zonesSelected.delete(zone)
                }

                eventEmitter.emit('updateZones')
            })

            polygonCheckboxEl.style.paddingLeft = '30px'

            eventEmitter.on('updateZones', () => {
                polygonCheckboxEl.querySelector('input').checked = zonesSelected.has(zone)
            })

            zoneEl.append(polygonCheckboxEl)
        }

        objectEl.append(objectCheckboxEl, zoneEl)

        filtersEl.append(objectEl)
    }
}

fileEl.addEventListener('change', async e => {
    const file = e.target.files[0]
    const buffer = await file.arrayBuffer()

    console.log(11)

    try {
        data = await processXlsx(buffer)

        console.log('data', data)

        mapCoverEl.classList.remove('g-hidden')
        fileEl.classList.add('g-hidden')

        const russiaBoundingBox = [
            [73.21470709028688, 176.6368103027344],
            [55.65415394402894, 28.98056030273438],
        ]

        const map = L.map('map-el').fitBounds(russiaBoundingBox)

        mainLayer = L.layerGroup().addTo(map)

        L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
                'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: 'mapsosc-b667cf5a',
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            detectRetina: true,
            tileSize: 512,
            zoomOffset: -1
        }).addTo(map)

        renderMap()
        renderFilters()

        L.polygon(data.boundingBox, {
            color: `rgba(255, 255, 0, .5)`,
            weight: 1,
            fillColor: 'none'
        }).addTo(map)

        map.fitBounds([data.boundingBox[0], data.boundingBox[2]])

        /*L.polygon(data.combinedPath, {
            color: `rgba(255, 255, 0, .5)`,
            weight: 1,
            fillColor: 'none'
        }).addTo(map)*/
    } catch (e) {
        console.dir(e)
        errorsEl.classList.remove('g-hidden')
        errorsEl.textContent = e.message
    }
})


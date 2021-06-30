import { processXlsx } from './process-xlsx.js'
import { polygonToPoints } from './helpers/polygon-to-points.js'
import { groupMapBy } from './helpers/group-map-by.js'
import { EventEmitter } from './helpers/event-emitter.js'

const fileEl = document.getElementById('file')
const mapCoverEl = document.getElementById('map')
const filtersEl = document.getElementById('filters')

let data
let mainLayer

const eventEmitter = new EventEmitter()

const objectsSelected = new Set()

const renderMap = () => {
    mainLayer.clearLayers()

    data.paths.forEach((path, i) => {
        if (!objectsSelected.has(path)) {
            return
        }

        L.polygon(path.polygon, {
            color: `rgba(255, 255, 255, .5)`,
            fillColor: `rgba(255, 255, 0, 1)`,
            weight: 1,
            // fillColor: 'none'
        }).addTo(mainLayer)

        polygonToPoints(path.polygon).forEach((point, i) => {
            L.circleMarker(point, {
                radius: 2,
                color: 'rgb(255, 255, 255)'
            }).bindTooltip(`${path.fullName}: ${i}`).addTo(mainLayer);
        })
    })
}

eventEmitter.on('updateObjects', renderMap)

eventEmitter.on('updateObjects', () => {
    console.log(objectsSelected)
})

const createCheckboxEl = (name, clickHandler) => {
    const labelEl = document.createElement('label')
    labelEl.className = 'filters-object-checkbox-label'

    const checkboxEl = document.createElement('input')
    checkboxEl.setAttribute('type', 'checkbox')
    checkboxEl.addEventListener('click', e => {
        e.preventDefault()
        clickHandler(e.currentTarget.checked)
    })

    const nameEl = document.createElement('span')
    nameEl.textContent = name

    labelEl.append(checkboxEl, nameEl)

    return labelEl
}

const renderFilters = () => {
    for (const [groupName, polygons] of groupMapBy(data.paths, item => item.name)) {
        const groupEl = document.createElement('div')
        groupEl.style.marginBottom = '10px'

        const groupCheckboxEl = createCheckboxEl(groupName, checked => {
            if (checked) {
                polygons.forEach(polygon => objectsSelected.add(polygon))
            } else {
                polygons.forEach(polygon => objectsSelected.delete(polygon))
            }

            eventEmitter.emit('updateObjects')
        })

        eventEmitter.on('updateObjects', () => {
            groupCheckboxEl.querySelector('input').checked = polygons.every(polygon => objectsSelected.has(polygon))
        })

        const polygonsEl = document.createElement('div')
        polygonsEl.style.paddingLeft = '25px'

        for (const polygon of polygons) {
            const polygonCheckboxEl = createCheckboxEl(polygon.fullName, checked => {
                if (checked) {
                    objectsSelected.add(polygon)
                } else {
                    objectsSelected.delete(polygon)
                }

                eventEmitter.emit('updateObjects')
            })

            eventEmitter.on('updateObjects', () => {
                polygonCheckboxEl.querySelector('input').checked = objectsSelected.has(polygon)
            })

            polygonsEl.append(polygonCheckboxEl)
        }

        groupEl.append(groupCheckboxEl, polygonsEl)

        filtersEl.append(groupEl)
    }
}

fileEl.addEventListener('change', async e => {
    const file = e.target.files[0]
    const buffer = await file.arrayBuffer()

    data = await processXlsx(buffer)

    mapCoverEl.classList.remove('g-hidden')
    fileEl.classList.add('g-hidden')

    const russiaBoundingBox = [
        [73.21470709028688, 176.6368103027344],
        [55.65415394402894, 28.98056030273438],
    ]

    const map = L.map('map-el').fitBounds(russiaBoundingBox)

    mainLayer = L.layerGroup().addTo(map)

    L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapsosc-b667cf5a',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        detectRetina: true,
        tileSize: 512,
        zoomOffset: -1
    }).addTo(map)

    renderFilters()

    // console.log(data)

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
})


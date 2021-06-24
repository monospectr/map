import { convertCoords } from './helpers/convert-coords.js'
import { processXlsx } from './process-xlsx.js'

const polygonToPoints = polygon => {
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

const fileEl = document.getElementById('file')
const mapCoverEl = document.getElementById('map')
const filtersEl = document.getElementById('filters')

const objectsSelected = new Set()

let data
let mainLayer

const renderMap = () => {
    mainLayer.clearLayers()

    data.paths.forEach((path, i) => {
        if (!objectsSelected.has(path.name)) {
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

const renderFilters = () => {
    const names = [...new Set(data.paths.map(path => path.name))]

    names.forEach(name => {
        const labelEl = document.createElement('label')
        labelEl.className = 'filters-object-checkbox-label'

        const checkboxEl = document.createElement('input')
        checkboxEl.setAttribute('type', 'checkbox')
        checkboxEl.addEventListener('click', () => {
            if (objectsSelected.has(name)) {
                objectsSelected.delete(name)
            } else {
                objectsSelected.add(name)
            }

            renderMap()
        })

        const nameEl = document.createElement('span')
        nameEl.textContent = name

        labelEl.append(checkboxEl, nameEl)
        filtersEl.append(labelEl)
    })
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

    console.log(data)

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


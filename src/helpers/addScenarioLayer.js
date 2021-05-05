export function addScenarioLayer(mapObject, scenario) {
    // "Zone" scenario boundaries
    mapObject.addSource('bounds-' + scenario.name, {
        type: 'vector',
        url: scenario.shapefileURL
    });

    mapObject.addLayer({
        'id': 'bounds-' + scenario.name + '-data',
        'type': 'line',
        'source': 'bounds-' + scenario.name,
        'source-layer': scenario.shapefileName,
        'layout': {
            'visibility': 'none'
        },
        'paint': {
            'line-color': '#555555',
            'line-width': 2
        }
    });
};
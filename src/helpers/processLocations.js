export function processLocations(data) {
    return Array.from(data.default.map(d => (
        {
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [
                    d.Longitude,
                    d.Latitude
                ]
            },
            'properties': {
                'title': d.Name
            }
        }
    )))
}
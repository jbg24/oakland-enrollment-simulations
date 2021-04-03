export function processLocations(data) {
    return Array.from(data.map(d => (
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
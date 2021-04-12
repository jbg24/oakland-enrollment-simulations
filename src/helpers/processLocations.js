export function processLocations(data) {
    return Array.from(data.map((d,i) => (
        {
            'id': d["School ID"],
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
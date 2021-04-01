export function colorScale(min, max, val) {
    const colors = [
        '#a6cee3', 
        '#b2df8a', 
        '#fb9a99', 
        '#fdbf6f', 
        '#cab2d6', 
        '#1f78b4',
        '#33a02c',
        '#e31a1c',
        '#ff7f00',
        '#6a3d9a'
    ]

    return colors[((val-min) % (colors.length-1))]
}
import './styles.scss';
import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import InfoCard from "./components/infoCard.jsx"
import { processLocations } from "./helpers/processLocations.js"
import { colorScale } from "./helpers/colorScale.js"
import * as data from "./data/scores.json"
import * as locations from "./data/locations.json"
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';

mapboxgl.workerClass = MapboxWorker;
mapboxgl.accessToken = 'pk.eyJ1IjoidHlsZXJtYWNoYWRvIiwiYSI6ImNpbXY1YmMxMTAybTh1cGtrYmY3bjFiNHMifQ.e7Jn45kHrT5m2SbpSCZq5Q';

class Map extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lng: -122.214,
      lat: 37.796,
      zoom: 11,
      vision: "Today"
    };
    this.changeVision = this.changeVision.bind(this);
    this.mapContainer = React.createRef();
  }
  changeVision() {
    if (this.state.vision === "Today") {
      this.setState({ 
        vision: "Zone",
        visibleToday: 'none',
        visibleZone: 'visible'
      });
    } else {
      this.setState({ 
        vision: "Today",
        visibleToday: 'visible',
        visibleZone: 'none'
      })
    }
  }
  componentDidMount() {
    console.log()
    const { lng, lat, zoom, vision, visibleToday, visibleNone } = this.state;
    const map = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v10',
      center: [lng, lat],
      zoom: zoom
    });

    map.on('load', function () {

      map.addSource('bounds-today', {
        type: 'vector',
        url: 'mapbox://tylermachado.ctywuxms'
      });
      map.addLayer({
        'id': 'bounds-today-data',
        'type': 'fill',
        'source': 'bounds-today',
        'source-layer': 'OUSD_ESAA_1920-4yapi9',
        'layout': {
          'visibility': 'none'
        },
        'paint': {
          'fill-color': [
            'interpolate-hcl',
            ['linear'],
            ['get', 'AAID'],
            100,
            ['to-color', '#12a6a3'],
            200,
            ['to-color', '#d11515']
          ],
          'fill-opacity': 0.6
        }
      });




      map.addSource('bounds-vision', {
        type: 'vector',
        url: 'mapbox://tylermachado.3a0n7mkn'
      });

      map.addLayer({
        'id': 'bounds-vision-data',
        'type': 'fill',
        'source': 'bounds-vision',
        'source-layer': 'Dissolved_OUSD_ES_Multi_Schoo-a87qn7',
        'layout': {
          'visibility': 'none'
        },
        'paint': {
          'fill-color': [
            'interpolate-hcl',
            ['linear'],
            ['get', 'Zone_5'],
            0,
            ['to-color', '#12a6a3'],
            4,
            ['to-color', '#d11515']
          ],
          'fill-opacity': 0.6
        }
      });



      map.addSource('census-blocks', {
        type: 'vector',
        url: 'mapbox://tylermachado.3unavpo1'
      });
      map.addLayer({
        'id': 'census-blocks-data',
        'type': 'line',
        'source': 'census-blocks',
        'source-layer': 'OUSD_CBG_With_Wealth_Data-2evk4o',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#000001',
          'line-width': 1
        }
      });
    


      map.addSource('school-locations-data', {
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': processLocations(locations)
        }
      });
      map.addLayer({
        'id': 'school-locations',
        'type': 'circle',
        'source': 'school-locations-data',
        'paint': {
          'circle-color': 'white',
          'circle-stroke-color': 'black',
          'circle-stroke-width': 3,
          'circle-radius': 6
        }
      });
    }) // map on load

  
    map.on('move', () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });



    map.on('idle', () => {
      if (this.state.vision === "Today") {
        map.setLayoutProperty(
          'bounds-today-data',
          'visibility',
          'visible'
        )

        map.setLayoutProperty(
          'bounds-vision-data',
          'visibility',
          'none'
        )
      } else {
        map.setLayoutProperty(
          'bounds-vision-data',
          'visibility',
          'visible'
        )

        map.setLayoutProperty(
          'bounds-today-data',
          'visibility',
          'none'
        )
      }
    })
  }

  render() {
    const { lng, lat, zoom } = this.state;
    return (
      <div className="grid-container">
        <section className="header">
          <h1>ACROSS LINES</h1>
        </section> 
        <section className="control">
            <span  onClick={() => this.changeVision()} className={(this.state.vision === "Today") ? "active" : ""}>TODAY</span>
            |
            <span  onClick={() => this.changeVision()} className={(this.state.vision === "Zone") ? "active" : ""}>VISION</span>
        </section>
        <section className="info">
          <input type="text" placeholder="Search" />
          <div className="results">
            {data.default.filter(d => (d["Scenario"] === this.state.vision)).map(d =>
                <InfoCard
                  data={d}
                />
            )}
          </div>
          
        </section> 
        <section className="map">
          <div ref={this.mapContainer} className="map-container" />
        </section>;
        
      </div>
    );
  }
}

ReactDOM.render(<Map />, document.getElementById('app'));
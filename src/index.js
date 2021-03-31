import './styles.scss';
import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import InfoCard from "./components/infoCard.jsx"
import { processLocations } from "./helpers/processLocations.js"
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
      vision: "Today",
      visibleToday: 'visible',
      visibleZone: 'none'
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
    const { lng, lat, zoom, vision, visibleToday, visibleNone } = this.state;
    const map = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
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
          'visibility': visibleToday
        },
        'paint': {
          'fill-color': [
            "rgb",
            0,
            ["-", ["get", "AAID"], 101],
            ["*", 1, ["get", "AAID"]]
          ],
          'fill-opacity': 1
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
          'visibility': visibleToday
        },
        'paint': {
          'fill-color': [
            "rgb",
            ["*", 63, ["get", "Zone_5"]],
            161,
            ["*", 63, ["get", "Zone_5"]]
          ],
          'fill-opacity': 1
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
          'line-color': '#ff69b4',
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
        // 'layout': {
        //   'text-field': ['get', 'title'],
        //   'text-font': [
        //     'Open Sans Semibold',
        //     'Arial Unicode MS Bold'
        //   ],
        //   'text-offset': [0, 1.25],
        //   'text-anchor': 'top'
        // }
        'paint': {
          'circle-color': 'white',
          'circle-stroke-color': 'black',
          'circle-stroke-width': 4,
          'circle-radius': 10
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
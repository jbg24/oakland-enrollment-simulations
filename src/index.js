import './styles.scss';
import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import InfoCard from "./components/infoCard.jsx"
import { processLocations } from "./helpers/processLocations.js"
import { colorScale } from "./helpers/colorScale.js"
import { join } from "./helpers/join.js"
import * as data from "./data/scores.json"
import * as locations from "./data/locations.json"
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';

mapboxgl.workerClass = MapboxWorker;
mapboxgl.accessToken = 'pk.eyJ1IjoidHlsZXJtYWNoYWRvIiwiYSI6ImNpbXY1YmMxMTAybTh1cGtrYmY3bjFiNHMifQ.e7Jn45kHrT5m2SbpSCZq5Q';

const joinedData = join(locations.default, data.default, "ID", "School ID", function (table2, table1) {
  return {
    "Name": table1["Name"],
    "Longitude": table1["Longitude"],
    "Latitude": table1["Latitude"],
    "Level": table1["Level"],
    "School ID": table2["School ID"],
    "Scenario": table2["Scenario"],
    "Cluster 1": table2["Cluster 1"],
    "Cluster 2": table2["Cluster 2"],
    "Cluster 3": table2["Cluster 3"],
    "Cluster 1 Change on Today": table2["Cluster 1 Change on Today"],
    "Cluster 2 Change on Today": table2["Cluster 2 Change on Today"],
    "Cluster 3 Change on Today": table2["Cluster 3 Change on Today"],
    "Racial Diversity Score": table2["Racial Diversity Score"],
    "Racial-Poverty Gap Contribution": table2["Racial-Poverty Gap Contribution"],
    "Racial-Travel Gap Contribution": table2["Racial-Travel Gap Contribution"]
  };
});

class Map extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lng: -122.214,
      lat: 37.796,
      zoom: 11,
      scenario: "Today"
    };
    this.changeScenario = this.changeScenario.bind(this);
    this.mapContainer = React.createRef();
  }
  changeScenario() {
    if (this.state.scenario === "Today") {
      this.setState({ 
        scenario: "Zone"
      });
    } else {
      this.setState({ 
        scenario: "Today"
      })
    }
  }
  componentDidMount() {
    console.log()
    const { lng, lat, zoom, scenario } = this.state;
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




      map.addSource('bounds-scenario', {
        type: 'vector',
        url: 'mapbox://tylermachado.3a0n7mkn'
      });

      map.addLayer({
        'id': 'bounds-scenario-data',
        'type': 'fill',
        'source': 'bounds-scenario',
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
          'features': processLocations(
            joinedData.filter(d => 
              (d["Scenario"] === "Today")
            )
          )
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

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on('click', 'places', function (e) {
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(description)
          .addTo(map);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'places', function () {
        map.getCanvas().style.cursor = 'pointer';
      });

      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'places', function () {
        map.getCanvas().style.cursor = '';
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
      if (this.state.scenario === "Today") {
        map.setLayoutProperty(
          'bounds-today-data',
          'visibility',
          'visible'
        )

        map.setLayoutProperty(
          'bounds-scenario-data',
          'visibility',
          'none'
        )
      } else {
        map.setLayoutProperty(
          'bounds-scenario-data',
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
            <span  onClick={() => this.changeScenario()} className={(this.state.scenario === "Today") ? "active" : ""}>TODAY</span>
            |
            <span  onClick={() => this.changeScenario()} className={(this.state.scenario === "Zone") ? "active" : ""}>ZONE</span>
        </section>
        <section className="info">
          <input type="text" placeholder="Search" />
          <div className="results">
            {joinedData
              .filter(d => (d["Scenario"] === this.state.scenario))
              .sort((a, b) => (a["Name"] > b["Name"]) ? 1 : -1)
              .map(d =>
                <InfoCard
                  data={d}
                  key={d["School ID"]}
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
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

let filteredData = joinedData;

class Map extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lng: -122.214,
      lat: 37.796,
      zoom: 11,
      scenario: "Today",
      currSchool: null,
      filter: ''
    };
    this.sidebarClick = this.sidebarClick.bind(this);
    this.updateFilter = this.updateFilter.bind(this);
    this.changeScenario = this.changeScenario.bind(this);
    this.mapContainer = React.createRef();
    this.map = '';
  }
  updateFilter(event) {
    this.setState({ filter: event.target.value });
  }
  sidebarClick = (d) => {
    this.setState({
      zoom: 14,
      currSchool: d
    });
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
    const { lng, lat, zoom, scenario, currSchool } = this.state;
    let map = this.map;
    map = new mapboxgl.Map({
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
        'type': 'fill',
        'source': 'census-blocks',
        'source-layer': 'OUSD_CBG_With_Wealth_Data-2evk4o',
        'paint': {
          'fill-color': '#fff',
          'fill-opacity': 0.01
        }
      });
      map.addLayer({
        'id': 'census-blocks-data-outlines',
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
          'circle-color': [
            'case',
            ['boolean', ['feature-state', 'activeschool'], false],
            "white",
            "darkred"
          ],
          'circle-stroke-color': 'black',
          'circle-stroke-width': 3,
          'circle-radius': 6
        }
      });

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on('click', 'census-blocks-data', (e) => {
        var coordinates = e.lngLat;
        var properties = e.features[0].properties;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML("<ul>"+
          "<li>Education_: " + properties.Education_ + 
          "<li>Home_Owner: " + properties.Home_Owner +
          "<li>Household_: " + properties.Household_ +
          "<li>Multi_Pare: " + properties.Multi_Pare +
          "</ul>")
          .addTo(map);
      }); // onClick popup

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on('click', 'school-locations', (e) => {
        console.log(e.features[0])
        var coordinates = e.features[0].geometry.coordinates.slice();
        var description = e.features[0].properties.title;

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
      }); // onClick popup

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

    // map.on('idle', () => {
    //   if (this.state.currSchool) {
    //     const popup = document.getElementsByClassName('mapboxgl-popup');
    //     if (popup.length) {
    //       popup[0].remove();
    //     }

    //     new mapboxgl.Popup()
    //       .setLngLat([this.state.currSchool["Longitude"], this.state.currSchool["Latitude"]])
    //       .setHTML(this.state.currSchool["Name"])
    //       .addTo(map);
    //   }
    // })

    this.map = map;
  }

  componentDidUpdate(prevProps, prevState) {
    const { currSchool } = this.state;

    if (currSchool !== prevProps.currSchool) {
      this.map.on('idle', () => {
        if (this.state.currSchool) {
          if (prevState.currSchool) {
            this.map.setFeatureState(
              { source: 'school-locations-data', id: prevState.currSchool["School ID"] },
              { activeschool: false }
            );
          }
          

          this.map.setFeatureState(
            { source: 'school-locations-data', id: this.state.currSchool["School ID"] },
            { activeschool: true }
          );
        }
      })
    }
  }

  render() {
    return (
      <div className="grid-container">
        <section className="header">
          <h1>ACROSS LINES</h1>
        </section> 
        <section className="control">
            <span  onClick={() => this.changeScenario()} className={(this.state.scenario === "Today") ? "active control-button" : "control-button"}>TODAY</span>
            |
            <span  onClick={() => this.changeScenario()} className={(this.state.scenario === "Zone") ? "active control-button" : "control-button"}>ZONE</span>
        </section>
        <section className="info">
          <input type="text" placeholder="Search" value={this.state.filter} onChange={this.updateFilter}  />
          <div className="results">
            {joinedData
              .filter(d => this.state.filter === '' || d["Name"].toLowerCase().includes(this.state.filter))
              .filter(d => (d["Scenario"] === this.state.scenario))
              .sort((a, b) => (a["Name"] > b["Name"]) ? 1 : -1)
              .map((d) =>
                <InfoCard
                  scenario={this.state.scenario}
                  data={d}
                  key={d["School ID"]}
                  setCurr={this.sidebarClick}
                />
              )
            }
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
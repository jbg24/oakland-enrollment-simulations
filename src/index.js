import './styles.scss';
import React, { useRef, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3-scale';
import InfoCard from "./components/infoCard.jsx"
import { addScenarioLayer } from "./helpers/addScenarioLayer.js"
import { processLocations } from "./helpers/processLocations.js"
import { join } from "./helpers/join.js"
//import {readGoogleSpreadsheetData} from "./helpers/readGoogleSpreadsheetData.js"
//const { GoogleSpreadsheet } = require('google-spreadsheet')

// loading data
import * as data from "./data/scores.json"
import * as locations from "./data/locations.json"
import * as studentCounts from "./data/student-counts.json"

// loading data from Google Spreadsheet
//const creds = require('./config/across-lines-oakland-73eee50d36a4.json')
//const doc = new GoogleSpreadsheet('1Tk8x2McRveR2ya5AJEMG-gTgOUJjS_TQu8Fx150YVGc')

//const data = readGoogleSpreadsheetData(1227838155,doc,creds)
//const locations = await readGoogleSpreadsheetData(0,doc,creds);
//console.log(locations)
//const studentCounts = readGoogleSpreadsheetData(675195457,doc,creds)

// loading Mapbox items
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';
mapboxgl.workerClass = MapboxWorker;
mapboxgl.accessToken = 'pk.eyJ1IjoiamJnb3JtbGV5IiwiYSI6ImNrb2o5Y3E0ZDFhbHgycG85MGlleXZnY2MifQ.kVBtVldU0b_02-8ZHXn4yw';

// merge school location data with scores data
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
    "Enrollment": table2["Enrollment"],
    "Racial Diversity Score": table2["Racial Diversity Score"],
    "English Learner Percentage": table2["English Learner Percentage"],
    "Avg. Travel Distance": table2["Avg. Travel Distance"]
  };
});

// build the map app
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
    this.resetActiveSchool = this.resetActiveSchool.bind(this);
    this.mapContainer = React.createRef();
    this.map = '';

    // this is the scale that controls the opacity of census blocks on active schools
    this.opacityScale = d3.scaleLog()
      .domain([1, 107])
      .range([0.55, 0.97])
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

  changeScenario(scenario_name) {
      this.setState({ 
        scenario: scenario_name
      });
  }

  resetActiveSchool() {
    // reset opacity levels of census blocks to defaults
    this.map.setPaintProperty(
      'census-blocks-data',
      'fill-opacity',
      0.6
    )

    // set active school to inactive
    this.map.setFeatureState(
      { source: 'school-locations-data', id: this.state.currSchool["School ID"] },
      { activeschool: false }
    );

    // update the app's state
    this.setState({
      currSchool: null
    })
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

      // colored-in census blocks
      map.addSource('census-blocks', {
        type: 'vector',
        url: 'mapbox://jbgormley.0dpknf2p'
      });
      map.addLayer({
        'id': 'census-blocks-data',
        'type': 'fill',
        'source': 'census-blocks',
        'source-layer': 'OUSD_CBG_Wealth_Cluster-47fmtv',
        'paint': {
          'fill-color': [
            'interpolate-hcl',
            ['linear'],
            ['get', 'Cluster'],
            0,
            ['to-color', '#2025e5'],
            3,
            ['to-color', '#88e520']
          ],
          'fill-opacity': 0.6,
          'fill-outline-color': '#555555'
        }
      });

      // if we want to adjust the width of the outlines around census blocks, we will have to un-comment the below layer to add an 'lines' layer, due to Mapbox limitations

      // map.addLayer({
      //   'id': 'census-blocks-data-outlines',
      //   'type': 'line',
      //   'source': 'census-blocks',
      //   'source-layer': 'OUSD_CBG_With_Wealth_Data-2evk4o',
      //   'layout': {
      //     'line-join': 'round',
      //     'line-cap': 'round'
      //   },
      //   'paint': {
      //      'line-color': '#555555',
      //     'line-width': 0.67
      //   }
      // });

      // add layers for the scenarios
      addScenarioLayer(map, {
        name: 'today',
        shapefileURL: 'mapbox://jbgormley.9aldq84l',
        shapefileName: 'OUSD_ESAA_1920-2e5lpw'
      })
      addScenarioLayer(map, {
        name: 'zone',
        shapefileURL: 'mapbox://jbgormley.bwr11lpb',
        shapefileName: 'Dissolved_OUSD_ES_Zones-75nvu9'
      })
      addScenarioLayer(map, {
        name: 'neighborhood',
        shapefileURL: 'mapbox://jbgormley.2poubl11',
        shapefileName: 'Dissolve_OUSD_Outer_Boundary-bo8uxq'
      })
      addScenarioLayer(map, {
        name: 'openenr',
        shapefileURL: 'mapbox://jbgormley.2poubl11',
        shapefileName: 'Dissolve_OUSD_Outer_Boundary-bo8uxq'
      })

      // extra function to "turn on" the today scenario as the initially visible state
      map.setLayoutProperty(
        'bounds-today-data',
        'visibility',
        'visible'
      )
    
      // Schools 
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
            "#ff0000",
            "#cccccc"
          ],
          'circle-stroke-color': 'black',
          'circle-stroke-width': 1.5,
          'circle-radius': [
            'case',
            ['boolean', ['feature-state', 'activeschool'], false],
            9,
            3
          ]
        }
      });
      map.addLayer({
        'id': 'school-names',
        'type': 'symbol',
        'source': 'school-locations-data',
        'layout': {
          'text-field': ['get', 'title'],
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-radial-offset': 0.5,
          'text-justify': 'auto',
          'text-size': 8
          //'text-justify': 'auto'
        }
      });

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on('click', 'census-blocks-data', (e) => {
        var coordinates = e.lngLat;
        var properties = e.features[0].properties;

        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML("<h4>Census Block Grp.: " + properties.GEOID10 + "</h4><ul>"+
          "<li>Wealth Cluster: " + properties.Cluster.toFixed(0) + 
          "<li>Home Ownership: " + properties.Home_Owner.toFixed(2) +
          "<li>Multi-Parent Households: " + properties.Multi_Pare.toFixed(2) +
          "<li>Household Income: " + properties.Household_.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) +
          "<li>Education Score: " + properties.Education_.toFixed(2) + 
          "</ul>")
          .addTo(map);
      }); // onClick popup
    }) // map on load
  
    map.on('move', () => {
      this.setState({
        lng: map.getCenter().lng.toFixed(4),
        lat: map.getCenter().lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });

    this.map = map;
  }

  componentDidUpdate(prevProps, prevState) {
    const { currSchool, scenario } = this.state;

    // redraw scenario boundary lines
    if (scenario !== prevState.scenario) {
      this.map.setLayoutProperty(
        'bounds-' + prevState.scenario.toLowerCase() + '-data',
        'visibility',
        'none'
      )

      this.map.setLayoutProperty(
        'bounds-' + scenario.toLowerCase() + '-data',
        'visibility',
        'visible'
      )
    } // end redraw scenario boundary lines


    // update active school
    if (currSchool !== prevProps.currSchool) {
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

          // filter student counts for newly active school
          const countdata = studentCounts.default.filter((s) =>
            (s["School ID"] === this.state.currSchool["School ID"]) && (s["Scenario"] === this.state.scenario)
          )
          
          // generate opacity based on student counts
          const studentPopulationBlocks = Object.fromEntries(countdata.map(d => 
            [d["Census Block Group FIPS"], this.opacityScale(d["Student Count"])]
          ))

          // find student count for each census block and update opacity accordingly
          this.map.setPaintProperty(
            'census-blocks-data', 
            'fill-opacity', [
              'case',
              ['has',
                ['get', 'GEOID10'],
                ['literal', studentPopulationBlocks]
              ],
              ['get',
                ['get', 'GEOID10'],
                ['literal', studentPopulationBlocks]
              ],
              0.1 // this line sets a backup opacity of 0.1 if there are new students coming from this block
            ]
          )
        }
    } // end update active school
  } // end componentDidUpdate

  render() {
    return (
      <div className="grid-container">
        <section className="header">
          <h1>OUSD ELEM.</h1>
        </section> 
        <section className="control">
            <span  onClick={() => this.changeScenario("Today")} className={(this.state.scenario === "Today") ? "active control-button" : "control-button"}>TODAY</span>
            |
            <span  onClick={() => this.changeScenario("Neighborhood")} className={(this.state.scenario === "Neighborhood") ? "active control-button" : "control-button"}>NEIGHBORHOOD</span>
            |
            <span  onClick={() => this.changeScenario("Zone")} className={(this.state.scenario === "Zone") ? "active control-button" : "control-button"}>ZONE</span>
            |
            <span  onClick={() => this.changeScenario("OpenEnr")} className={(this.state.scenario === "OpenEnr") ? "active control-button" : "control-button"}>OPENENROLL-PLUS</span>
            |
            <span  onClick={() => window.open('https://docs.google.com/document/d/1RB3lUDtSABEa7fD51Nwurys5ZoiUL49DrNISbLeEslU','_blank')} className={(this.state.scenario === "Other") ? "active control-button" : "control-button"}>Methodology&Results</span>
        </section>
        <section className="info">
          <input type="text" placeholder="Filter schools" value={this.state.filter} onChange={this.updateFilter}  />
          <div className="results">
            {joinedData
              .filter(d => this.state.filter === '' || d["Name"].toLowerCase().includes(this.state.filter.toLowerCase()))
              .filter(d => (d["Scenario"] === this.state.scenario))
              .sort((a, b) => (a["Name"] > b["Name"]) ? 1 : -1)
              .map((d) =>
                <InfoCard
                  scenario={this.state.scenario}
                  data={d}
                  key={d["School ID"]}
                  setCurr={this.sidebarClick}
                  currSchool={this.state.currSchool}
                />
              )
            }
          </div>
        </section> 
        <section className="map">
          <div className={
            this.state.currSchool !== null
              ? 'active-overlay activated'
              : 'active-overlay'
          }>
            <span>
              {
                this.state.currSchool !== null
                ? this.state.currSchool["Name"]
                : ''
              }
            </span>
            <button onClick={() => this.resetActiveSchool()}>
              x
            </button>
          </div>
          <div ref={this.mapContainer} className="map-container" />
        </section>
        <section className="blank">
        </section> 
        <section className="footer">
          <h1>Copyright &copy; Across Lines, LLC 2021</h1>
        </section> 
       </div>
    );
  }
}

ReactDOM.render(<Map />, document.getElementById('app'));
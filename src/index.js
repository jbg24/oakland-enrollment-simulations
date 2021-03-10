import './styles.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import InfoCard from "./components/infoCard.jsx"
import mapboxgl from 'mapbox-gl/dist/mapbox-gl-csp';
import MapboxWorker from 'worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker';

mapboxgl.workerClass = MapboxWorker;
mapboxgl.accessToken = 'pk.eyJ1IjoidHlsZXJtYWNoYWRvIiwiYSI6ImNpbXY1YmMxMTAybTh1cGtrYmY3bjFiNHMifQ.e7Jn45kHrT5m2SbpSCZq5Q';

class Map extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      lng: -122.26,
      lat: 37.79,
      zoom: 12
    };
    this.mapContainer = React.createRef();
  }
  componentDidMount() {
    const { lng, lat, zoom } = this.state;
    const map = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [lng, lat],
      zoom: zoom
    });

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
        </section> 
        <section className="control">

        </section>
        <section className="info">
          <InfoCard schoolname={"School 1"}/>
          <InfoCard schoolname={"School 2"}/>
          <InfoCard schoolname={"School 3"}/>
        </section> 
        <section className="map">
          <div ref={this.mapContainer} className="map-container" />
        </section>;
        
      </div>
    );
  }
}

ReactDOM.render(<Map />, document.getElementById('app'));
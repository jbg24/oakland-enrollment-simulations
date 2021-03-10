import './App.scss';
import React, { Component } from 'react'

class App extends Component {
  constructor(props) {
    super(props);
    this.changeActive = this.changeActive.bind(this);
    this.state = { 
      "active": {
        type: "Active",
        text: "this will disappear"
      }
    };
  }

  changeActive(x) {

  }

  render() {
    return (
      <div className="App">
        <section className="header">

        </section>
        <section className="control">

        </section>
        <section className="info">

        </section>
        <section className="map">

        </section>
      </div>
    );
  }
}

export default App;

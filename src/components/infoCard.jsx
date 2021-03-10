import React from "react"
import './infoCard.scss';

class InfoCard extends React.Component {
    constructor(props) {
        super(props);
        this.clickActive = this.clickActive.bind(this);
        this.clickOut = this.clickOut.bind(this);
    }

    state = {
        clicked: null
    }

    clickActive(ind) {
        this.setState({clicked: ind})
        console.log("clicked item")
    }

    clickOut() {
        this.setState({clicked: null})
        console.log("clicked OUTSIDE")
    }

    render() {
        return (
            <section className="infocard">
                <h3>{this.props.schoolname}</h3>
                <div className="statsboard">
                    <div>4</div>
                    <div>12</div>
                    <div>7</div>
                </div>
            </section>
        )
    } //render
} // class PortfolioCards
export default InfoCard

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
                <div className="school-name">{this.props.data["Name"]}</div>
                <div className="school-score">{this.props.data["Racial Diversity Score"]}</div>
                <div className="sq-1 square" style={{ opacity: this.props.data["Cluster 1"]}}></div>
                <div className="sq-2 square" style={{ opacity: this.props.data["Cluster 2"]}}></div>
                <div className="sq-3 square" style={{ opacity: this.props.data["Cluster 3"]}}></div>
                <div className="ch-1">{ this.props.data["Cluster 1 Change on Today"] }</div>
                <div className="ch-2">{this.props.data["Cluster 2 Change on Today"]}</div>
                <div className="ch-3">{this.props.data["Cluster 3 Change on Today"]}</div>
                <div className="gap-p">Racial-poverty gap contribution: {this.props.data["Racial-Poverty Gap Contribution"]}</div>
                <div className="gap-t">Racial-travel gap contribution: {this.props.data["Racial-Travel Gap Contribution"]}</div>
            </section>
        )
    } //render
} // class PortfolioCards
export default InfoCard

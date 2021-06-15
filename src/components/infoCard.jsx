import React from "react"
import './infoCard.scss';

class InfoCard extends React.Component {
    constructor(props) {
        super(props);
    }

    state = {
        clicked: null,
        currSchool: null
    }

    isClicked = () => {
        var current = this.props.data;
        this.props.setCurr(current);
    }

    render() {
        return (
            <section 
                className={
                    ((this.props.currSchool !== null) && (this.props.currSchool["School ID"] === this.props.data["School ID"]))
                        ? "infocard active-card"
                        : "infocard"
                }
                onClick={this.isClicked}
            >
                <div className="school-name">{this.props.data["Name"]}</div>
                <div className="school-score">DivScore: {this.props.data["Racial Diversity Score"]}</div>
                <div className="sq-1 square" style={{borderStyle:'dashed', backgroundColor: "rgba(0,153,255," + this.props.data["Cluster 1"] + ")"}}>
                    {this.props.data["Cluster 1"]}
                </div>
                <div className="sq-2 square" style={{borderStyle:'dashed', backgroundColor: "rgba(102,204,204," + this.props.data["Cluster 2"] + ")"}}>
                    {this.props.data["Cluster 2"]}
                </div>
                <div className="sq-3 square" style={{ borderStyle:'dashed', backgroundColor: "rgba(136,229,32," + this.props.data["Cluster 3"] + ")"}}>
                    {this.props.data["Cluster 3"]}
                </div>
                <div className="ch-1 change">{("(" + this.props.data["Cluster 1 Change on Today"] + ")")}</div>
                <div className="ch-2 change">{("(" + this.props.data["Cluster 2 Change on Today"] + ")")}</div>
                <div className="ch-3 change">{("(" + this.props.data["Cluster 3 Change on Today"] + ")")}</div>
                <div className="gap-c">Student Count: {this.props.data["Enrollment"]}</div>
                <div className="gap-p">English Learner Percentage: {this.props.data["English Learner Percentage"]}</div>
                <div className="gap-t">Avg. Travel Distance: {this.props.data["Avg. Travel Distance"]}</div>
            </section>
        )
    } //render
} // class PortfolioCards
export default InfoCard

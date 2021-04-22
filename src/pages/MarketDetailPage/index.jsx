import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Skeleton } from 'primereact/skeleton';
import React, { Component } from 'react';

import autoBind from "react-autobind";
import { withRouter } from 'react-router';
import { findCompanyOverviewer, findEarnings } from './service';
import { chartOptions } from './utils/constant';
import { formatDateISOToDate } from '../../utilities/formatters';

class MarketDetailPage extends Component {

    constructor(props) {
        super(props);

        autoBind(this);

        this.state = {
            overviewLoading: false,
            earningLoading: false,

            overview: {},
            dataAnualLearningChart: {},
            dataQuaterlyEarningChart: {}
        }
    }

    componentDidMount(){
        const symbol = new URLSearchParams(this.props.location.search).get("symbol")
        if(symbol){
            this.searchOverView(symbol)
            this.searchEarnings(symbol)
        }
    }

    searchEarnings(symbol) {
        this.setState({ earningLoading: true })
        findEarnings(symbol, earning => {
        
            const dataAnnualEarningChart = {
                labels: earning.annualEarnings?.map(earn => earn.fiscalDateEnding),
                datasets: [
                    {
                        label: "Earning Per Share",
                        data: earning.annualEarnings?.map(earn => formatDateISOToDate(earn.reportedEPS)).reverse(),
                        borderColor: "#8dd0ff",
                        backgroundColor: "#8dd0ff20"
                    }
                ]
            };
            console.log(earning)
            const dataQuaterlyEarningChart = {
                labels: earning.quarterlyEarnings?.map(earn => formatDateISOToDate(earn.fiscalDateEnding)),
                datasets: [
                    {
                        label: "Estimated EPS",
                        data: earning.quarterlyEarnings?.map(earn => earn.estimatedEPS),
                        borderColor: '#b38705',
                        fill: false,
                    },
                    {
                        label: "Reported EPS",
                        data: earning.quarterlyEarnings?.map(earn => earn.reportedEPS),
                        borderColor: '#125f3b',
                        fill: false,
                    },
                ]
            };

            this.setState({
                dataAnnualEarningChart,
                dataQuaterlyEarningChart,
                earningLoading: false
            })
        })
    }

    searchOverView(symbol){
        this.setState({overviewLoading: true})
        findCompanyOverviewer(symbol, overview => {
            this.setState({overview, overviewLoading: false})
        })
    }

    getTittleCard(){
        <div className="p-d-flex p-jc-between">
            <div>{this.state.overview?.Name}</div>
            <div>{this.state.overview?.Symbol}</div>
        </div>
    }

    render() {
        return (
            <div className="p-grid">
                <div className="p-col-12">
                   <Card
                        className="p-shadow-24 p-mb-3"
                        tittle={this.getTittleCard()}
                        subTitle={`${this.state.overview?.Industry} - ${this.state.overview?.AssetType}`}
                   >
                        <div className="p-fluid p-formgrid p-grid">
                            <div className="p-field p-col-12 p-m-0">
                                <Divider align="center" type="dashed" className="p-mt-0">
                                    <b>Description</b>
                                </Divider>
                                {this.state.overviewLoading ? 
                                    <Skeleton width="100%" height="150px"/>
                                    :
                                    <p>{this.state.overview?.Description}</p>
                                }
                                <Divider type="dashed" className="p-m-0" />
                            </div>
                        </div>
                    </Card>
                    <Card
                        className="p-shadow-24 p-mb-3"
                        title="Annual Earnings"
                        subTitle="Quotient that serves as an indicator of the profitability of organization (Earnings Per Share - EPS)."
                    >
                        {this.state.earningLoading ? (
                            <Skeleton width="100%" height="366px"/>
                        ) : (
                            <Chart 
                                type="line"
                                data={this.state.dataAnnualEarningChart}
                                options={chartOptions}
                            />
                        )}
                    </Card>

                    <Card
                        className="p-shadow-24 p-mb-3"
                        title="Quaternary Earnings"
                        
                    >
                        {this.state.earningLoading ? (
                            <Skeleton width="100%" height="366px"/>
                        ) : (
                            <Chart 
                                type="line"
                                data={this.state.dataQuaterlyEarningChart}
                                options={chartOptions}
                            />
                        )}
                    </Card>
                </div>
            </div>
        );
    }
}

export default withRouter(MarketDetailPage);

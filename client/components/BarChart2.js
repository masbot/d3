import React, { Component } from 'react';
import * as d3 from "d3";
import json from './jsons/curry.json';

const margin = {
    top: 20,
    right: 20,
    bottom: 100,
    left: 100
};

const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

class BarChart extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.xAxis = d3.axisBottom();
        this.yAxis = d3.axisLeft();
    }

    componentDidMount() {
        const xScale = d3.scaleBand()
            .domain(json.map(item => item.name))
            .range([0, graphWidth]);
        
        const [min, max] = d3.extent(json, d => d.orders);
        const yScale = d3.scaleLinear()
            .domain([0, max])
            .range([graphHeight, 0]);
        
        this.setState({
            ordersList: json.map(d => ({
                width: xScale.bandwidth(),
                height: graphHeight - yScale(d.orders),
                fill: 'orange',
                x: xScale(d.name),
                y: yScale(d.orders)
            })),
            xScale,
            yScale
        });
    }

    componentDidUpdate() {
        this.xAxis.scale(this.state.xScale);
        d3.select(this.refs.xAxis).call(this.xAxis);
        this.yAxis.scale(this.state.yScale);
        d3.select(this.refs.yAxis).call(this.yAxis);
    }

    render() {
        return (
            <div className="canvas">
                <svg height={600} width={600}>
                    <g height={graphHeight} width={graphWidth} transform={`translate(${margin.left}, ${margin.top})`}>
                        {
                            this.state.ordersList && this.state.ordersList.map(d => {
                                return <rect width={d.width} height={d.height} fill={d.fill} x={d.x} y={d.y} />
                            })
                        }
                    </g>
                    <g ref={'xAxis'} transform={`translate(${margin.left}, ${600-margin.bottom})`}/>
                    <g ref={'yAxis'} transform={`translate(${margin.left}, ${margin.top})`}/>
                </svg>
            </div>
        )
    }
}

export default BarChart;
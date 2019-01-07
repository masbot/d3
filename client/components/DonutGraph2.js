import React, { Component } from 'react';
import * as d3 from "d3";
import db from './firebase';
import { legendColor } from 'd3-svg-legend'
import tip from 'd3-tip';
import { parse } from 'url';
d3.tip = tip;

const list = [
    {
        platform: "S3",
        datasets: ["123456", "234567"]
    },
    {
        platform: "Onelake",
        datasets: ["123456", "234567"]
    },
    {
        platform: "Snowflake",
        datasets: ["123456", "234567","123456", "234567","123456", "234567"]
    },
    {
        platform: "Nebula",
        datasets: ["123456", "234567","123456", "234567"]
    },
];

const dims = { height: 300, width: 300, radius: 150 }
const center = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) }


class DonutGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }

        this.pie = d3.pie()
            .sort(null)
            .value(d => d.datasets.length);

        this.arcPath = d3.arc()
            .outerRadius(dims.radius)
            .innerRadius(dims.radius/2)
    
        this.color = d3.scaleOrdinal(d3['schemeSet3'])
            .domain(list.map(d => d.platform))

    }

    arcTweenEnter(d) {
        let i = d3.interpolate(d.endAngle, d.startAngle);
        
        const arcPath = d3.arc()
            .outerRadius(dims.radius)
            .innerRadius(dims.radius/2);

        return (t) => {
            d.startAngle = i(t);
            return arcPath(d);
        }
    }

    componentDidMount() {
        //generates the angle based on length
        // const pie = d3.pie()
        //     .sort(null)
        //     .value(d => d.datasets.length);
        
        //generate the path of slice
        // const arcPath = d3.arc()
        //     .outerRadius(dims.radius)
        //     .innerRadius(dims.radius/2)
        
        const pieData = this.pie(list); 
        const color = d3.scaleOrdinal(d3['schemeSet3'])
            .domain(list.map(d => d.platform))

        this.setState({
            list: pieData.map(d => {
                if(!d) return
                return {
                    path: this.arcPath(d),
                    fill: color(d.data.platform),
                    startAngle: d.startAngle || 0,
                    endAngle: d.endAngle || 0
                }
            })
        })
    }

    componentDidUpdate() {
        d3.select(this.refs.donut)
            .selectAll('path')
            .data(this.pie(list))
            .transition().duration(750)
                .attrTween('d', this.arcTweenEnter);
        
        d3.selectAll('path')
            .on('mouseover', (d, i, n) => {
                d3.select(n[i])
                    .transition('changeSliceFill').duration(300)
                        .attr('fill', '#fff');
            })
            .on('mouseout', (d, i, n) => {
                d3.select(n[i])
                    .transition('changeSliceFill').duration(300)
                        .attr('fill', this.color(d.data.platform));
            })
    }

    render() {

        return (
            <div className="canvas">
                <svg width={600} height={600}>
                    <g ref="donut" transform={`translate(${center.x}, ${center.y})`}>
                        {this.state.list && this.state.list.map(d => {
                            return <path 
                                stroke={'#fff'}
                                fill={d.fill}
                                d={d.path}
                            />
                        })}
                    </g>
                </svg>
            </div>
        )
    }
}

export default DonutGraph;
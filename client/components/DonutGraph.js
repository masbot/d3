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
]

class DonutGraph extends Component {
    constructor(props) {
        super(props);
        this.state = {

        }

        this.arcTweenEnter = this.arcTweenEnter.bind(this);

        //set margins
        this.dims = { height: 300, width: 300, radius: 150 }
        this.center = { x: (this.dims.width / 2 + 5), y: (this.dims.height / 2 + 5) }
    }

    componentDidMount() {   
        //set up svg and group
        this.svg = d3.select('.canvas').append('svg')
            .attr("width", this.dims.width + 150 ) //150 extra room for the legend
            .attr("height", this.dims.height + 150)
        
        this.graph = this.svg.append('g')
            .attr('transform', `translate(${this.center.x}, ${this.center.y})`)
        
        //set pie method to generate angle based on cost
        this.pie = d3.pie()
            .sort(null)
            .value(d => d.datasets.length)
        
        //arc generator need the start and end angle
        //creates the path to create the slice
        this.arcPath = d3.arc()
            .outerRadius(this.dims.radius)
            .innerRadius(this.dims.radius/2) //inner arc

        this.color = d3.scaleOrdinal(d3['schemeSet3'])

        this.draw();
    }

    arcTweenEnter(d){
        let i = d3.interpolate(d.endAngle, d.startAngle);
        
        const arcPath = d3.arc()
            .outerRadius(this.dims.radius)
            .innerRadius(this.dims.radius/2) //inner arc

        return function(t) {
            d.startAngle = i(t);
            return arcPath(d);
        }
    }
    

    draw() {
        this.update();
    }

    update() {
        console.log(list);

        this.color.domain(list.map(d => d.platform))

        const paths = this.graph.selectAll('path')
            .data(this.pie(list));

        paths.attr('d', this.arcPath)
            .attr('fill', d => {
                return this.color(d.data.platform)
            })

        paths.enter()
            .append('path')
            .attr('class', 'arc')
            .attr('d', d => {
                console.log(this.arcPath(d))
                return this.arcPath(d)
            })
            .attr('fill', d => {
                console.log(d)
                return this.color(d.data.platform)
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .transition().duration(750)
                .attrTween('d', this.arcTweenEnter)

        this.graph.selectAll('path')
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
            <div className="container">
                <div className="row">
                    <div className="col s6"></div>
                    <div className="col s6">
                        <div className="canvas"></div>
                    </div>
                </div>
            </div>
        )
    }
}

export default DonutGraph;
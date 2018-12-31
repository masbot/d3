import React, { Component } from 'react';
import * as d3 from "d3";
import json from './jsons/curry.json';

class LinearScale extends Component {
    componentDidMount() {
        this.draw();
    }

    draw() {

        const min = d3.min(data, d => d.orders)
        const max = d3.max(data, d => d.orders)
        const extent = d3.extent(data, d => d.orders)

        const y = d3.scaleLinear()
            .domain([0, max])
            .range([0, 500])

        const x = d3.scaleBand()
            .domain(json.map(item => item.name))
            .range([0, 500])
            .paddingInner(0.2)
            .paddingOuter(0.2)
            
            
        const svg = d3.select('svg');

        const rects = svg.selectAll('rect').data(json);

        rects.attr('width', x.bandwidth)
            .attr('height', d => y(d.orders))
            .attr('fill', 'orange')
            .attr('x', (d, i) => x(d.name))

        rects.enter()
            .append('rect')
            .attr('width', x.bandwidth)
            .attr('height', d => y(d.orders))
            .attr('fill', 'orange')
            .attr('x', (d, i) => x(d.name))
    
    }

    render() {
        return (
            <div className="canvas">
                <svg width="600" height="600">
                    <rect></rect>
                </svg>
            </div>
        )
    }
}

export default LinearScale;
import React, { Component } from 'react';
import * as d3 from "d3";

class Data extends Component {
    componentDidMount() {
        this.draw();
    }

    draw() {
        const data = [
            {width: 200, height: 100, fill: 'purple'},
            {width: 100, height: 60, fill: 'pink'},
            {width: 50, height: 30, fill: 'red'},
            {width: 25, height: 15, fill: 'yellow'},
        ];

        const svg = d3.select('svg')
        
        const rects = svg.selectAll('rect')
            .data(data)

            //data, index, current selection
        rects.attr('width', (d, i, n) => {
                console.log(d)
                return d.width
            })
            .attr('height', (d) => d.height)
            .attr('fill', (d) => d.fill)

        rects.enter()
            .append('rect')
            //data, index, current selection
            .attr('width', (d, i, n) => d.width)
            .attr('height', (d) => d.height)
            .attr('fill', (d) => d.fill);
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

export default Data;


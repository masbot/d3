import React, { Component } from 'react';
import * as d3 from "d3";

class D3 extends Component {
    componentDidMount() {
        this.draw();
    }

    draw() {
        const svg = d3.select('.canvas')
                    .append('svg')
                    .attr('height', 600)
                    .attr('width', 600)

        const group = svg.append('g')
                        .attr('transform', 'translate(50, 100)');

        //append shapes to svg container
        group.append('rect')
            .attr('width', 200)
            .attr('height', 100)
            .attr('fill', 'blue')
            .attr('x', 20)
            .attr('y', 20);

        group.append('circle')
            .attr('r', 50)
            .attr('cx', 300)
            .attr('cy', 70)
            .attr('fill', 'pink')

        group.append('line')
            .attr('x1', 370)
            .attr('x2', 400)
            .attr('y1', 20)
            .attr('y2', 120)
            .attr('stroke', 'red')

        svg.append('text')
            .attr('x', 20)
            .attr('y', 200)
            .attr('fill', 'grey')
            .text('hello world')
            .style('font-family', 'arial')
            
    }

    render() {
        return (
            <div className="canvas">
                d3
            </div>
        )
    }
}

export default D3;

/**
 * Grouping
 */
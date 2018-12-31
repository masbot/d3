import React, { Component } from 'react';
import * as d3 from "d3";
import json from './planets.json'

class Planets extends Component {
    componentDidMount() {
        this.draw();
    }

    draw() {
        const svg = d3.select('svg');
        // d3.json('../planets.json').then(data => {

        // })
        const circles = svg.selectAll('circle')
            .data(json)
        
        circles.attr('cy', 200)
            .attr('cx', d => d.distance)
            .attr('r', d => d.radius)
            .attr('fill', d => d.fill)
        
        circles.enter()
            .append('circle')
            .attr('cy', 200)
            .attr('cx', d => d.distance)
            .attr('r', d => d.radius)
            .attr('fill', d => d.fill) 
            
    }

    render() {
        return (
            <div className="canvas">
                <svg width="600" height="600"></svg>
            </div>
        )
    }
}

export default Planets;
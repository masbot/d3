import React, { Component } from 'react';
import * as d3 from "d3";
import json from './jsons/curry.json';

class BarChart extends Component {
    componentDidMount() {
        this.draw();
    }

    draw() {
        const svg = d3.select('.canvas').append('svg').attr('width', 600).attr('height', 600);

        //create margin and dimensions
        const margin = { 
            top: 20,
            right: 20,
            bottom: 100,
            left: 100
        }

        const graphWidth = 600 - margin.left - margin.right;
        const graphHeight = 600 - margin.top - margin.bottom;
        const graph = svg.append('g')
            .attr('width', graphWidth)
            .attr('height', graphHeight)
            .attr('transform', `translate(${margin.left}, ${margin.top})`)

        const xAxisGroup = graph.append('g')
            .attr('transform', `translate(${0},${graphHeight})`)
        const yAxisGroup = graph.append('g');

        const min = d3.min(json, d => d.orders)
        const max = d3.max(json, d => d.orders)
        const extent = d3.extent(json, d => d.orders)

        //transform y height to match range
        const y = d3.scaleLinear()
            .domain([0, max])
            .range([graphHeight, 0]) //inverse

        const x = d3.scaleBand()
            .domain(json.map(item => item.name))
            .range([0, 500])
            .paddingInner(0.2)
            .paddingOuter(0.2)
            
            
        // const svg = d3.select('svg');

        const rects = graph.selectAll('rect').data(json);

        rects.attr('width', x.bandwidth)
            .attr('height', d => graphHeight - y(d.orders))
            .attr('fill', 'orange')
            .attr('x', (d, i) => x(d.name))
            .attr('y', d => y(d.orders)) //default is 0

        rects.enter()
            .append('rect')
            .attr('width', x.bandwidth)
            .attr('height', d => graphHeight - y(d.orders))
            .attr('fill', 'orange')
            .attr('x', (d, i) => x(d.name))
            .attr('y', d => y(d.orders)) //default is 0

        //create and call the axes
        const xAxis = d3.axisBottom(x)

        const yAxis = d3.axisLeft(y)
            .ticks(3)
            .tickFormat(d => d + ' orders')
            
        xAxisGroup.call(xAxis)
        yAxisGroup.call(yAxis)

        xAxisGroup.selectAll('text')
            .attr('transform', 'rotate(-40)')
            .attr('text-anchor', 'end')

    }

    render() {
        return (
            <div className="canvas">

            </div>
        )
    }
}

export default BarChart;

/**
 * Surrounding graph with margin and puting the graphs in groups
 * Group width = 600 - ml - mr
 */
import * as d3 from "d3";
import tip from 'd3-tip';
d3.tip = tip;

const margin = { top: 40, right: 20, bottom: 50, left: 100 };
const graphWidth = 560 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

//2
const svg = d3.select('.canvas').append('svg')
    .attr('width', graphWidth + margin.left + margin.right)
    .attr('height', graphHeight + margin.top + margin.bottom)

    console.log('test')

//3
const graph = svg.append('g')
    .attr('width', graphWidth)
    .attr('height', graphHeight)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

//4 scales
const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

//5 Axes group
const xAxisGroup = graph.append('g') //contains all of our axes shape
    .attr('class', 'x-axis')
    .attr('transform', 'translate(0,'+graphHeight+')') //sits at the bottom of the graph

const yAxisGroup = graph.append('g')
    .attr('class', 'y-axis');


export const update = (data, activity) => {
    console.log('update',data);

    data = data.filter(item => item.activity === activity)

    console.log(data)
    
    //6 set scales domain
    //looks at all of the date and orders them
    x.domain(d3.extent(data, d => new Date(d.date)))
    y.domain([0, d3.max(data, d => d.distance)])


    //9
    const circle = graph.selectAll('circle')
        .data(data)

    //10 remove unwanted points
    circle.exit().remove()

    //10 update current points
    circle
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(d.distance))

    //9
    circle.enter()
        .append('circle')
        .attr('r', 4)
        .attr('cx', d => x(new Date(d.date)))
        .attr('cy', d => y(d.distance))
        .attr('fill', "#ccc")
    

    //7 create axes
    const xAxis = d3.axisBottom(x)
        .ticks(4)
        .tickFormat(d3.timeFormat('%b %d'))

    const yAxis = d3.axisLeft(y)
        .ticks(4)
        .tickFormat(d => d + 'm')

    //8 call Axis
    xAxisGroup.call(xAxis)
    yAxisGroup.call(yAxis)

    //rotate axis text
    xAxisGroup.selectAll('text')
        .attr('transform', 'rotate(-40)')
        .attr('text-anchor', 'end')
}


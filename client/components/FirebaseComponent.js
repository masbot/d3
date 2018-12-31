import React, { Component } from 'react';
import * as d3 from "d3";
import fire from './firebase';

class Firebase extends Component {

    componentDidMount() {
        this.draw();
    }



    draw() {
        //SET UP GRAPH
        const svg = d3.select('.canvas').append('svg').attr('width', 600).attr('height', 600);
        
        //create margin and dimensions
        const margin = { 
            top: 20,
            right: 20,
            bottom: 100,
            left: 100
        };

        const graphWidth = 600 - margin.left - margin.right;
        const graphHeight = 600 - margin.top - margin.bottom;

        const graph = svg.append('g')
            .attr('width', graphWidth)
            .attr('height', graphHeight)
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const xAxisGroup = graph.append('g')
            .attr('transform', `translate(${0},${graphHeight})`);
        const yAxisGroup = graph.append('g');
        
        // const min = d3.min(data, d => d.orders);
        // const max = d3.max(data, d => d.orders);
        // const extent = d3.extent(data, d => d.orders);

        //scales
        //transform y height to match range
        const y = d3.scaleLinear()
            .range([graphHeight, 0]) //inverse

        const x = d3.scaleBand()
            .range([0, 500])
            .paddingInner(0.2)
            .paddingOuter(0.2)

        //create the axes
        const xAxis = d3.axisBottom(x)

        const yAxis = d3.axisLeft(y)
            .ticks(3)
            .tickFormat(d => d + ' orders')

        //updates x axis text
        xAxisGroup.selectAll('text')
            .attr('transform', 'rotate(-40)')
            .attr('text-anchor', 'end')

        const t = d3.transition().duration(500);    

        const widthTween = (d) => {
            //define interpolation
            //d3.interpolate returns a function which we call 'i'
            let i = d3.interpolate(0, x.bandwidth());
    
            //passing in a value between 0 - 1
            //0 return 0
            //1 return x.bandwidth
            //allowing us to pass time ticker values into this function which is going to return a position during the transition
    
            //representation of the time or the duration of the transition
            //return a function which takes in a time ticker 't'
            return function(t) {
                //return the value from passing the ticker into the interpolation
                return i(t)
            }
        }    

        //******** UPDATE  ********/   
        const update = (data) => {
            // updating scale domain
            y.domain([0, d3.max(data, d => d.orders)]); //0 - max in the list of data
            x.domain(data.map(item => item.name)); //list of names

            const rects = graph.selectAll('rect').data(data);

            //remove exit selection
            rects.exit().remove();

            //updates current state in dom
            //transitions - dont need to put start location because they already exist
            rects.attr('width', x.bandwidth)
                .attr('fill', 'orange')
                .attr('x', (d, i) => x(d.name))
                // .transition(t)
                // .transition().duration(500)
                    // .attr('y', d => y(d.orders)) //default is 0
                    // .attr('height', d => graphHeight - y(d.orders))

            rects.enter()
                .append('rect')
                //starting position
                .attr('width', 0)
                //starting conditions for transition
                .attr('height', 0)
                .attr('y', graphHeight)
                .attr('fill', 'orange')
                .attr('x', (d, i) => x(d.name))
                //ending transitions
                // .transition().duration(500)
                .merge(rects) //after this point, merge and apply the bottom part to both current and enter selections
                .transition(t)
                    //end position
                    .attrTween('width', widthTween)
                    .attr('y', d => y(d.orders)) //default is 0      
                    .attr('height', d => graphHeight - y(d.orders))
 
            //call axes
            xAxisGroup.call(xAxis)
            yAxisGroup.call(yAxis)
        }

        //just retrieveing 
        // fire.collection('dishes').get().then(res => {
        //     const data = [];
        //     res.docs.forEach(doc => {
        //         data.push(doc.data())                
        //     });
        //     update(data);
            
        //     d3.interval(() => {
        //         data[0].orders += 50;
        //         update(data);
        //     }, 1000);

        //     //update(data);
        // })

        //listen to collection inside db
        let data = [];
        fire.collection('dishes').onSnapshot(res => {
            res.docChanges().forEach( change => {
                const doc = Object.assign({}, change.doc.data(), { id: change.doc.id })
                console.log(data);
                switch(change.type) {
                    case 'added':
                        data.push(doc);
                        break;
                    case 'modified':
                        const index = data.findIndex(item => item.id == doc.id);
                        data[index] = doc;
                        break;
                    case 'removed':
                        data = data.filter(item => item.id !== doc.id);
                        break;
                    default:
                        break;
                }
            })
            update(data);
        })
        //update(data);

    }

    render() {
        return (
            <div className="canvas">
                firebase
            </div>
        )
    }
}

export default Firebase;

/*
Enter selection 
virtual elements by enter method

use exit to remove elements

    // update(data) {
    //     //1. update scales (domains) if they rely on our data
    //     y.domain([0, d3.max(data, d => d.orders)]);

    //     //2. join updated data to element
    //     const rects = graph.selectAll('rect').data(data);

    //     //3.remote unwated (if any) shapes using the exit selection
    //     rects.exit().remove();

    //     //4. update the current shapes in the dom
    //     rects.attr(...etc);

    //     //5. append the enter selection to the dom
    //     rects.enter().append().attr(...etc);
    // }

    //transition need starting and ending positions
 
    Starting condition:
    Y = graphHeight
    Height = 0
    
    Ending condition:
    Y = y(d.orders)
    Height = graphHeight - y(d.orders)


    //merge - after applying the attr, merge the current rect selection (current element in the dom), anything below merge, apply 
    //both the enter and apply selection already in the dom


    const widthTween = (d) => {
        //define interpolation
        //d3.interpolate returns a function which we call 'i'
        let i = d3.interpolate(0, x.bandwidth);

        //passing in a value between 0 - 1
        //0 return 0
        //1 return x.bandwidth
        //allowing us to pass time ticker values into this function which is going to return a position during the transition

        //representation of the time or the duration of the transition
        //return a function which takes in a time ticker 't'
        return function(t) {
            //return the value from passing the ticker into the interpolation
            return i(t)
        }
    }    
*/
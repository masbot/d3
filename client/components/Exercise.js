import React, { Component } from 'react';
import * as d3 from "d3";
import db from './firebase';
import { legendColor } from 'd3-svg-legend'
import tip from 'd3-tip';
import { parse } from 'url';
d3.tip = tip;

class Exercise extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activity: 'cycling',
            distance: '',
            error: {
                textContent: ''
            }
        }

        this.margin = { top: 40, right: 20, bottom: 50, left: 100 };
        this.graphWidth = 560 - this.margin.left - this.margin.right;
        this.graphHeight = 400 - this.margin.top - this.margin.bottom;
        this.x = d3.scaleTime().range([0, this.graphWidth]);
        this.y = d3.scaleLinear().range([this.graphHeight, 0]);
    }

    componentDidMount() {
                
        this.svg = d3.select('.canvas').append('svg')
            .attr('width', this.graphWidth + this.margin.left + this.margin.right)
            .attr('height', this.graphHeight + this.margin.top + this.margin.bottom);

        this.graph = this.svg.append('g')
            .attr('width', this.graphWidth)
            .attr('height', this.graphHeight)
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        this.xAxisGroup = this.graph.append('g') //contains all of our axes shape
            .attr('class', 'x-axis')
            .attr('transform', 'translate(0,'+this.graphHeight+')') //sits at the bottom of the graph

        this.yAxisGroup = this.graph.append('g')
            .attr('class', 'y-axis');

        //line generator
        this.line = d3.line()
            .x(d => this.x(new Date(d.date)))
            .y(d => this.y(d.distance));

        //line path element
        this.path = this.graph.append('path');

        this.dottedXline = this.graph.append('line');

        this.dottedYline = this.graph.append('line');

        this.draw();
    }

    update(data) {
        data = data.filter(item => item.activity === this.state.activity);
        //sort data based on date for line to be in order
        data.sort((a,b) => new Date(a.date) - new Date(b.date));
       
        this.x.domain(d3.extent(data, d => new Date(d.date)))
        this.y.domain([0, d3.max(data, d => d.distance)])

        //update path data
        this.path.data([data])
            .attr('fill', 'none')
            .attr('stroke', '#00bfa5')
            .attr('stroke-width', 2)
            .attr('d', this.line)



        const circle = this.graph.selectAll('circle')
            .data(data)

        circle.exit().remove()

        circle
            .attr('cx', d => this.x(new Date(d.date)))
            .attr('cy', d => this.y(d.distance))

        circle.enter()
            .append('circle')
            .attr('r', 4)
            .attr('cx', d => this.x(new Date(d.date)))
            .attr('cy', d => this.y(d.distance))
            .attr('fill', "#ccc")

        this.graph.selectAll('circle')
            .on('mouseover', (d,i,n) => {
                d3.select(n[i])
                    .transition().duration(100)
                    .attr('r', 8)
                    .attr('fill', 'hotpink')
                
                this.dottedXline
                    .attr('x1', n[i].getAttribute('cx'))
                    .attr('x2', n[i].getAttribute('cx'))
                    .attr('y1', n[i].getAttribute('cy') )
                    .attr('y2', this.graphHeight)
                    .attr('stroke', '#eee')
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', 5,5)
                
                this.dottedYline
                    .attr('x1', 0)
                    .attr('x2', n[i].getAttribute('cx'))
                    .attr('y1', n[i].getAttribute('cy'))
                    .attr('y2', n[i].getAttribute('cy'))
                    .attr('stroke', '#eee')
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', 5,5)
            })
            .on('mouseleave', (d,i,n) => {
                d3.select(n[i])
                    .transition().duration(100)
                    .attr('r', 4)
                    .attr('fill', '#ccc')
                
                this.dottedYline
                    .attr('x1', 0)
                    .attr('x2', 0)
                    .attr('y1', 0)
                    .attr('y2', 0)
                this.dottedXline
                    .attr('x1', 0)
                    .attr('x2', 0)
                    .attr('y1', 0)
                    .attr('y2', 0)

            })
        
        const xAxis = d3.axisBottom(this.x)
            .ticks(4)
            .tickFormat(d3.timeFormat('%b %d'))

        const yAxis = d3.axisLeft(this.y)
            .ticks(4)
            .tickFormat(d => d + 'm')
            
        this.xAxisGroup.call(xAxis)
        this.yAxisGroup.call(yAxis)

        //rotate axis text
        this.xAxisGroup.selectAll('text')
            .attr('transform', 'rotate(-40)')
            .attr('text-anchor', 'end')    
    }

    draw() {
        //data and firestore
        let data = [];        
        db.collection('activities').onSnapshot(res => {
            res.docChanges().forEach(change => {
                const doc = Object.assign({}, change.doc.data(), { id: change.doc.id });

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
            this.update(data);
        })
    }

    onChange(e){
        this.setState({
            distance: e.target.value
        })
    }

    onSubmit(e) {
        e.preventDefault();
        const { activity, distance } = this.state;

        if(distance) {
            db.collection('activities').add({
                distance: parseInt(distance),
                activity,
                date: new Date().toString()
            }).then(() => {
                this.setState({
                    error: { textContent : ''},
                    distance: '',
                    activity: ''
                })
            })
        } else {
            this.setState({
                error: { textContent: 'Please add value for distance' }
            })
        }
    }

    onClick(e) {
        this.setState({
            activity: e.target.dataset.activity
        });
        this.draw();
    }

    render() {
        return (
            <div>
               <div className="nav z-depth-0">
                    <div className="section center">
                        <h3 className="white-text center">- The Dojo -</h3>
                    </div>
               </div>

               <div className="section center">
                    <div className="grey-text flow-text">A fitness tracker for ninjas</div>
               </div>

               <div className="container section">
                    <div className="row">
                        <div className="col s6 15">
                            <button onClick={this.onClick.bind(this)} className={this.state.activity === 'cycling' ? 'active' : ''} data-activity="cycling">Cycling</button>
                            <button onClick={this.onClick.bind(this)} className={this.state.activity === 'running' ? 'active' : ''} data-activity="running">Running</button>
                            <button onClick={this.onClick.bind(this)} className={this.state.activity === 'swimming' ? 'active' : ''} data-activity="swimming">Swimming</button>
                            <button onClick={this.onClick.bind(this)} className={this.state.activity === 'walking' ? 'active' : ''} data-activity="walking">Walking</button>
                        </div>
                        <div className="col s6 16 push-11">
                            <div className="canvas"></div>
                        </div>
                    </div>

                    <div className="row">
                        <form className="col m6 push-m3" onSubmit={this.onSubmit.bind(this)}>
                            <p className="flow-text grey-text center">How much <span>cycling</span> have you done today?</p>
                            <input type="text" onChange={this.onChange.bind(this)} value={this.state.distance} className="grey-text" id="cycling" placeholder="Distance in m"/>
                            <p className="center pink-text error text-lighten-1">error</p>
                        </form>
                    
                    </div>
               </div>
            </div>
        )
    }
}

export default Exercise;


/*
domain
latest date,earliest date

range
0, graphWidth

linearScale Y

domain
0, max distance

range
graphHeight, 0

*/
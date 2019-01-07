import React, { Component } from 'react';
import * as d3 from "d3";
import db from './firebase';
import { legendColor } from 'd3-svg-legend'
import tip from 'd3-tip';
import { parse } from 'url';
d3.tip = tip;

const margin = { top: 40, right: 20, bottom: 50, left: 100 };
const graphWidth = 560 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

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

        this.xAxis = d3.axisBottom();
        this.yAxis = d3.axisLeft();
    }

    componentDidMount() {
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
            //this.update(data);

            if(data.length === 0) return;

            const xExtent = d3.extent(data, d => new Date(d.date));
            const xScale = d3.scaleTime()
                .domain(xExtent)
                .range([0, graphWidth]);
    
            const [min, max] = d3.extent(data, d => d.distance)
            const yScale = d3.scaleLinear()
                .domain([0, max])
                .range([graphHeight, 0])
    
            
                
            this.setState({
                activities: data.map(d => {
                    return {
                        activity: d.activity,
                        cx: xScale(new Date(d.date)),
                        cy: yScale(d.distance),
                        r: 4,
                        fill: '#ccc'
                    }
                }),
                xScale,
                yScale
            });
        });

    }

    componentDidUpdate() {
        this.xAxis.scale(this.state.xScale)
            .tickFormat(d3.timeFormat('%b %d'))
        
        const xAxisGroup = d3.select(this.refs.xAxis).call(this.xAxis)
            .selectAll('.tick')
        
        xAxisGroup
            .selectAll('text')
            .attr('transform', 'rotate(-40)')
            .attr('text-anchor', 'end')    

        this.yAxis.scale(this.state.yScale)
        d3.select(this.refs.yAxis).call(this.yAxis);

        d3.selectAll('circle')
            .on('mouseover', (d,i,n) => {
                d3.select(n[i])
                    .transition().duration(100)
                    .attr('r', 8)
                    .attr('fill', 'hotpink')
        
            })
            .on('mouseleave', (d,i,n) => {
                d3.select(n[i])
                    .transition().duration(100)
                    .attr('r', 4)
                    .attr('fill', '#ccc')
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
        console.log(this.state)
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
                            <div className="canvas">
                                <svg width={560} height={400}>
                                    <g width={graphWidth} height={graphHeight} transform={`translate(${margin.left}, ${margin.top})`}>
                                        {
                                            this.state.activities && this.state.activities
                                                .filter(d => d.activity === this.state.activity)
                                                .sort((a,b) => new Date(a.date) - new Date(b.date))
                                                .map(d => {
                                                    return <circle 
                                                        cx={d.cx}
                                                        cy={d.cy}
                                                        r={d.r}
                                                        fill={d.fill}
                                                    />
                                            })
                                        }
                                    </g>

                                    <g ref={'xAxis'} transform={`translate(${margin.left}, ${400-margin.bottom})`}/>
                                    <g ref={'yAxis'} transform={`translate(${margin.left}, ${margin.top})`}/>
                                </svg>
                            </div>
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

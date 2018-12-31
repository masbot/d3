import React, { Component } from 'react';
import * as d3 from "d3";
import db from './firebase';
import { legendColor } from 'd3-svg-legend'
import tip from 'd3-tip';
d3.tip = tip;

class NinjaWonga extends Component {
    constructor(props) {
        super(props);
        this.state = {
            expense: {
                cost: "",
                name: ""
            },
            error: {
                textContent: ""
            }
        }

    }

    componentDidMount() {
        this.draw();
    }

    draw() {
        const dims = { height: 300, width: 300, radius: 150 }
        const center = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) }

        const svg = d3.select(".canvas").append("svg")
            .attr("width", dims.width + 150 ) //150 extra room for the legend
            .attr("height", dims.height + 150)
        
        const graph = svg.append("g")
            .attr('transform', `translate(${center.x}, ${center.y})`)

        //call and pass data (array)
        //generate angle based on cost (start and end angle)
        const pie = d3.pie()
            .sort(null) //dont sort based on size
            .value(d => d.cost) 
        
        //arc generator need the start and end angle
        //creates the path to create the slice
        const arcPath = d3.arc()
            .outerRadius(dims.radius) //length of wedges
            .innerRadius(dims.radius/2) //inner arc

        const color = d3.scaleOrdinal(d3['schemeSet3']) //set ordinal scale
        
        const arcTweenEnter = (d) => {
            //this function will generate a value between a start and end angle
            let i = d3.interpolate(d.endAngle, d.startAngle);

            //t - ticker - a value between 0 and 1
            return function(t) {

                //and then update the start angle of the wedge
                d.startAngle = i(t);

                //return a value of the path
                return arcPath(d);
            }
        }

        //delete tween
        const arcTweenExit = (d) => {
            let i = d3.interpolate(d.startAngle, d.endAngle);
        
            return function(t) {
                d.startAngle = i(t);
                return arcPath(d);
            }
        }   

        const arcTweenUpdate = (d) => {
            //interpolate between two objects
            let i = d3.interpolate(this.current, d) //takes all of the values

            //update the current prop with new updated data
            this._current = i(1);

            return function(t) {
                return arcPath(i(t))
            }
        }

        //legend set up
        const legendGroup = svg.append('g')
            .attr('transform', `translate(${dims.width + 40}, ${10})`)

        const legend = legendColor()
            .shape('circle')
            .shapePadding(10)
            .scale(color)

        const handleMouseOver = (d, i, n) => {
            //n is the list of all the selection
            d3.select(n[i])
                .transition('changeSliceFill').duration(300)
                    .attr('fill', '#fff')
        };
        
        const handleMouseOut = (d, i, n) => {
            d3.select(n[i])
                .transition('changeSliceFill').duration(300)
                    .attr('fill', color(d.data.name))
        }
        
        const handleClick = (d) => {
            const id = d.data.id;
            db.collection('expenses').doc(id).delete();
        }

        const tip = d3.tip()
            .attr('class', 'tip card')
            .html(d => {
                return `<div class="name">${d.data.name}</div><div class="cost">${d.data.cost}</div><div class="delete">Click slice to delete</div>`;
            })

        //applies all of the shapes to the graph group   
        graph.call(tip)
            
        const update = (data) => {

            //update color scale domain
            color.domain(data.map(d => d.name));
            
            legendGroup.call(legend);
            legendGroup.selectAll('text').attr('fill', "white")

            console.log(data);

            //join enhanced (pie) data to path elements
            const paths = graph.selectAll('path')
                .data(pie(data))

            //handle exit
            paths.exit()
                .transition().duration(750)
                .attrTween("d", arcTweenExit)
                .remove();

            paths.attr('d', arcPath)
                .attr('fill', d => color(d.data.name))
                .transition().duration(750)
                .attrTween("d", arcTweenUpdate)
            
            paths.enter()
                .append('path')
                .attr('class', 'arc')
                // .attr('d', arcPath)
                .attr('stroke', '#fff')
                .attr('stroke-width', 2)
                .attr('fill', d => color(d.data.name))
                .each(function(d) { this._current = d })
                .transition().duration(750)
                    .attrTween("d", arcTweenEnter)
            
            //add events
            graph.selectAll('path')
                .on('mouseover', (d, i, n) => {
                    handleMouseOver(d, i, n);
                    tip.show(d, n[i]);
                })
                .on('mouseout', (d,i,n) => {
                    handleMouseOut(d,i,n);
                    tip.hide();
                })
                .on('click', handleClick)

        }   

        //data array and firestore
        let data = [];
        db.collection('expenses').onSnapshot(res => {
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
            console.log(data);
            update(data);
        })

        

    }

    onChange(e){
        const { value, id } = e.target;
        this.setState((prevState) => ({
            expense: Object.assign({}, prevState.expense, {[id]: value})
        }));
    }

    onSubmit(e) {
        e.preventDefault();
        const { name, cost } = this.state.expense;
        if(name && cost){
            const item = {
                name,
                cost: parseInt(cost)
            };

            db.collection('expenses').add(item)
                .then(res => {
                    this.setState({
                        expense: { name: "", cost: ""},
                        error: {textContent: ""}
                    });
                })

        } else {
            this.setState(prevState => ({
                error: Object.assign({}, prevState.error, { textContent: "Please enter values before submitting."})
            }))
        }
    }

    render() {
        return (
            <div>
                <header className="indigo darken-1 section">
                    <h2 className="center white-text">Ninja Wong</h2>
                    <p className="flow-text grey-text center text-lighten-2">Monthly money tracker for ninjas...</p>
                </header>

                <div className="container section">
                    <div className="row">
                        {/* form */}
                        <div className="col s12 m6">
                            <form className="card z-depth-0" onSubmit={this.onSubmit.bind(this)}>
                                <div className="card-content">
                                    <span className="card-title indigo-text">Add Item:</span>
                                    <div className="input-field">
                                        <input type="text" id="name" onChange={this.onChange.bind(this)} value={this.state.expense.name}/>
                                        <label htmlFor="name"> Item Name</label>
                                    </div>
                                    <div className="input-field">
                                        <input type="text" id="cost" onChange={this.onChange.bind(this)} value={this.state.expense.cost}/>
                                        <label htmlFor="name"> Item Cost</label>
                                    </div>
                                    <div className="input-field center">
                                        <button className="btn-large pink white-text">Add Item</button>
                                    </div>
                                    <div className="input-field center">
                                        <p className="red-text" id="error">{this.state.error.textContent}</p>
                                    </div>
                                </div>
                            </form>
                        </div>


                        {/* graph */}
                        <div className="col s12 m5 push-m1">
                            <div className="canvas">

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default NinjaWonga;


// const arcTweenEnter = (d) => {
//     let i = d3.interpolate(d.endAngle, d.startAngle);

//     return function(t) {
//         d.startAngle = i(t);
//         return arcPath(d);
//     }
// }

/*
Pie generator - creates a slice for pie chart //create radiants
Draw slice by angle
Use arc to create value for the path of the slice

ordinal scale

how to handle transition by angles
                from =====> to
d3.interpolate(d.endAngle, d.startAngle)
create a custom tween

*/
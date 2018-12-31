import React, { Component } from 'react';
import * as d3 from "d3";
import db from './firebase';
import { legendColor } from 'd3-svg-legend'
import tip from 'd3-tip';
import { parse } from 'url';
d3.tip = tip;


const data = [
    { name: 'news', parent: '' },
    { name: 'tech', parent: 'news' },
    { name: 'sport', parent: 'news' },
    { name: 'music', parent: 'news' },
    { name: 'ai', parent: 'tech', amount: 7 },
    { name: 'coding', parent: 'tech', amount: 5 },
    { name: 'tablets', parent: 'tech', amount: 4 },
    { name: 'laptops', parent: 'tech', amount: 6 },
    { name: 'd3', parent: 'tech', amount: 3 },
    { name: 'gaming', parent: 'tech', amount: 3 },
    { name: 'football', parent: 'sport', amount: 6 },
    { name: 'hockey', parent: 'sport', amount: 3 },
    { name: 'baseball', parent: 'sport', amount: 5 },
    { name: 'tennis', parent: 'sport', amount: 6 },
    { name: 'f1', parent: 'sport', amount: 1 },
    { name: 'house', parent: 'music', amount: 3 },
    { name: 'rock', parent: 'music', amount: 2 },
    { name: 'punk', parent: 'music', amount: 5 },
    { name: 'jazz', parent: 'music', amount: 2 },
    { name: 'pop', parent: 'music', amount: 3 },
    { name: 'classical', parent: 'music', amount: 5 },
];

const stratify = d3.stratify()
    .id(d => d.name) //which property is the id 
    .parentId(d => d.parent); //which is the parent

stratify(data);
//depth - how far from the root node
//height - how far from the leaves

class NinjaCorp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: {
                display: false
            },
            form: {
                name: '',
                parent: '',
                department: '',
            }
        }

        this.dims = {height: 500, width: 1100 };
    }

    componentDidMount() {
        this.draw();
        this.svg = d3.select('.canvas').append('svg')
            .attr('width', this.dims.width + 100 )
            .attr('height', this.dims.height + 100 )
        
        this.graph = this.svg.append('g')
            .attr('transform', `translate(50, 50)`)

        this.stratify = d3.stratify()
            .id(d => d.name)
            .parentId(d => d.parent)

        this.tree = d3.tree()
            .size([this.dims.width, this.dims.height]) //look at the size and data and give x and y coord

        //create ordinal scale
        this.color = d3.scaleOrdinal(d3['schemeSet3'])
    }

    update(data) {
        console.log(data);
        //remove current nodes
        //all updated elements will be virtual
        this.graph.selectAll('.node').remove();
        this.graph.selectAll('.link').remove();

        //update ordinal scale
        const colorDomainValues = [];
        data.forEach( item => colorDomainValues.indexOf(item.department) >= 0 ? console.log(colorDomainValues.indexOf(item.department)): colorDomainValues.push(item.department))
        this.color.domain(colorDomainValues)

        //get updated root node data
        const rootNode = this.stratify(data);
        console.log(rootNode)

        const treeData = this.tree(rootNode); //object with x and y data

        //get node selection and join data
        const nodes = this.graph.selectAll('.node')
            .data(treeData.descendants());

        //get link selection and join data
        //creates an array with objects with source and target (with coordinates)
        const links = this.graph.selectAll('.link')
            .data(treeData.links()) 

        //enter new links
        links.enter()
            .append('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', d => {
                console.log(d)
                console.log(this.color(d.source.department))
                return this.color(d.source.data.department)
            })
            .attr('stroke-width', 2)
            .attr('d', d3.linkVertical()
                .x(d => d.x)
                .y(d => d.y)
            ) //creates vertical links

        //create enter node groups
        const enterNodes = nodes.enter()
            .append('g')
                .attr('class', 'node')
                .attr('transform', d => `translate(${d.x}, ${d.y})`);
        
        //append rects to enter nodes
        enterNodes.append('rect')
            .attr('fill', '#aaa')
            .attr('stroke', '#555')
            .attr('stroke-width', 2)
            .attr('height', 50)
            .attr('width', d => d.data.name.length * 20)
            .attr('transform', d => {
                return `translate(${-d.data.name.length * 20/2}, ${-30})`
            })
        
        //append name text
        enterNodes.append('text')
            .attr('text-anchor', 'middle')
            .text(d => d.data.name)
    }

    onClickAddEmployee() {
        this.setState(prevState => ({
            modal: Object.assign({}, prevState.modal, { display: !prevState.modal.display})
        }))
    }

    onChange(e) {
        const { id, value } = e.target;
        this.setState(prevState => ({
            form: Object.assign({}, prevState.form, { [id]: value })
        }))
    }

    onSubmit(e) {
        e.preventDefault();
        console.log(this.state.form)
        db.collection('employees').add({
            name: this.state.form.name,
            parent: this.state.form.parent,
            department: this.state.form.department
        })
        .then(res => {
            this.setState(prevState => ({
                modal: Object.assign({}, prevState.modal, { display: false }),
                form: Object.assign({}, prevState.form, {
                    name: '',
                    parent: '',
                    department: ''
                })
            }))
        })
    }

    draw() {
        let data = [];
        db.collection('employees').onSnapshot(res => {
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
        });
    }

    render() {
        return (
            <div style={{position: "relative"}}>
                <div className="pink section">
                    <h2 className="white-text center">Ninja Corp</h2>
                </div>
                <div className="grey lighten-3 section grey-text" style={{position: 'relative'}}>
                    <p className="flow-text center"> The Number One Ninja Company </p>
                    <a className="btn-floating btn-large halfway-fab pink modal-trigger" onClick={this.onClickAddEmployee.bind(this)}>
                        <i className="material-icons ">add</i>
                    </a>
                </div>
                <div className="canvas"></div>
                <div id="modal" className="modal" style={{display:`${this.state.modal.display ? 'initial': 'none'}`,position:'absolute', top: 250}}>
                    <div className="modal-content">
                        <h4 className="pink-text center">add new employee</h4>
                    </div>
                    <form onSubmit={this.onSubmit.bind(this)}>  
                        <div className="input-field">
                            <input type="text" id="name" placeholder="Employee Name" onChange={this.onChange.bind(this)}/>
                        </div>
                        <div className="input-field">
                            <input type="text" id="parent" placeholder="Reports to..." onChange={this.onChange.bind(this)}/>
                        </div>
                        <div className="input-field">
                            <input type="text" id="department" placeholder="Department" onChange={this.onChange.bind(this)}/>
                        </div>
                        <div className="input-field">
                            <button className="btn pink white-text">Add Employee</button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

export default NinjaCorp;

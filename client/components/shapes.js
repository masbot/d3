import React, { Component } from 'react';

class Shapes extends Component {
    render() {
        return (
            <div>
                <svg width="600" height="600">
                    {/* <rect x="300" y="100" fill="blue" width="100" height="200"></rect>
                                        
                    <circle 
                        cx="200" 
                        cy="200" 
                        r="50" 
                        fill="pink"
                        stroke="red"
                        stroke-width="2"
                        >
                    </circle>

                    <line
                        x1="100"
                        x2="100"
                        y1="120"
                        y2="300"
                        stroke="grey"
                        stroke-width="10"
                    >
                    </line> */}

                    <path d="M 150 50 L 75 200 L 225 200 C 225 200 150 150 150 50" fill="orange"></path>
                </svg>


            </div>
        )
    }
}

export default Shapes;

/**
D3 creates elements/shapes
circle
rect
line
paths
    M - moveto
    L - lineto
    Z - closepath
    H - horizontal lineto
    V - vertical lineto
    C - curveto
    S - smooth curveto
*/
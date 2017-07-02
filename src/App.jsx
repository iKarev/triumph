import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import LineChart from './components/LineChart';

class App extends React.Component {
    render () {

        return (
            <div className="container">
                <div className="row">
                    <div className="col-xs-12" >
                        <div className="top" id="top-line-chart">
                            <LineChart />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
};


// ReactDOM.render(<Charts/>,document.getElementById("top-line-chart"));



ReactDOM.render(<App title={'React Todo'}/>, document.getElementById('root'));
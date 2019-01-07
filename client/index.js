import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory, IndexRoute } from 'react-router';
import App from './components/Exercise2';
import Firebase from './components/FirebaseComponent';

const Root = () => {
  return (
    <Router history={hashHistory}>
      <Route path="/" component={App}>
        <IndexRoute component={Firebase}/>
      </Route>
    </Router>
  )
};

ReactDOM.render(
  <Root />,
  document.querySelector('#root')
);

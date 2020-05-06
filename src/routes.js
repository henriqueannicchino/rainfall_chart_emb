import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Chart from './pages/Chart';

const Routes = () => (
    <Router>
        <Switch>
            <Route exact path="/" component={Chart} />
        </Switch>
    </Router>
);

export default Routes;
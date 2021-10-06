import React from "react";
import { Router, Route, Switch } from "react-router-dom";
import Login from "./pages/login";
import App from "./pages/home";
import { createBrowserHistory } from "history";
const history = createBrowserHistory();

function Main() {
  return (
    <Router history={history} forceRefresh={true}>
      <Switch>
        <Route exact path="/" component={App} />
        <Route exact path="/login" component={Login} />
      </Switch>
    </Router>
  );
}

export default Main;

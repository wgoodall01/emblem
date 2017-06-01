import React from 'react';
import './App.css';
import { Helmet } from "react-helmet";
import {Route, Switch, NavLink} from "react-router-dom";
import "./App.css";
import classnames from "classnames";

import FeedPage from "pages/Feed";
import {UserPage, MePage} from "pages/UserPage";
import AboutPage from "pages/About";


const NotFound = (props) => <div>
	<h1>404: Page not found</h1>
	<p>Go back, or try another link perhaps.</p>
</div>

/*
 * The App component.
 * Renders the navbar, navigation container, etc.
 * Also does all routing.
 */
const App = (props) => {
	return <div>
		<Helmet defaultTitle="Emblem" titleTemplate="%s - Emblem">
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			<html lang="en"/>
		</Helmet>
		<div className="App_header">
			<div className="App_container">
				<div className="App_nav-layout">
					<NavLink to="/" className="App_title">Emblem</NavLink>
					<nav className="App_nav-links-container">
						{[
							["/about",      "About"],
							["/",           "Feed"],
							["/me",         "Me",   "App_nav-link-button"],
						].map((e, i, arr) => (
							<span key={i}>
								<NavLink 
									exact
									to={e[0]} 
									activeClassName="App_nav-link-active"
									className={classnames("App_nav-link", e[2])}>
									{e[1]}
								</NavLink>
							</span>
						))}
					</nav>
				</div>
			</div>
		</div>
		<div className="App_container">
			<Switch>
				<Route exact path="/" component={FeedPage}/>
				<Route path="/user/:id" component={UserPage}/>
				<Route path="/me" component={MePage}/>
				<Route path="/about" component={AboutPage}/>
				<Route path="*" component={NotFound}/>
			</Switch>
		</div>
	</div>
}

export default App;

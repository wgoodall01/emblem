import React from 'react';
import './App.css';
import { Helmet } from "react-helmet";
import {Route, Switch, Link} from "react-router-dom";
import "./App.css";

import FeedPage from "pages/Feed";
import UserPage from "pages/User";
import ComposePage from "pages/Compose";
import MePage from "pages/Me";
import AboutPage from "pages/About";


const NotFound = (props) => <div>
	<h1>404: Page not found</h1>
	<p>Go back, or try another link perhaps.</p>
</div>

const App = (props) => {
	const sep = <span className="App_nav-sep"/>
	return <div className="App_page">
		<Helmet defaultTitle="Emblem" titleTemplate="%s - Emblem">
			<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			<html lang="en"/>
		</Helmet>
		<div className="App_header">
			<Link to="/" className="App_title">Emblem</Link>
			<nav className="App_nav-links-container">
				{[
					["/about",      "About"],
					["/",           "Explore"],
					["/me",         "Me"],
					["/compose",    "Compose"],
				].map((e, i, arr) => {
					const link = <Link to={e[0]} className="App_nav-link">{e[1]}</Link>;
					return i===0?<span key={i}>{link}</span>
						:<span key={i}>{sep}{link}</span>;
				})}
			</nav>
		</div>

		<Switch>
			<Route exact path="/" component={FeedPage}/>
			<Route path="/user/:id" component={UserPage}/>
			<Route path="/me" component={MePage}/>
			<Route path="/compose" component={ComposePage}/>
			<Route path="/about" component={AboutPage}/>
			<Route path="*" component={NotFound}/>
		</Switch>
	</div>
}

export default App

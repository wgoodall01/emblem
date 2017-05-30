import React from 'react';
import ReactDOM from 'react-dom';
import App from 'pages/App';
import {createStore, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import thunk from "redux-thunk";
import {BrowserRouter as Router} from "react-router-dom";
import './index.css';
import {setCredentials} from "actions.js";

import reducer from "./reducer"
const store = createStore(reducer, applyMiddleware(thunk));

// For development
import {addPost, updateUser, updateFeed, loadFeed, loadUser} from "./actions.js";
if(process.env.NODE_ENV !== "production"){
	window.store = store;
	window.actions = {addPost, updateUser, updateFeed, loadFeed, loadUser};
}

// Load creds from localStorage if they're there
const storedCreds = window.localStorage.getItem("credentials");
if(storedCreds !== null){
	store.dispatch(setCredentials(JSON.parse(storedCreds)));
}

ReactDOM.render(
	<Provider store={store}>
		<Router>
			<App/>
		</Router>
	</Provider>,
  document.getElementById('root')
);

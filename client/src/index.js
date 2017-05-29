import React from 'react';
import ReactDOM from 'react-dom';
import App from 'pages/App';
import {createStore, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import thunk from "redux-thunk";
import {BrowserRouter as Router} from "react-router-dom";
import './index.css';

import reducer from "./reducer.js"
const store = createStore(reducer, applyMiddleware(thunk));

// For development
import {addPost, updateUser, updateFeed} from "./actions.js";
if(process.env.NODE_ENV !== "production"){
	window.store = store;
	window.actions = {addPost, updateUser, updateFeed};
}

ReactDOM.render(
	<Provider store={store}>
		<Router>
			<App/>
		</Router>
	</Provider>,
  document.getElementById('root')
);

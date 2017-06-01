import mainReducer from "./main.js";
import composeReducer from "./compose.js";
import credentialsReducer from "./credentials.js";

/*
 * Create the main reducer by 'overlaying' all the other reducers.
 * I know this isn't best practice, but it sort of happened organically.
 * In the future, I would use combineReducers() and more planning for this.
 */
const rootReducer = (state, action) => {
	state = mainReducer(state, action);
	state = composeReducer(state, action);
	state = credentialsReducer(state, action);
	return state;
}

export default rootReducer;

import mainReducer from "./main.js";
import composeReducer from "./compose.js";
import credentialsReducer from "./credentials.js";

// overlay the reducers on top of each other.
const rootReducer = (state, action) => {
	state = mainReducer(state, action);
	state = composeReducer(state, action);
	state = credentialsReducer(state, action);
	return state;
}

export default rootReducer;

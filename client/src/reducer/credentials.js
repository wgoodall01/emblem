// Actions:
// SET_CREDENTIALS: .public .private are parts of keypair

const defaultState = {unknown:true, isLoading:false};

const credentialsReducer = (state, action) => {
	const newCreds = Object.assign(defaultState, state.credentials);
	switch(action.type){
		case "SET_CREDENTIALS":
			newCreds.public = action.public;
			newCreds.private = action.private;
			newCreds.fingerprint = action.fingerprint;
			newCreds.isLoading= false
			newCreds.unknown = false;
			return {...state, credentials:newCreds};

		case "SET_CREDENTIALS_LOADING":
			newCreds.isLoading = true;
			return {...state, credentials:newCreds};

		default:
			return state.credentials?state:{...state, credentials:defaultState};
	}
}

export default credentialsReducer;

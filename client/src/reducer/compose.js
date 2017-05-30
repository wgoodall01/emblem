// Actions:
// UPDATE_DRAFT: .contents
// CLEAR_DRAFT:
// SUBMIT_DRAFT:

const defaultState = {
	contents:"", // Draft contents
	isLoading:false,         // http request stuff
	isError:false, err:"", // ...
	latestId:undefined // set this to something on successful post
}

const composeReducer = (state, action) => {
	const newCompose = Object.assign(defaultState, state.compose);
	switch(action.type){
		case "UPDATE_DRAFT":
			newCompose.contents = action.contents;
			return {...state, compose:newCompose};

		case "CLEAR_DRAFT":
			newCompose.contents = "";
			return {...state, compose:newCompose};

		case "RECEIVE_DRAFT_RESPONSE":
			newCompose.latestId = undefined;
			newCompose.isLoading = false;
			if(action.isError){
				newCompose.isError = true;
				newCompose.err = action.err;
			}else{
				newCompose.isError = false;
				newCompose.contents = "";
				newCompose.latestId = action.latestId;
			}
			return {...state, compose:newCompose};

		default: return state.compose?state:{...state, compose:defaultState};
	}
}

export default composeReducer;

import {combineReducers} from "redux";


const postsReducer = (state={}, action) => {
	switch(action.type){
		case "ADD_POST":
			const newPosts = Object.assign({}, state);
			newPosts[state.post.hash] = state.post;
			return newPosts;
	}
}

const feedsReducer = (state={}, action) => {
	switch(action.type){
		case "ADD_POST":
}

const rootReducer = combineReducers({
	posts:postsReducer,
	feeds:feedsReducer,
})

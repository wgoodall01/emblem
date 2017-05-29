// Possible actions
// 
// ADD_POST
// ADD_USER (also updates if same user)
// UPDATE_FEED (updates global feed)

// Sort function to sort posts by their timestamps.
// [...].sort(postDateComparator(state))
const postDateComparator = (state) => (postA, postB) => {
	const a = new Date(state.posts[postA].timestamp);
	const b = new Date(state.posts[postB].timestamp);
	if(a < b) { return  1 }
	if(a > b) { return -1 }
	return 0;
}

const emptyState = {
	posts:{}, // <hash>:<post>
	feed:{
		posts:[], // [<hash>]
		isLoading:true, isError:false, errorMsg:"",
	},
	users:{} // <fingerprint>:<user>
	/* "<fingerprint>":{
	 * 		posts:[], // [<hash>]
	 *		isLoading:true, isError:false, errorMsg:""
	 *		<other stuff>
	 * } */
}

const rootReducer = (state=emptyState, action={}) => {
	const newState = {...state};
	switch(action.type){
		case "UPDATE_USER":
			//{user:userObj}
			newState.users = {...newState.users};
			newState.users[action.user.fingerprint] = action.user;
			return newState;

		case "UPDATE_FEED":
			//{id:<fingerprint || null>, ids:[<existing post ids>]}
			let feed = undefined;
			let setFeed = undefined;
			if(action.id == null) {
				newState.feed = {...newState.feed}; // clone feed
				newState.feed.posts = [...newState.feed.posts] // clone posts
				feed = newState.feed.posts;
				setFeed = val => newState.feed.posts = val;
			} else {
				newState.users = {...newState.users}; // clone users
				newState.users[action.id] = {...(newState.users[action.id] || {})}; // clone user obj
				newState.users[action.id].posts = [...(newState.users[action.id].posts || [])] // clone posts
				feed = newState.users[action.id].posts;
				setFeed = val => newState.users[action.id].posts = val;
			}

			// Add posts array to feed
			action.ids.forEach(p => feed.push(p));

			// Remove duplicates.
			feed = [...new Set(feed)]

			// Sort posts by date
			// Posts have to already be in state for this.
			feed.sort(postDateComparator(state));
			
			setFeed(feed);
			return newState;

		case "ADD_POST":
			//{post:postObj}
			newState.posts = {...newState.posts};
			newState.posts[action.post.hash] = action.post;
			return newState;

		default: return newState;
	}
}


export default rootReducer;

/*
const rootReducer = combineReducers({
	posts:postsReducer,
	feed:feedReducer,
	users:usersReducer,
})

const postsReducer = (state={}, action) => {
	switch(action.type){
		case "ADD_POST":
			const newPosts = Object.assign({}, state);
			newPosts[action.post.hash] = action.post;
			return newPosts;
		default:
			return state;
	}
}

const feedReducer = (state=[], action) => {
	switch(action.type){
		case "UPDATE_FEED":
			// Include the new items in the sorted feed.
			const merged = [...action.feed, ...state].sort(postDateComparator(state));
		default:
			return state;
	}
}

const usersReducer = (state={}, action) => {
	switch(action.type){
		case "UPDATE_USER":
			const newUsers = Object.assign({}, state);
			newUsers[action.fingerprint] = action.user;
			return newUsers;
		default:
			return state;
	}
}
*/

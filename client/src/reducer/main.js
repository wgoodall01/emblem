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
		isLoading:false, isError:false, err:"",
		isEmpty:true
	},
	users:{} // <fingerprint>:<user>
	/* "<fingerprint>":{
	 * 		posts:[], // [<hash>]
	 *		isLoading:true, isError:false, errorMsg:""
	 *		<other stuff>
	 * } */
}

const mainReducer = (state=emptyState, action={}) => {
	const newState = {...state};
	let user;
	switch(action.type){
		case "SET_FEED_LOADING":
			newState.feed = {...newState.feed};
			newState.feed.isLoading= true;
			return newState;

		case "FEED_LOAD_RESULT":
			newState.feed = {...newState.feed};
			newState.feed.isLoading=false;
			newState.feed.isError=false;
			if(action.isError){
				newState.feed.isError = true;
				newState.feed.err = action.err;
			}
			return newState;

		case "SET_USER_LOADING":
			newState.users = {...newState.users};
			user = Object.assign({}, newState.users[action.fingerprint], action.user);
			user.isLoading = true;
			return newState;

		case "UPDATE_USER":
			//{user:userObj}
			const fingerprint = action.user.fingerprint
			newState.users = {...newState.users};
			user = Object.assign({}, newState.users[fingerprint], action.user);
			newState.users[fingerprint] = user;

			user.isLoading=false;
			user.isError=false;
			if(action.isError){
				user.isError = true;
				user.err = action.err;
			}
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

		default: return state;
	}
}


export default mainReducer;

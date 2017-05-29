
/**
 * Redux action to add a post to the store.
 *
 * @param post Object the post object to add.
 */
export function addPost(post){
	return {
		type:"ADD_POST",
		post
	}
}

/** 
 * Redux action to update a user in the store.
 *
 * @param user Object the user object to upsert.
 */
export function updateUser(user){
	return {
		type:"UPDATE_USER",
		user
	}
}


/**
 * Update a feed from a list of posts.
 *
 * @param id String null if feed, fingerprint if user.
 * @param posts Array Array of post objects.
 */
export function updateFeed(id, posts){
	return dispatch => {
		// Add the posts to the store
		posts.forEach(p => dispatch(addPost(p)));

		// Add the post IDs to a user
		const ids = posts.map(p => p.hash);
		dispatch({type:"UPDATE_FEED", id, ids});
	}
}

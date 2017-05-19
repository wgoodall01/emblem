const express = require("express");
const httpErrors = require("httperrors");



module.exports = (db) => {
	// DB is a connected instance of @google-cloud/datastore.

	const api = new express.Router();
	
	/**
	 * Gets a post.
	 *
	 * req: {content, timestamp, signature:sign(post) of author}
	 */
	api.get("/post/:id")
	
	/**
	 * Make a post.
	 *
	 * req: {content, signature:sign(content), fingerprint}
	 */
	api.post("/post");

	/**
	 * Get a user's feed.
	 *
	 * Query params: 
	 * &after=<<timestamp>> Limit posts.
	 *
	 * { posts:<<array, newest first>>, last: <<unix timestamp>> }
	 */
	api.get("/feed/:username")

	/** 
	 * Accounts can only be registered for the username.
	 * You could make an 'offline account' which is just a keypair-
	 * your username would be your key fingerprint.
	 *
	 * You could also attach a username to a keypair at a later date.
	 *
	 * req: {username, fingerprint, signature:sign(username)}
	 * res success: {username, }
	 * res failure: {}
	 */
	api.post("/user/register");

	/**
	 * Get a user by username/fingerprint.
	 *
	 * &after=<<unix timestamp>> for post listing.
	 * &count=<<number>> for posts. Default 50.
	 *
	 * response if exists: {username, bio, exists:true, 
	 * 			fingerprint, pubkey, signature:sign(username+bio)}
	 * response if not   : 404
	 */
	api.get("/user/:username");
	
	/**
	 * Deal with following/unfollowing users.
	 *
	 * request:{username, signature:sign(username) action:{"add"||"remove"}}
	 */
	api.post("/follow");

	/**
	 * List the users this person follows.
	 * 
	 * &user=<<fingerprint>>
	 *
	 */
	api.get("/follow"); // List following



	// 404 error for the API
	api.use((req, res, next)=>{
		next(httpErrors.NotFound("Resource not found"));
	})

	// Handle all errors with JSON for the API
	api.use((err, req, res, next) => {
		const status = parseInt(err.status) || 500;
		res.status(status).json({error:status, msg:err.message || err.msg})
	})

	return api;
}



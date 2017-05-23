const express = require("express");
const httpErrors = require("httperrors");
const crypto = require("crypto");
const cryptoUtils = require("./lib/cryptoUtils.js");

module.exports = (db) => {
	// DB is a connected instance of @google-cloud/datastore.

	const api = new express.Router();
	
	/**
	 * Gets a post.
	 *
	 * res: {author, content, timestamp, signature, pubkey}
	 */
	api.get("/post/:hash", (req, res)=>{
		//TODO validate passed hash
		const {hash} = req.params;
		console.log(hash)
		db.get(db.key(["Post", hash]))
			.then(result => {
				const {content, timestamp, signature, pubkey} = result[0];
				res.json({content, timestamp, signature, pubkey});
			})
			.catch(err => next(httpErrors[500]()))
	})
	
	/**
	 * Make a post.
	 *
	 * Post hashes are sha256(fingerprint+content);
	 *
	 * req: {content, signature:sign(hash), hash:hash(pubkey+content) pubkey}
	 * res: {id:<<post hash>>}
	 */
	api.post("/post", (req, res, next)=>{
		// Verify request
		const body = req.body;
		if([
			"content",
			"signature",
			"pubkey",
			"hash",
		].filter(k => !(k in body)).length > 0){
			next(httpErrors[400]("Doesn't have all required fields"));
		}
		
		// Calculate post hash
		const hash = cryptoUtils.hash(body.pubkey + body.content.toString());
		if(hash !== body.hash){return next(httpErrors[400]("Incorrect post hash."))}

		//TODO: Check that the pubkey is valid format
		// at the moment, crypto.verify just explodes

		// Check the signature
		const valid = cryptoUtils.verify(hash, body.signature, body.pubkey);
		if(!valid){return next(httpErrors[400](
			"Signature must be valid sign(sha256(pubkey+content))"))}
		
		const key = db.key(["Post", hash]);
		let post = {
			content: body.content.toString(),
			signature: body.signature.toString(),
			pubkey: body.pubkey.toString(),
			timestamp: new Date(),
		}
		
		db.save({key, data:post})
			.then(result => res.status(200).json({id:hash}) )
			.catch(err => next(httpErrors[500]()))
	});

	/**
	 * Get a user's feed.
	 *
	 * Query params: 
	 * &after=<<timestamp>> Limit posts.
	 *
	 * { posts:<<array, newest first>>, last: <<unix timestamp>> }
	 */
	api.get("/feed/:fingerprint")

	/**
	 * Get the feed of all users.
	 * Limits to 100 posts.
	 *
	 * Query params:
	 * &after=<<timestamp>> Limit posts.
	 *
	 * {posts:<<array, newest first>> last:<<unix timestamp>>}
	 */
	api.get("/feed", (req, res)=> {
		const query = db.createQuery("Post")
			.filter("timestamp", "<", new Date())
			.limit(100)

		db.runQuery(query)
			.then(results => res.json({
				posts: results[0].map(e => {
					const {signature, pubkey, content, timestamp} = e;
					return {signature, pubkey, content, timestamp};
				}),
				last: results[0][results[0].length-1].timestamp
			}))
			.catch(err => next(httpErrors[500]))
	})

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
		res.status(status).json({error:status, msg:err.message || err.msg});
		res.end();
		if(err.statusCode !== 400){console.log(err);}
	})

	return api;
}



const express = require("express");
const httpErrors = require("httperrors");
const crypto = require("crypto");
const cryptoUtils = require("./lib/cryptoUtils.js");

const isHex = /^[0-9a-f]+$/i;
const isPem = /^-----BEGIN RSA (PUBLIC|PRIVATE) KEY-----[A-z0-9/+\n]*-----END RSA (PUBLIC|PRVATE) KEY-----\n?$/;

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
	 * req: {content, signature:sign(hash), hash:hashlist(pubkey,content), pubkey}
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
		
		// Validate pem
		if(!body.pubkey.match(isPem))
			{return next(httpErrors[400]("Pubkey - Invalid PEM"))}
		
		// Validate the signature
		if(!body.signature.match(isHex))
			{return next(httpErrors[400]("Signature - Invalid hex"))}
		
		// Calculate post hash
		const hash = cryptoUtils.hashList([body.pubkey, body.content.toString()]);
		if(hash !== body.hash){return next(httpErrors[400]("Incorrect post hash."))}

		// Check the signature
		const valid = cryptoUtils.verify(hash, body.signature, body.pubkey);
		if(!valid){return next(httpErrors[400](
			"Signature must be valid sign(sha256(pubkey+content))"))}

		// Calculate the fingerprint for user identification.
		const fingerprint = cryptoUtils.hash(body.pubkey);
		
		const key = db.key([
			"User", fingerprint, // User entity, keyed off key fingerprint.
			"Post", hash         // Post entity, keyed off post hash.
		]);
		let post = {
			content: body.content.toString(),
			signature: body.signature.toString(),
			pubkey: body.pubkey.toString(),
			timestamp: new Date(),
		}
		
		db.save({key, data:post})
			.then(result => res.status(200).json({id:hash, fingerprint}))
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
	 * &before=<<timestamp>> Limit posts.
	 *
	 * {posts:<<array, newest first>> last:<<unix timestamp>>}
	 */
	api.get("/feed", (req, res)=> {
		const queryBefore = typeof req.query.before === "undefined"?
			new Date() // current time
			: new Date(req.query.before) 

		if(isNaN(queryBefore))
			{return next(httpErrors[400]("Invalid date in &after."))}

		const query = db.createQuery("Post")
			.filter("timestamp", "<", queryBefore)
			.order("timestamp", {descending:true})
			.limit(100)

		db.runQuery(query)
			.then(results => res.json({
				posts: results[0].map(e => {
					const {signature, pubkey, content, timestamp} = e;
					const hash = e[db.KEY].name;
					return {signature, hash, pubkey, content, timestamp};
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
	 * req: {username, bio, pubkey, signature:sign(hashList(pubkey,username,bio))}
	 * res success: {username, }
	 * res failure: {}
	 */
	api.post("/register", (req, res, next)=>{
		// Verify request
		const body = req.body;
		if([
			"username",
			"bio",
			"pubkey",
			"signature",
		].filter(k => !(k in body)).length > 0){
			next(httpErrors[400]("Doesn't have all required fields"));
		}

		// Validate pem
		if(!body.pubkey.match(isPem))
			{return next(httpErrors[400]("Pubkey - Invalid PEM"))}
		
		// Validate the signature
		if(!body.signature.match(isHex))
			{return next(httpErrors[400]("Signature - Invalid hex"))}

		// Verify that the signature is correct
		const hash = cryptoUtils.hashList([body.pubkey, body.username, body.bio]);
		const valid = cryptoUtils.verify(hash, body.signature, body.pubkey);
		if(!valid){return next(httpErrors[400]("Invalid request signature."))}

		const fingerprint = cryptoUtils.hash(body.pubkey);
		
		db.save({
			method:"upsert",
			key:db.key(["User", fingerprint]),
			data:{
				username: body.username,
				bio: body.bio,
				pubkey: body.pubkey,
				signature: body.signature,
			},
		})
			.then(result => res.json({fingerprint, username:body.username}))
			.catch(err => next(httpErrors[500]("Database error.")))
		
	});

	/**
	 * Get a user by username/fingerprint.
	 *
	 * &before=<<unix timestamp>> for post listing.
	 *
	 * response if exists: {username, bio, exists:true, 
	 * 			fingerprint, pubkey, signature:sign(hashlist(username+bio))}
	 * response if not   : 404
	 */
	api.get("/user/:id", (req, res, next) => {
		const queryBefore = typeof req.query.before === "undefined"?
			new Date() // current time
			: new Date(req.query.before) 

		if(isNaN(queryBefore))
			{return next(httpErrors[400]("Invalid date in &after."))}

		const id = req.params.id;
		const isFingerprint = 
			typeof id !== "undefined"
			&& !!id.match(isHex)
			&& id.length == 64;
		const isUsername = 
			typeof id !== "undefined"
			&& id.length < 64;

		if(!isUsername && !isFingerprint)
			{return next(httpErrors[400]("Invaild user identifier."))}
		
		(()=>{
			// Find the user
			if(isFingerprint){
				return Promise.resolve(db.key(["User", id]))
			}else if(isUsername){
				const query = db.createQuery("User")
					.filter("username", id);
				return db.runQuery(query)
					.then(res => console.dir(res))
			}
		})().then(userKey => {
			const userReq = db.get(userKey);

			const postsQuery = db.createQuery("Post")
				.hasAncestor(userKey)
				.filter("timestamp", "<", queryBefore)
				.order("timestamp", "desc")
				.limit(50);
			const postsReq = db.runQuery(postsQuery)

			return Promise.all([userReq, postsReq]);
		}).then(response => {
			const [userRes, postsRes] = response;
			const user = userRes[0];
			const posts = postsRes[0];
			res.json({
				user:user || {}, 
				posts
			});
		})

		// else{
		// 	// weird and funky.
		// 	return next(httpErrors[400]("Invalid user identifier."))
		// }

	});
	
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



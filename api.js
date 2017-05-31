const express = require("express");
const httpErrors = require("httperrors");
const crypto = require("crypto");
const cryptoUtils = require("./lib/cryptoUtils.js");



module.exports = (db) => {
	// DB is a connected instance of @google-cloud/datastore.

	const api = new express.Router();
	
	const isHex = /^[0-9a-f]+$/i;
	const isPem = /^-----BEGIN RSA (PUBLIC|PRIVATE) KEY-----[A-z0-9/+\n]*-----END RSA (PUBLIC|PRVATE) KEY-----\n?$/;

	/**
	 * Takes post as db Entity, and processes it for the client.
	 *
	 * If fetchUserInfo is passed, it will fetch the username/other info
	 * and put it under the `user` key. This makes the function async --
	 * it will return a Promise instead of the value.
	 *
	 * @param Object post The post to process
	 * @param Boolean fetchUserInfo Fetch user info or not.
	 * @returns Promise the processed post.
	 */
	const processPost = (post, fetchUserInfo=false) => {
		const {signature, pubkey, contents, timestamp} = post;
		let p = {signature, pubkey, contents, timestamp};
		p.hash = post[db.KEY].name;
		p.fingerprint = cryptoUtils.hash(pubkey);

		if(fetchUserInfo){
			return db.get(db.key(["User", p.fingerprint]))
				.then(result => result[0])
				.then(result => {
					if(typeof result !== "undefined"){
						p.username = result.username;
						p.bio = result.bio;
					}
					return p
				})
		}else{
			return Promise.resolve(p);
		}
	}
	
	/**
	 * Gets a post.
	 *
	 * res: {author, contents, timestamp, signature, pubkey}
	 * Can return: 200, 404.
	 */
	api.get("/post/:hash", (req, res, next)=>{
		//TODO validate passed hash
		const {hash} = req.params;
		db.get(db.key(["Post", hash]))
			.then(result => {
				if(typeof result[0] === "undefined"){
					res.status(404).json({});
				}else{
					processPost(result[0], true)
						.then(post => res.json(post))
				}
			})
			.catch(err => next(httpErrors[500](err)))
	})
	
	/**
	 * Make a post.
	 *
	 * Post hashes are sha256(fingerprint+contents);
	 *
	 * req: {contents, signature:sign(hash), hash:hashlist(pubkey,contents), pubkey}
	 * res: {id:<<post hash>>}
	 */
	api.post("/post", (req, res, next)=>{
		// Verify request
		const body = req.body;
		if([
			"contents",
			"signature",
			"pubkey",
			"hash",
		].filter(k => !(k in body)).length > 0){
			return next(httpErrors[400]("Doesn't have all required fields"));
		}
		
		// Validate pem
		if(!body.pubkey.match(isPem))
			{return next(httpErrors[400]("Pubkey - Invalid PEM"))}
		
		// Validate the signature
		if(!body.signature.match(isHex))
			{return next(httpErrors[400]("Signature - Invalid hex"))}
		
		// Calculate post hash
		const hash = cryptoUtils.hashList([body.pubkey, body.contents.toString()]);
		if(hash !== body.hash){return next(httpErrors[400]("Incorrect post hash."))}

		// Check the signature
		const valid = cryptoUtils.verify(hash, body.signature, body.pubkey);
		if(!valid){return next(httpErrors[400](
			"Signature must be valid sign(hashList(pubkey,contents))"))}
		

		// Calculate the fingerprint for user identification.
		const fingerprint = cryptoUtils.hash(body.pubkey);
		
		const key = db.key([
			"User", fingerprint, // User entity, keyed off key fingerprint.
			"Post", hash         // Post entity, keyed off post hash.
		]);
		let post = {
			contents: body.contents.toString(),
			signature: body.signature.toString(),
			pubkey: body.pubkey.toString(),
			timestamp: new Date(),
		}
		
		db.save({key, data:post})
			.then(result => res.status(200).json(Object.assign({fingerprint, hash}, post)))
			.catch(err => next(httpErrors[500](err)))
	});

	/**
	 * Get the feed of all users.
	 * Limits to 100 posts.
	 *
	 * Query params:
	 * &before=<<timestamp>> Limit posts.
	 *
	 * {posts:<<array, newest first>> last:<<unix timestamp>>}
	 */
	api.get("/feed", (req, res, next)=> {
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
			.then(results => Promise.all(results[0].map(p => processPost(p, true))))
			.then(results => res.json({
				posts: results,
				last: results[results.length-1].timestamp
			}))
			.catch(err => next(httpErrors[500](err)))
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
			return next(httpErrors[400]("Doesn't have all required fields"));
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

		const data = {
			username: body.username,
			bio: body.bio,
			pubkey: body.pubkey,
			signature: body.signature,
		};

		db.save({
			method:"upsert",
			key:db.key(["User", fingerprint]),
			data
		})
			.then(result => res.json(Object.assign({fingerprint}, data)))
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
		// Get date from query
		const queryBefore = typeof req.query.before === "undefined"?
			new Date() // current time
			: new Date(req.query.before) 
		if(isNaN(queryBefore))
			{return next(httpErrors[400]("Invalid date in &after."))}
		
		// Query identifier
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
		
		// Get the user key from Datastore.
		const getUserByIdentifier = (id, isFingerprint) => {
			if(isFingerprint){
				return Promise.resolve(db.key(["User", id]))
			}else if(isUsername){
				const query = db.createQuery("User")
					.filter("username", id)
					.limit(1);
				return db.runQuery(query)
					.then(result => {
						if(result[0].length === 0){
							return Promise.reject(httpErrors[404]("User not found."))
						}else{
							return Promise.resolve(result[0][0][db.KEY]);
						}
					})
			}
		}
		
		// Get the user data from Datastore
		const getUserData = (userKey) => {
			const userReq = db.get(userKey)
				.then(result => result[0]);

			const postsQuery = db.createQuery("Post")
				.hasAncestor(userKey)
				.filter("timestamp", "<", queryBefore)
				.order("timestamp", "desc")
				.limit(50);
			const postsReq = db.runQuery(postsQuery)
				.then(result => Promise.all(result[0].map(processPost)))

			return Promise.all([userReq, postsReq]);
		}
		
		getUserByIdentifier(id, isFingerprint)
			.then(getUserData)
			.then(response => {
				res.json({
					user: response[0] || {}, 
					posts: response[1]
				});
			})
			.catch(err => {
				if(err.HttpError){
					next(err);
				}else{
					next(httpErrors[500](err))
				}
			})
	});
	

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



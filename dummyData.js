#!/usr/bin/env node
const cu = require("./lib/cryptoUtils.js");
const fs = require("fs");
const rp = require("request-promise-native");


// Config and stuff
const LOGGING = true;
const URI = "http://localhost:8080/api"
const DATA_CACHE = "./__dummyData.json";


const log = (...args) => {
	if(LOGGING){
		console.log(...args)
	}
};

const mkUser = (name) => {
	if(!(name in users)){
		// Generate a keypair for the user
		const start = new Date();
		userKeys[name] = cu.generate();
		const end = new Date();
		log(`Generated: key for ${name} in ${(end-start)/1000}s`);
		
		let user = {};
		user.username=name;
		user.pubkey = userKeys[name].public;
		user.bio=`This is a fascinating bio about ${name}`;

		const hash = cu.hashList([user.pubkey, user.username, user.bio]);
		user.signature = cu.sign(hash, userKeys[name].private);
		users[name] = user;
	}
}

const mkPost = (user, contents) => {
	mkUser(user);

	const kp = userKeys[user];
	const hash = cu.hashList([kp.public, contents]);
	const signature = cu.sign(hash, kp.private);

	log(`Post: "${contents}" -- ${user}`);
	return {contents, pubkey:kp.public, hash, signature};
}

let [users, userKeys, postList] = [null, null, null];
if(fs.existsSync(DATA_CACHE)){
	const data = JSON.parse(fs.readFileSync(DATA_CACHE, "utf-8"));
	users = data.users;
	userKeys = data.userKeys;
	postList = data.postList;
	log(" --- Data loaded from disk --- ");
}else{
	log(" --- No cache: generating data --- ");
	users = {};
	userKeys = {};
	postList = [
		mkPost("Bob", "This is the first post"),
		mkPost("Janet", "This is the second post"),
		mkPost("Bob", "This is Bob's reply"),
		mkPost("Janet", "This is janet's reply"),
		mkPost("another guy", "I'm running out of ideas for creative posts now"),
	]
	// Save the users' data to disk
	fs.writeFileSync(DATA_CACHE, JSON.stringify({postList, users, userKeys}, null, 4))
	log(" --- Data written to disk --- ");
}



// Run the data through the app
const submitPost = (post) => rp({uri:`${URI}/post`, method:"POST", body:post, json:true})
const registerUser = (user) => rp({uri:`${URI}/register`, method:"POST", body:user, json:true})

const postReqs = postList.map(submitPost);
const registerReqs = Object.values(users).map(registerUser);

const allReqs = Promise.all([
	Promise.all(postReqs),
	Promise.all(registerReqs)
])

allReqs.then(response => {
	log("Submit: Success!");
	const [postResp, registerResp] = response;
	postResp.forEach(r => log(`200: ${JSON.stringify(r)}`))
	registerResp.forEach(r => log(`200: ${JSON.stringify(r)}`))
})

allReqs.catch(err => {
	log("Submit: Failure!");
	log(`${err.statusCode}: ${JSON.stringify(err.error)}`) })

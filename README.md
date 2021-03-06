# emblem
PoC for a cryptographic Twitter clone.

## What is Is
Emblem was my final project for AP CS. It implements a very limited version of Twitter, where every single aspect of the site is backed with crypto. Every user is represented by a keypair, every post is signed for authenticity, and every action a user can take is verified against this keypair. It is impossible for the owner of the site to make any change, or do anything, on behalf of any user, because each client verifies that all data the server sends is signed by its author.

When a user signs up for the service, they generate an RSA keypair which stays on the client. Then, to make a post or change their profile, they sign that request with the keypair. The server uses this signature to authenticate the change, and also gives the signature out along with the data any time a client requests it. It is impossible for a malicious sysadmin to falsify or modify any content.

Because I had to put this together in like a week and a half, it isn't perfect. There is no kind of protection against the server administrator *deleting* anything, so the platform can't prevent censorship. There isn't a way to sign in and out of an account short of ripping the keypair from LocalStorage. If you lose your keys, you're hosed. It isn't a production-ready social network, but I think it's a pretty neat proof-of-concept of a zero-trust microblogging platform.

## Architecture
It has two main parts -- the server, running on App Engine, and the client, implemented as React SPA. The server talks to the database (Cloud Datastore), storing posts and validating API requests. The client talks to the server over a REST API, using its keypair to authenticate everything. 
